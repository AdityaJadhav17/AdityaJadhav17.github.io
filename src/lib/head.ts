import { currentRoles, site } from '@/content/site'
import { PORTRAIT_SIZES, srcSet } from './portrait'

const ORIGIN = 'https://adityajadhav.dev/'
const TITLE = `${site.name} | Software Engineer`

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Every tag here used to be hand-copied into index.html and drifted (an ended
// role kept reading as current). Generated at build time from content now.
export function buildHead(): string {
  const d = esc(site.description)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: ORIGIN,
    jobTitle: currentRoles.map((r) => r.split(' @ ')[0]),
    sameAs: site.social.map((s) => s.url),
    affiliation: { '@type': 'CollegeOrUniversity', name: site.education.institution },
  }
  return [
    `<title>${esc(TITLE)}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${ORIGIN}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(TITLE)}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${ORIGIN}" />`,
    `<meta property="og:image" content="${ORIGIN}og-image.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(TITLE)}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${ORIGIN}og-image.png" />`,
    `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcSet('avif')}" imagesizes="${PORTRAIT_SIZES}" fetchpriority="high" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\u003c')}</script>`,
  ].join('\n    ')
}
