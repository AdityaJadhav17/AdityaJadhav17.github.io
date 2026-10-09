import { expect, test } from 'vitest'
import { buildHead, jsonLdScript } from './head'
import { currentRoles } from '@/content/site'

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
  const ld = JSON.parse(head.match(/application\/ld\+json">(.*?)<\/script>/)![1])
  expect(ld.alumniOf).toEqual({ '@type': 'CollegeOrUniversity', name: 'UC San Diego' })
  expect(ld.affiliation).toEqual(ld.alumniOf)
})

test('JSON-LD cannot be broken out of its script tag', () => {
  const tag = jsonLdScript({ x: '</script><img>' })
  expect(tag.match(/<\/script>/g)).toHaveLength(1)
  expect(tag).toContain('\\u003c/script>')
})
