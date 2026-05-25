// GET /api/ga4?propertyId=123456789&range=28
// Returns sessions, users, conversions with period-over-period % change.
//
// Credentials (Vercel env vars):
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN  — generated once via scripts/get-refresh-token.mjs
import { OAuth2Client } from 'google-auth-library'

function makeAuth() {
  const client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  )
  client.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN })
  return client
}

function getDateRanges(days) {
  const fmt = d => d.toISOString().slice(0, 10)
  const today = new Date()

  const currEnd   = new Date(today)
  const currStart = new Date(today)
  currStart.setDate(currEnd.getDate() - days)

  const prevEnd   = new Date(currStart)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevEnd.getDate() - days + 1)

  return {
    current:    { startDate: fmt(currStart), endDate: fmt(currEnd),  name: 'current'    },
    comparison: { startDate: fmt(prevStart), endDate: fmt(prevEnd),  name: 'comparison' },
  }
}

function pctChange(curr, prev) {
  if (!prev || prev === 0) return null
  return parseFloat(((curr - prev) / prev * 100).toFixed(1))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { propertyId, range = '28' } = req.query ?? {}
  if (!propertyId) return res.status(400).json({ error: '`propertyId` required' })

  const hasCreds = process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN
  if (!hasCreds) {
    return res.status(503).json({ error: 'GA4 credentials not configured' })
  }

  const { current, comparison } = getDateRanges(parseInt(range))

  try {
    const client = makeAuth()
    const { token } = await client.getAccessToken()

    const apiRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [current, comparison],
          metrics: [
            { name: 'sessions'    },
            { name: 'activeUsers' },
            { name: 'conversions' },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      }
    )

    const data = await apiRes.json()
    if (!apiRes.ok) throw new Error(data.error?.message ?? `GA4 ${apiRes.status}`)

    const rows = data.rows ?? []
    const find = name => rows.find(r => r.dimensionValues?.[0]?.value === name)
    const vals = row => {
      const v = row?.metricValues ?? []
      const n = i => Math.round(parseFloat(v[i]?.value ?? '0'))
      return { sessions: n(0), users: n(1), conversions: n(2) }
    }

    const curr = vals(find('current'))
    const prev = vals(find('comparison'))

    return res.status(200).json({
      ...curr,
      changes: {
        sessions:    pctChange(curr.sessions,    prev.sessions),
        users:       pctChange(curr.users,       prev.users),
        conversions: pctChange(curr.conversions, prev.conversions),
      },
      startDate: current.startDate,
      endDate:   current.endDate,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
