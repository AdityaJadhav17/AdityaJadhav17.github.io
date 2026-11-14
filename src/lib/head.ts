import { certifications } from '@/content/certifications'
import { currentRoles, site } from '@/content/site'
import type { CaseStudy } from '@/content/case-study'
import type { Project } from '@/content/projects'
import { pagePath } from './pages'
import { PORTRAIT_SIZES, srcSet } from './portrait'

const ORIGIN = 'https://adityajadhav.dev/'
// Describes public/og-image.png. Keep in step with the image text.
const OG_ALT =
  'Dark card with an AJ monogram and the line "I build software and find where it breaks." Below it: Aditya Jadhav, adityajadhav.dev, and "Graduating June 2027, open to new-grad roles".'
const TITLE = `${site.name} | Software Engineer, AI & Security`

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;')

export function jsonLdScript(data: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

// Every tag here used to be hand-copied into index.html and drifted (an ended
// role kept reading as current). Generated at build time from content now.
export type HeadPage = { project: Project; study: CaseStudy }

const pageUrl = (slug: string) => ORIGIN.slice(0, -1) + pagePath(slug)

function projectGraph({ project, study }: HeadPage) {
  const url = pageUrl(study.slug)
  return [
    {
      '@type': 'BreadcrumbList',
      '@id': url + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.name, item: ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: ORIGIN + '#work' },
        { '@type': 'ListItem', position: 3, name: project.title, item: url },
      ],
    },
    {
      '@type': project.links.github ? 'SoftwareSourceCode' : 'CreativeWork',
      '@id': url + '#project',
      name: project.title,
      description: study.description,
      url,
      image: ORIGIN.slice(0, -1) + study.ogImage.src,
      author: { '@id': ORIGIN + '#person' },
      isPartOf: { '@id': ORIGIN + '#website' },
      dateCreated: study.dateCreated,
      datePublished: study.published,
      dateModified: study.updated ?? study.published,
      keywords: study.keywords.join(', '),
      ...(project.links.github && { codeRepository: project.links.github }),
      ...(project.award && { award: project.award }),
    },
    // Minimal stubs so the @id references above resolve within this page's graph.
    { '@type': 'Person', '@id': ORIGIN + '#person', name: site.name, url: ORIGIN },
    { '@type': 'WebSite', '@id': ORIGIN + '#website', url: ORIGIN, name: site.name },
  ]
}

export function buildHead({ current, published = [] }: { current?: HeadPage; published?: HeadPage[] } = {}): string {
  if (current) return projectHead(current)
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
  const projectList = {
    '@type': 'ItemList',
    '@id': ORIGIN + '#projects',
    itemListElement: published.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: pageUrl(p.study.slug), name: p.project.title })),
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': [profilePage, person, website, ...(published.length ? [projectList] : [])] }
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

function projectHead(page: HeadPage): string {
  const { study } = page
  const title = `${study.title} | ${site.name}`
  const d = esc(study.description)
  const url = pageUrl(study.slug)
  const img = ORIGIN.slice(0, -1) + study.ogImage.src
  const alt = esc(study.ogImage.alt)
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="article:published_time" content="${study.published}" />`,
    `<meta property="article:modified_time" content="${study.updated ?? study.published}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${alt}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<meta name="twitter:image:alt" content="${alt}" />`,
    jsonLdScript({ '@context': 'https://schema.org', '@graph': projectGraph(page) }),
  ].join('\n    ')
}
