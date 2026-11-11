// Test-only study. Nothing in src/content/case-studies/ yet, so production output is unchanged.
import type { CaseStudy } from '@/content/case-study'

export const fixtureStudy: CaseStudy = {
  slug: 'watchtower',
  title: 'WatchTower: fixture title',
  description: 'Fixture description for tests only.',
  facts: { result: 'Fixture result', role: 'Fixture role', team: 'Fixture team' },
  dateCreated: '2026-06',
  keywords: ['fixture', 'test'],
  ogImage: { src: '/og/watchtower.png', alt: 'Fixture share image' },
  sections: [
    { heading: 'The problem', body: [{ p: 'A paragraph.' }] },
    { heading: 'Stack', body: [{ ul: ['One', 'Two'] }] },
    { heading: 'Results', body: [{ table: { caption: 'A table', head: ['Name', 'Value'], rows: [['a', '1']] } }] },
  ],
}
