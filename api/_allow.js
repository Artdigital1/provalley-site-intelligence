// Only data for sites listed in src/data.js may be requested.
// Without this, these public endpoints would proxy ANY GSC/GA4 property the
// connected Google account can see, and let anyone use the crawler on any URL.
import { SITES } from '../src/data.js'

const host = (u) => { try { return new URL(u.startsWith('sc-domain:') ? `https://${u.slice(10)}` : u).hostname.replace(/^www\./, '') } catch { return null } }
const HOSTS = new Set(SITES.flatMap((s) => [s.url, s.psiUrl, s.crawlUrl].filter(Boolean).map(host)))
const GSC = new Set(SITES.map((s) => s.url))
const GA4 = new Set(SITES.map((s) => s.ga4PropertyId).filter(Boolean).map(String))

export const allowGsc = (siteUrl) => GSC.has(siteUrl)
export const allowGa4 = (id) => GA4.has(String(id))
export const allowUrl = (u) => { const h = host(u || ''); return !!h && [...HOSTS].some((a) => h === a || h.endsWith(`.${a}`)) }
export const deny = (res) => res.status(403).json({ error: 'Not an allowed site' })
