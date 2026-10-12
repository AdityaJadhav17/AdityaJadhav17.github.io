import { describe, it, expect } from 'vitest'
import { projects } from './projects'

describe('projects', () => {
  it('gives every project a summary and leads with Talk-to-Robot', () => {
    for (const p of projects) expect(p.summary, p.id).toBeTruthy()
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
