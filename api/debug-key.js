// Temporary diagnostic — remove after key issue is resolved
export default function handler(req, res) {
  const raw   = process.env.GOOGLE_PRIVATE_KEY ?? ''
  const clean = raw.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')

  res.status(200).json({
    email:        process.env.GOOGLE_CLIENT_EMAIL ?? '(missing)',
    raw_length:   raw.length,
    clean_length: clean.length,
    raw_first30:  raw.slice(0, 30),
    raw_last20:   raw.slice(-20),
    clean_first50: clean.slice(0, 50),
    has_begin:    clean.includes('-----BEGIN'),
    has_end:      clean.includes('-----END'),
    newline_count: (clean.match(/\n/g) ?? []).length,
  })
}
