import { certifications } from '@/content/certifications'
import { currentRoles, site } from '@/content/site'
import { PORTRAIT_SIZES, srcSet } from './portrait'

const ORIGIN = 'https://adityajadhav.dev/'
// Describes public/og-image.png. Keep in step with the image text.
const OG_ALT =
  'Dark card with an AJ monogram and the line "I build AI systems and find where they break." Below it: Aditya Jadhav, adityajadhav.dev, and "Graduating June 2027, open to new-grad roles".'
const TITLE = `${site.name} | Software Engineer, AI & Security`

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;')

export function jsonLdScript(data: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

// Every tag here used to be hand-copied into index.html and drifted (an ended
// role kept reading as current). Generated at build time from content now.
export function buildHead(): string {
  const d = esc(site.description)
  const person = {
    '@type': 'Person',
    '@id': ORIGIN + '#person',
    name: site.name,
    url: ORIGIN,
    image: ORIGIN + 'portrait-1200.webp',
    description: site.description,
    email: 'mailto:' + site.email,
    // Same base title as the <title> tag, plus any current role.
    jobTitle: ['Software Engineer', ...currentRoles.map((r) => r.split(' @ ')[0])],
    knowsAbout: site.capabilities,
    sameAs: site.social.map((s) => s.url),
    // schema.org allows alumniOf for a current student; affiliation stays too.
    alumniOf: { '@type': 'CollegeOrUniversity', name: site.education.institution },
    affiliation: { '@type': 'CollegeOrUniversity', name: site.education.institution },
    hasCredential: certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.title,
      credentialCategory: 'certification',
      url: c.verify,
      recognizedBy: { '@type': 'Organization', name: c.issuer },
    })),
  }
  const website = {
    '@type': 'WebSite',
    '@id': ORIGIN + '#website',
    url: ORIGIN,
    name: site.name,
    about: { '@id': ORIGIN + '#person' },
  }
  // Google's profile page markup: the page is about one person.
  const profilePage = {
    '@type': 'ProfilePage',
    '@id': ORIGIN + '#profilepage',
    url: ORIGIN,
    name: TITLE,
    isPartOf: { '@id': ORIGIN + '#website' },
    mainEntity: { '@id': ORIGIN + '#person' },
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': [profilePage, person, website] }
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
    `<meta property="og:image:alt" content="${esc(OG_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(TITLE)}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${ORIGIN}og-image.png" />`,
    `<meta name="twitter:image:alt" content="${esc(OG_ALT)}" />`,
    `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcSet('avif')}" imagesizes="${PORTRAIT_SIZES}" fetchpriority="high" />`,
    jsonLdScript(jsonLd),
  ].join('\n    ')
}
