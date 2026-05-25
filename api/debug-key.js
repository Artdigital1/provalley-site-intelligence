// Temporary diagnostic — remove after credential issue is resolved
export default function handler(req, res) {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64 ?? ''

  let b64Status = 'not set'
  let b64Email  = null
  let b64KeyStart = null
  let b64KeyNewlines = null

  if (b64) {
    try {
      const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
      b64Email      = sa.client_email ?? '(missing in JSON)'
      b64KeyStart   = (sa.private_key ?? '').slice(0, 40)
      b64KeyNewlines = (sa.private_key?.match(/\n/g) ?? []).length
      b64Status     = 'ok'
    } catch (e) {
      b64Status = `parse error: ${e.message}`
    }
  }

  const rawKey   = process.env.GOOGLE_PRIVATE_KEY ?? ''
  const cleanKey = rawKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')

  res.status(200).json({
    b64_var_set:        !!b64,
    b64_length:         b64.length,
    b64_status:         b64Status,
    b64_email:          b64Email,
    b64_key_start:      b64KeyStart,
    b64_key_newlines:   b64KeyNewlines,
    legacy_email:       process.env.GOOGLE_CLIENT_EMAIL ?? '(missing)',
    legacy_key_length:  rawKey.length,
    legacy_key_has_begin: cleanKey.includes('-----BEGIN'),
    legacy_key_newlines:  (cleanKey.match(/\n/g) ?? []).length,
    active_source: b64 ? 'GOOGLE_SERVICE_ACCOUNT_B64' : 'legacy vars',
  })
}
