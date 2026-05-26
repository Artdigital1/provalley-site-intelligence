export const SITES = [
  {
    id: 'kmg',
    name: 'KMG Fine Jewelers',
    url: 'sc-domain:kmgfinejewelers.com',
    psiUrl: 'https://kmgfinejewelers.com',
    ga4: 'G-3E16GFRNJF',
    // Numeric property ID for GA4 Data API — find in GA4 Admin → Property Settings → Property ID
    ga4PropertyId: '535570624',
  },
  {
    id: 'fhtv',
    name: 'Fishing Hunting TV',
    url: 'https://fishinghuntingtv.com',
    ga4: null,
    ga4PropertyId: '422471533',
  },
  {
    id: 'provalley',
    name: 'ProValley Digital',
    url: 'https://provalleydigitalmarketing.com',
    ga4: null,
    ga4PropertyId: '440841647',
  },
]

export const MOCK_DATA = {
  kmg: {
    overview: {
      sessions:     { value: '4,231',  change: 12.4 },
      users:        { value: '2,890',  change: 9.8  },
      conversions:  { value: '47',     change: 22.3 },
      clicks:       { value: '1,847',  change: 8.2  },
      impressions:  { value: '28,540', change: 22.1 },
      avgPosition:  { value: '14.3',   change: -2.1, lowerIsBetter: true },
      cwvScore:     { value: 72,       change: 5    },
    },
    searchPerf: [
      { keyword: 'fine jewelry mcallen tx',        clicks: 234, impressions: 1840, ctr: '12.7%', position: 3.2  },
      { keyword: 'engagement rings rgv',            clicks: 187, impressions: 2310, ctr: '8.1%',  position: 5.4  },
      { keyword: 'custom jewelry design mcallen',   clicks: 143, impressions: 980,  ctr: '14.6%', position: 4.1  },
      { keyword: 'jewelry store edinburg tx',       clicks: 98,  impressions: 1450, ctr: '6.8%',  position: 8.7  },
      { keyword: 'diamond rings south texas',       clicks: 76,  impressions: 2100, ctr: '3.6%',  position: 11.2 },
    ],
    cwv: {
      lcp:  { value: '2.8s',  status: 'needs-improvement', label: 'Largest Contentful Paint', threshold: '< 2.5s good' },
      cls:  { value: '0.05',  status: 'good',              label: 'Cumulative Layout Shift',   threshold: '< 0.1 good'  },
      inp:  { value: '180ms', status: 'good',              label: 'Interaction to Next Paint', threshold: '< 200ms good'},
      fcp:  { value: '1.4s',  status: 'good',              label: 'First Contentful Paint',    threshold: '< 1.8s good' },
      ttfb: { value: '380ms', status: 'needs-improvement', label: 'Time to First Byte',        threshold: '< 800ms good'},
    },
    audit: {
      lastScan: '2026-05-22',
      score: 84,
      issues: [
        { type: 'error',   label: 'Broken links',              count: 2,  detail: '2 internal links returning 404' },
        { type: 'warning', label: 'Missing alt text',          count: 6,  detail: '6 images missing descriptive alt attributes' },
        { type: 'warning', label: 'Large uncompressed images', count: 3,  detail: '3 images > 500 KB not optimized' },
        { type: 'info',    label: 'Missing meta description',  count: 1,  detail: '1 page missing meta description tag' },
      ],
    },
  },

  fhtv: {
    overview: {
      sessions:     { value: '2,890',  change: -3.2 },
      users:        { value: '1,940',  change: -4.1 },
      conversions:  { value: '12',     change: -8.3 },
      clicks:       { value: '643',    change: 1.8  },
      impressions:  { value: '12,310', change: 7.4  },
      avgPosition:  { value: '22.7',   change: 1.3,  lowerIsBetter: true },
      cwvScore:     { value: 51,       change: -4   },
    },
    searchPerf: [
      { keyword: 'texas outdoor lifestyle tv',   clicks: 98, impressions: 740,  ctr: '13.2%', position: 4.1  },
      { keyword: 'fishing hunting show texas',   clicks: 74, impressions: 1230, ctr: '6.0%',  position: 9.3  },
      { keyword: 'south texas hunting tv show',  clicks: 61, impressions: 980,  ctr: '6.2%',  position: 7.8  },
      { keyword: 'rgv fishing guide',            clicks: 43, impressions: 1870, ctr: '2.3%',  position: 14.6 },
      { keyword: 'texas outdoor tv network',     clicks: 38, impressions: 2100, ctr: '1.8%',  position: 18.2 },
    ],
    cwv: {
      lcp:  { value: '4.2s',  status: 'poor',              label: 'Largest Contentful Paint', threshold: '< 2.5s good' },
      cls:  { value: '0.18',  status: 'needs-improvement', label: 'Cumulative Layout Shift',   threshold: '< 0.1 good'  },
      inp:  { value: '380ms', status: 'needs-improvement', label: 'Interaction to Next Paint', threshold: '< 200ms good'},
      fcp:  { value: '2.1s',  status: 'needs-improvement', label: 'First Contentful Paint',    threshold: '< 1.8s good' },
      ttfb: { value: '620ms', status: 'poor',              label: 'Time to First Byte',        threshold: '< 800ms good'},
    },
    audit: {
      lastScan: '2026-05-22',
      score: 61,
      issues: [
        { type: 'error',   label: 'Slow page speed',          count: 1,  detail: 'LCP 4.2s — well above 2.5s threshold' },
        { type: 'error',   label: 'Broken links',             count: 3,  detail: '3 links returning errors (1 now fixed)' },
        { type: 'warning', label: 'Missing alt text',         count: 14, detail: '14 images missing alt attributes' },
        { type: 'warning', label: 'Large uncompressed images',count: 8,  detail: '8 images slowing load time' },
        { type: 'warning', label: 'No sitemap submitted',     count: 1,  detail: 'XML sitemap not found in Search Console' },
      ],
    },
  },

  provalley: {
    overview: {
      sessions:     { value: '1,102', change: 31.4 },
      users:        { value: '780',   change: 28.7 },
      conversions:  { value: '8',     change: 60.0 },
      clicks:       { value: '318',   change: 44.2 },
      impressions:  { value: '9,870', change: 28.7 },
      avgPosition:  { value: '18.1',  change: -4.3, lowerIsBetter: true },
      cwvScore:     { value: 86,      change: 8    },
    },
    searchPerf: [
      { keyword: 'google ads agency mcallen tx',  clicks: 54, impressions: 320, ctr: '16.9%', position: 2.8  },
      { keyword: 'ppc management mcallen',        clicks: 41, impressions: 280, ctr: '14.6%', position: 3.4  },
      { keyword: 'digital marketing agency rgv',  clicks: 38, impressions: 470, ctr: '8.1%',  position: 5.1  },
      { keyword: 'google ads agency san antonio', clicks: 29, impressions: 890, ctr: '3.3%',  position: 12.7 },
      { keyword: 'provalley digital marketing',   clicks: 27, impressions: 140, ctr: '19.3%', position: 1.2  },
    ],
    cwv: {
      lcp:  { value: '1.9s',  status: 'good', label: 'Largest Contentful Paint', threshold: '< 2.5s good' },
      cls:  { value: '0.02',  status: 'good', label: 'Cumulative Layout Shift',   threshold: '< 0.1 good'  },
      inp:  { value: '120ms', status: 'good', label: 'Interaction to Next Paint', threshold: '< 200ms good'},
      fcp:  { value: '0.9s',  status: 'good', label: 'First Contentful Paint',    threshold: '< 1.8s good' },
      ttfb: { value: '180ms', status: 'good', label: 'Time to First Byte',        threshold: '< 800ms good'},
    },
    audit: {
      lastScan: '2026-05-22',
      score: 91,
      issues: [
        { type: 'info',    label: 'Re-scan pending',  count: 1, detail: 'privacy-policy.html and terms.html deployed — scan queued' },
        { type: 'warning', label: 'Missing alt text', count: 2, detail: '2 images missing alt attributes on landing pages' },
      ],
    },
  },
}
