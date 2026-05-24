// Vercel serverless function — GET /api/audit?url=https://example.com
// Fetches the page, extracts links, probes each with HEAD, returns broken ones.

const SKIP_DOMAINS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'accounts.google.com']
const MAX_LINKS = 40
const BATCH_SIZE = 10
const UA = 'ProValley-SiteAudit/1.0'

function toAbsolute(href, base) {
  try { return new URL(href, base).href } catch { return null }
}

async function getLinks(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': UA },
    })
    const html = await res.text()
    return [...html.matchAll(/(?:href|src)=["']([^"'#\s][^"']*?)["']/gi)].map(m => m[1])
  } catch {
    return []
  }
}

async function probe(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': UA },
    })
    // Some servers reject HEAD — retry with GET on 405
    if (res.status === 405) {
      const res2 = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': UA, Range: 'bytes=0-0' },
      })
      return res2.status
    }
    return res.status
  } catch {
    return 0
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { url } = req.query ?? {}
  if (!url) return res.status(400).json({ error: '`url` query param required' })

  let parsedBase
  try {
    parsedBase = new URL(url)
    if (!['http:', 'https:'].includes(parsedBase.protocol)) throw new Error()
  } catch {
    return res.status(400).json({ error: 'Invalid URL — must be http or https' })
  }

  // Collect links from the homepage
  const rawLinks = await getLinks(url)
  const seen = new Set()
  const toCheck = []

  for (const raw of rawLinks) {
    if (!raw) continue
    const lower = raw.toLowerCase()
    if (lower.startsWith('mailto:') || lower.startsWith('tel:') ||
        lower.startsWith('javascript:') || lower.startsWith('data:')) continue

    const abs = toAbsolute(raw, url)
    if (!abs || seen.has(abs)) continue
    if (SKIP_DOMAINS.some(d => abs.includes(d))) continue
    seen.add(abs)
    toCheck.push(abs)
  }

  const limited = toCheck.slice(0, MAX_LINKS)
  const broken = []

  for (let i = 0; i < limited.length; i += BATCH_SIZE) {
    const batch = limited.slice(i, i + BATCH_SIZE)
    const statuses = await Promise.all(batch.map(probe))
    for (let j = 0; j < batch.length; j++) {
      const status = statuses[j]
      if (status === 0 || status >= 400) {
        broken.push({ url: batch[j], status })
      }
    }
  }

  return res.status(200).json({
    url,
    checkedCount: limited.length,
    totalFound: toCheck.length,
    capped: toCheck.length > MAX_LINKS,
    brokenLinks: broken,
    scannedAt: new Date().toISOString(),
  })
}
