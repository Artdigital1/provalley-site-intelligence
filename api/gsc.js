// GET /api/gsc?siteUrl=https://...&range=28[&aggregate=true][&limit=25]
// Credentials — set ONE of:
//   GOOGLE_SERVICE_ACCOUNT_B64  — entire service account JSON, base64-encoded (preferred)
//   GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY  — legacy individual vars
import { GoogleAuth } from 'google-auth-library'

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_B64) {
    const sa = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
    )
    return { client_email: sa.client_email, private_key: sa.private_key }
  }
  return {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: (process.env.GOOGLE_PRIVATE_KEY ?? '')
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n'),
  }
}

function makeAuth() {
  return new GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
}

function dateRange(days) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  const fmt = d => d.toISOString().slice(0, 10)
  return { startDate: fmt(start), endDate: fmt(end) }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { siteUrl, range = '28', aggregate, limit = '25' } = req.query ?? {}
  if (!siteUrl) return res.status(400).json({ error: '`siteUrl` required' })

  const hasCreds = process.env.GOOGLE_SERVICE_ACCOUNT_B64 ||
    (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
  if (!hasCreds) {
    return res.status(503).json({ error: 'GSC credentials not configured' })
  }

  const { startDate, endDate } = dateRange(parseInt(range))
  const isAggregate = aggregate === 'true' || aggregate === '1'

  try {
    const client = await makeAuth().getClient()
    const { token } = await client.getAccessToken()

    const body = {
      startDate,
      endDate,
      rowLimit: isAggregate ? 1 : parseInt(limit),
      dataState: 'all',
      ...(isAggregate ? {} : { dimensions: ['query'] }),
    }

    const apiRes = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      }
    )

    const json = await apiRes.json()
    if (!apiRes.ok) throw new Error(json.error?.message ?? `GSC ${apiRes.status}`)

    if (isAggregate) {
      const r = json.rows?.[0] ?? {}
      return res.status(200).json({
        clicks:      Math.round(r.clicks      ?? 0),
        impressions: Math.round(r.impressions ?? 0),
        ctr:         r.ctr != null ? `${(r.ctr * 100).toFixed(1)}%` : '0.0%',
        avgPosition: r.position != null ? parseFloat(r.position.toFixed(1)) : 0,
        startDate,
        endDate,
      })
    }

    const rows = (json.rows ?? []).map(r => ({
      keyword:     r.keys[0],
      clicks:      Math.round(r.clicks),
      impressions: Math.round(r.impressions),
      ctr:         `${(r.ctr * 100).toFixed(1)}%`,
      position:    parseFloat(r.position.toFixed(1)),
    }))

    return res.status(200).json({ rows, startDate, endDate, rowCount: rows.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
