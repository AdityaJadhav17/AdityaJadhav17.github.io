import { expect, test } from 'vitest'
import { pagePath, slugFromPath, pageFor, publishedSlugs } from './pages'
import { fixtureStudy } from '@/pages/fixture'
import { projects } from '@/content/projects'

test('pagePath and slugFromPath round-trip, with or without the slash', () => {
  expect(pagePath('coverage-keeper')).toBe('/projects/coverage-keeper/')
  expect(slugFromPath('/projects/coverage-keeper/')).toBe('coverage-keeper')
  expect(slugFromPath('/projects/coverage-keeper')).toBe('coverage-keeper')
  for (const p of ['/', '/projects/', '/projects/a/b/', '/other/x/']) expect(slugFromPath(p)).toBeNull()
})
test('every project has a unique slug', () => {
  const slugs = projects.map((p) => p.slug)
  expect(new Set(slugs).size).toBe(slugs.length)
  expect(slugs).toEqual(expect.arrayContaining(['synthetic-to-real', 'margin']))
})
test('pageFor finds the project and throws for an unknown slug', () => {
  expect(pageFor(fixtureStudy).project.id).toBe('watchtower')
  expect(() => pageFor({ ...fixtureStudy, slug: 'nope' })).toThrow('pages: no project with slug "nope"')
})
test('only Coverage Keeper is published so far', () => expect(publishedSlugs).toEqual(['coverage-keeper']))
