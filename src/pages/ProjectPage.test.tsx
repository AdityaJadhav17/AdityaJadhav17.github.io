import { expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ProjectPage } from './ProjectPage'
import { fixtureStudy } from './fixture'
import { pageFor } from '@/lib/pages'

test('renders the title, one h2 per section, a captioned table and a list', () => {
  const { container } = render(<ProjectPage {...pageFor(fixtureStudy)} />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('WatchTower')
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(fixtureStudy.sections.length)
  const table = screen.getByRole('table')
  expect(table.querySelector('caption')).not.toBeNull()
  for (const th of table.querySelectorAll('th')) expect(th.getAttribute('scope')).toBe('col')
  expect(within(container.querySelector('ul:not(nav ul)') as HTMLElement).getAllByRole('listitem').length).toBeGreaterThan(0)
})
