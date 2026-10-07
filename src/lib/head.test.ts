import { expect, test } from 'vitest'
import { buildHead, jsonLdScript } from './head'
import { currentRoles } from '@/content/site'

test('head is generated from content and never mentions an ended role', () => {
  const head = buildHead()
  expect(head).toContain('<link rel="canonical" href="https://adityajadhav.dev/"')
  expect(head).toContain('og:image')
  expect(head).toMatch(/<link rel="preload" as="image" type="image\/avif" imagesrcset="\/portrait-480\.avif 480w/)
  for (const role of currentRoles) expect(head).toContain(role.split(' @ ')[0])
  expect(head).not.toMatch(/Lumulus|github\.io/)
  expect(head).not.toMatch(/\u2014/)
})

test('JSON-LD cannot be broken out of its script tag', () => {
  const tag = jsonLdScript({ x: '</script><img>' })
  expect(tag.match(/<\/script>/g)).toHaveLength(1)
  expect(tag).toContain('\\u003c/script>')
})
