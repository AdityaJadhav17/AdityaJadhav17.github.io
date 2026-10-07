import { test, expect } from 'vitest'
import { currentRoles } from './site'
import { experience } from './experience'

test('currentRoles is exactly the experience entries that end in Present', () => {
  const expected = experience.filter((e) => e.end === 'Present').map((e) => `${e.role} @ ${e.organization}`)
  expect(currentRoles).toEqual(expected)
  expect(currentRoles.join(' ')).not.toMatch(/Lumulus/)
})
