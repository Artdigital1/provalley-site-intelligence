// GET /api/ga4?propertyId=123456789&range=28
// Returns sessions, users, conversions with period-over-period % change.
// Requires same service account as GSC:
//   GOOGLE_CLIENT_EMAIL — service account email
//   GOOGLE_PRIVATE_KEY  — service account private key (literal \n in env)
import { google } from 'googleapis'

function makeAuth() {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '')
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n')
  return new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/analytics.readonly']
  )
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

  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return res.status(503).json({ error: 'GA4 credentials not configured' })
  }

  const { current, comparison } = getDateRanges(parseInt(range))

  try {
    const auth = makeAuth()
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth })

    const { data } = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [current, comparison],
        dimensions: [{ name: 'dateRange' }],
        metrics: [
          { name: 'sessions'    },
          { name: 'activeUsers' },
          { name: 'conversions' },
        ],
      },
    })

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
