import { expect, test } from 'vitest'
import type { CaseStudy } from './case-study'
import { projects } from './projects'
import { site } from './site'
const studies = Object.values(import.meta.glob<{ default: CaseStudy }>('./case-studies/*.ts', { eager: true })).map((m) => m.default)
// site.ts is left out: its existing text is already covered by its own rules.
const text = JSON.stringify({ projects, studies })

test('order and featured flags', () => {
  expect(projects.map((p) => p.id)).toEqual(['coverage-keeper', 'watchtower', 'travel-agntcy', 'talk-to-robot', 'bayt-qareeb', 'stockroom', 'personal-tracker', 'sim2real'])
  expect(projects.filter((p) => p.featured).map((p) => p.id)).toEqual(['coverage-keeper', 'watchtower', 'travel-agntcy', 'talk-to-robot'])
})
test('award wording is exact', () => {
  const award = (id: string) => projects.find((p) => p.id === id)!.award
  expect(award('coverage-keeper')).toBe('Winner, AI in Healthcare track, Solix AI Hackathon 2026')
  expect(award('bayt-qareeb')).toBe('Won a $200 prize at the MTC x Replit x Manara West Buildathon')
})
test('Margin is the display name and links to the renamed repo', () => {
  const p = projects.find((p) => p.id === 'personal-tracker')!
  expect(p.title).toBe('Margin')
  expect(p.links.github).toBe('https://github.com/AdityaJadhav17/Margin')
})
test('no em dashes, no NDA name, no test login', () => {
  expect(text).not.toMatch(/—|Lumulus/)
  expect(text).not.toMatch(/password|test login|judge login/i)
})
test('every case study is sized for search and matches a project', () => {
  for (const s of studies) {
    expect(projects.some((p) => p.slug === s.slug)).toBe(true)
    expect(`${s.title} | Aditya Jadhav`.length).toBeLessThanOrEqual(65)
    expect(s.description.length).toBeGreaterThanOrEqual(110)
    expect(s.description.length).toBeLessThanOrEqual(160)
    const words = JSON.stringify(s.sections).split(/\s+/).length
    expect(words).toBeGreaterThanOrEqual(300)
    expect(words).toBeLessThanOrEqual(900)
    expect(s.sections.map((x) => x.heading)).toEqual(expect.arrayContaining(['The problem', 'What I built', 'How it works', 'What it gets wrong']))
  }
})
test('3x hackathon winner is backed by three awards', () => {
  expect(site.proof).toContainEqual({ value: '3x', label: 'hackathon winner', href: '#work' })
  expect(projects.filter((p) => p.award).length).toBe(3)
})
