// GET /api/crawl?siteUrl=https://example.com[&limit=50]
// BFS crawl up to `limit` pages of the same origin.
// Returns per-page: title, metaDesc, h1, canonical, status, wordCount, size, issues.
import { parse } from 'node-html-parser'

export const config = { maxDuration: 60 }

const BOT_UA = 'ProValleyBot/1.0'

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': BOT_UA },
      signal: AbortSignal.timeout(8000),
    })
    const html = res.headers.get('content-type')?.includes('text/html')
      ? await res.text()
      : ''
    return { ok: true, status: res.status, finalUrl: res.url, html, size: html.length }
  } catch (err) {
    return { ok: false, status: 0, finalUrl: url, html: '', size: 0, error: err.message }
  }
}

function extractLinks(root, pageUrl, origin) {
  return root.querySelectorAll('a[href]')
    .map(a => {
      try {
        const u = new URL(a.getAttribute('href'), pageUrl)
        u.hash = ''
        if (u.origin !== origin) return null
        if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
        return u.href
      } catch { return null }
    })
    .filter(Boolean)
}

function auditPage(originalUrl, { ok, status, finalUrl, html, size, error }) {
  const issues = []
  const page = {
    url: originalUrl,
    finalUrl: finalUrl !== originalUrl ? finalUrl : null,
    status,
    size,
    title: '',
    metaDesc: '',
    h1: '',
    h1Count: 0,
    canonical: '',
    wordCount: 0,
    issues,
    _links: [],
  }

  if (!ok || !html) {
    issues.push(status === 404 ? '404' : status === 0 ? 'timeout' : `http_${status}`)
    return page
  }

  if (page.finalUrl) issues.push('redirect')

  try {
    const root = parse(html)

    const titleEl  = root.querySelector('title')
    page.title = titleEl?.text?.trim() ?? ''
    if (!page.title)              issues.push('missing_title')
    else if (page.title.length > 60)  issues.push('title_too_long')

    const metaEl = root.querySelector('meta[name="description"]') ??
                   root.querySelector('meta[name="Description"]')
    page.metaDesc = metaEl?.getAttribute('content')?.trim() ?? ''
    if (!page.metaDesc)                   issues.push('missing_meta_desc')
    else if (page.metaDesc.length > 160)  issues.push('meta_desc_too_long')

    const h1Els = root.querySelectorAll('h1')
    page.h1Count = h1Els.length
    page.h1 = h1Els[0]?.text?.trim().replace(/\s+/g, ' ') ?? ''
    if (h1Els.length === 0)  issues.push('missing_h1')
    else if (h1Els.length > 1) issues.push('multiple_h1')

    const canonEl = root.querySelector('link[rel="canonical"]')
    page.canonical = canonEl?.getAttribute('href')?.trim() ?? ''
    if (!page.canonical) issues.push('no_canonical')

    const body = root.querySelector('body')
    page.wordCount = (body?.text ?? root.text)
      .split(/\s+/).filter(w => w.length > 1).length

    page._links = extractLinks(root, originalUrl, new URL(originalUrl).origin)
  } catch {
    issues.push('parse_error')
  }

  return page
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { siteUrl, limit = '50' } = req.query ?? {}
  if (!siteUrl) return res.status(400).json({ error: '`siteUrl` required' })

  const maxPages = Math.min(parseInt(limit) || 50, 100)
  let startUrl
  try {
    const u = new URL(siteUrl)
    u.hash = ''
    startUrl = u.href
  } catch {
    return res.status(400).json({ error: 'Invalid siteUrl' })
  }

  const origin  = new URL(startUrl).origin
  const visited = new Set()
  const queue   = [startUrl]
  const pages   = []

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()
    if (visited.has(url)) continue
    visited.add(url)

    const fetched = await fetchPage(url)
    const page    = auditPage(url, fetched)
    pages.push(page)

    if (fetched.ok && fetched.html) {
      for (const link of page._links) {
        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link)
        }
      }
    }
  }

  const summary = {
    totalPages:     pages.length,
    withIssues:     pages.filter(p => p.issues.length > 0).length,
    errors4xx:      pages.filter(p => p.status >= 400 && p.status < 500).length,
    redirects:      pages.filter(p => p.issues.includes('redirect')).length,
    missingTitle:   pages.filter(p => p.issues.includes('missing_title')).length,
    missingMeta:    pages.filter(p => p.issues.includes('missing_meta_desc')).length,
    noCanonical:    pages.filter(p => p.issues.includes('no_canonical')).length,
    missingH1:      pages.filter(p => p.issues.includes('missing_h1')).length,
    multipleH1:     pages.filter(p => p.issues.includes('multiple_h1')).length,
  }

  // Strip internal links from response
  return res.status(200).json({
    siteUrl: startUrl,
    crawledAt: new Date().toISOString(),
    summary,
    pages: pages.map(({ _links, ...p }) => p),
  })
}
