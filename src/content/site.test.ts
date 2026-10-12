import { test, expect } from 'vitest'
import { currentRoles, site } from './site'
import { experience } from './experience'

test('currentRoles is exactly the experience entries that end in Present', () => {
  const expected = experience.filter((e) => e.end === 'Present').map((e) => `${e.role} @ ${e.organization}`)
  expect(currentRoles).toEqual(expected)
  expect(currentRoles.join(' ')).not.toMatch(/Lumulus/)
})

test('analytics stay off until a token is set', () => {
  expect(site.analytics.cloudflareToken).toBe('')
})
