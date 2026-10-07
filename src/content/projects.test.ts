import { describe, it, expect } from 'vitest'
import { projects } from './projects'

describe('projects', () => {
  it('keeps every metric a substring of its outcome', () => {
    for (const p of projects) {
      if (p.metric) expect(p.outcome, p.id).toContain(p.metric)
    }
  })
})
