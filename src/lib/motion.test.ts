import { expect, test } from 'vitest'
import { railProgress } from './motion'

test('railProgress runs 0 to 1 between the two scroll offsets and clamps outside', () => {
  // 1000px viewport, 2000px list.
  expect(railProgress(1200, 2000, 1000)).toBe(0) // still below the start line
  expect(railProgress(800, 2000, 1000)).toBe(0) // top at 80%
  expect(railProgress(-300, 2000, 1000)).toBeCloseTo(0.5)
  expect(railProgress(-1400, 2000, 1000)).toBe(1) // bottom at 60%
  expect(railProgress(-3000, 2000, 1000)).toBe(1)
})
