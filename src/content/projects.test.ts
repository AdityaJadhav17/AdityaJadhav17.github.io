import { describe, it, expect } from 'vitest'
import { projects } from './projects'

describe('projects', () => {
  it('leads with Talk-to-Robot', () => {
    expect(projects.filter((p) => p.featured).map((p) => p.id)).toEqual([
      'talk-to-robot',
      'watchtower',
      'travel-agntcy',
      'stockroom',
    ])
  })

  it('keeps every metric a substring of its outcome', () => {
    for (const p of projects) {
      if (p.metric) expect(p.outcome, p.id).toContain(p.metric)
    }
  })
})
