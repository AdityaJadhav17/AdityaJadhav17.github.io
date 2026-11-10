import { expect, test, vi } from 'vitest'
import { buildHead, jsonLdScript } from './head'
import { certifications } from '@/content/certifications'
import { currentRoles, site } from '@/content/site'
import { projects } from '@/content/projects'
import { fixtureStudy } from '@/pages/fixture'

const ldGraph = (head: string) => JSON.parse(head.match(/application\/ld\+json">(.*?)<\/script>/)![1])['@graph']

test('head is generated from content and never mentions an ended role', () => {
  const head = buildHead()
  expect(head).toContain('<link rel="canonical" href="https://adityajadhav.dev/"')
  expect(head).toContain('og:image')
  expect(head).toMatch(/<link rel="preload" as="image" type="image\/avif" imagesrcset="\/portrait-400.avif 400w/)
  for (const role of currentRoles) expect(head).toContain(role.split(' @ ')[0])
  expect(head).not.toMatch(/Lumulus|github\.io/)
  expect(head).not.toMatch(/\u2014/)
})

test('image alt text and alumniOf are present', () => {
  const head = buildHead()
  expect(head).toMatch(/<meta property="og:image:alt" content="[^"]*I build AI systems and find where they break\.[^"]*"/)
  expect(head).toMatch(/<meta name="twitter:image:alt" content="[^"]*adityajadhav\.dev[^"]*"/)
  const ld = ldGraph(head).find((n: { '@type': string }) => n['@type'] === 'Person')
  expect(ld.alumniOf).toEqual({ '@type': 'CollegeOrUniversity', name: 'UC San Diego' })
  expect(ld.affiliation).toEqual(ld.alumniOf)
})

test('title, Person and WebSite nodes carry the discoverability fields', () => {
  const head = buildHead()
  expect(head).toContain('Software Engineer, AI &amp; Security')
  const graph = ldGraph(head)
  const person = graph.find((n: { '@type': string }) => n['@type'] === 'Person')
  expect(person.image).toMatch(/portrait-1200\.webp$/)
  expect(person.description).toBe(site.description)
  expect(person.email).toBe('mailto:' + site.email)
  expect(person.knowsAbout).toEqual(site.capabilities)
  expect(person.jobTitle).toContain('Software Engineer')
  expect(graph.some((n: { '@type': string }) => n['@type'] === 'WebSite')).toBe(true)
  const profile = graph.find((n: { '@type': string }) => n['@type'] === 'ProfilePage')
  expect(profile.mainEntity).toEqual({ '@id': person['@id'] })
  expect(person.hasCredential.map((c: { name: string }) => c.name)).toEqual(certifications.map((c) => c.title))
  expect(person.hasCredential[0].url).toMatch(/^https:\/\/www\.credly\.com\//)
})

test('JSON-LD cannot be broken out of its script tag', () => {
  const tag = jsonLdScript({ x: '</script><img>' })
  expect(tag.match(/<\/script>/g)).toHaveLength(1)
  expect(tag).toContain('\\u003c/script>')
})

test('attribute values escape quotes and angle brackets', async () => {
  vi.resetModules()
  vi.doMock('@/content/site', async (orig) => {
    const m = await orig<typeof import('@/content/site')>()
    return { ...m, site: { ...m.site, description: `a "b" <c> 'd' & e` } }
  })
  const { buildHead } = await import('./head')
  expect(buildHead()).toContain('content="a &quot;b&quot; &lt;c&gt; &#39;d&#39; &amp; e"')
  vi.doUnmock('@/content/site')
})

const page = { project: projects.find((p) => p.id === 'watchtower')!, study: fixtureStudy }
const ld = (head: string) => JSON.parse(head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1])
const projectNode = (head: string) => ld(head)['@graph'].find((n: { '@id': string }) => n['@id'].endsWith('#project'))

test('buildHead() is unchanged for the homepage', () => {
  expect(buildHead()).toBe(buildHead({}))
  expect(buildHead()).not.toContain('ItemList')
})
test('a project page gets its own title, canonical and image', () => {
  const head = buildHead({ current: page, published: [page] })
  expect(head).toContain(`<title>${fixtureStudy.title} | Aditya Jadhav</title>`)
  expect(head).toContain('<link rel="canonical" href="https://adityajadhav.dev/projects/watchtower/" />')
  expect(head).toContain('content="https://adityajadhav.dev/og/watchtower.png"')
  expect(head).toContain('<meta property="og:type" content="article" />')
  expect(head).not.toContain('portrait')
})
test('a project page carries a breadcrumb and the project node', () => {
  const graph = ld(buildHead({ current: page, published: [page] }))['@graph']
  const crumbs = graph.find((n: { '@type': string }) => n['@type'] === 'BreadcrumbList')
  expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual(['Aditya Jadhav', 'Projects', 'WatchTower'])
  const node = projectNode(buildHead({ current: page, published: [page] }))
  expect(node['@type']).toBe('SoftwareSourceCode')
  expect(node.author).toEqual({ '@id': 'https://adityajadhav.dev/#person' })
  expect(node).not.toHaveProperty('award')
})
test('award appears only when the project has one', () => {
  const awarded = { ...page, project: { ...page.project, award: 'Winner, test track' } }
  expect(projectNode(buildHead({ current: awarded })).award).toBe('Winner, test track')
})
test('a project without a repo is a CreativeWork with no codeRepository', () => {
  const bare = { ...page, project: { ...page.project, links: {} } }
  const node = projectNode(buildHead({ current: bare }))
  expect(node['@type']).toBe('CreativeWork')
  expect(node).not.toHaveProperty('codeRepository')
})
test('hostile text is escaped in tags and JSON-LD', () => {
  const evil = { ...page, study: { ...fixtureStudy, title: `a<b>&"c' $&`, description: '</script><script>x' } }
  const head = buildHead({ current: evil })
  expect(head).toContain('<title>a&lt;b&gt;&amp;&quot;c&#39; $&amp; | Aditya Jadhav</title>')
  expect(head).not.toContain('</script><script>x')
  expect(ld(head)['@graph']).toBeTruthy()
})
test('the homepage lists published pages', () => {
  const list = ld(buildHead({ published: [page] }))['@graph'].find((n: { '@type': string }) => n['@type'] === 'ItemList')
  expect(list.itemListElement[0]).toMatchObject({ position: 1, url: 'https://adityajadhav.dev/projects/watchtower/', name: 'WatchTower' })
})
