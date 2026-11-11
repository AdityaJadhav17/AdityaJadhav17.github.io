import { expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ProjectPage } from './ProjectPage'
import { fixtureStudy } from './fixture'
import { pageFor } from '@/lib/pages'
import { site } from '@/content/site'

const props = pageFor(fixtureStudy)

test('renders the title, one h2 per section, a captioned table and a list', () => {
  const { container } = render(<ProjectPage {...props} />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('WatchTower')
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(fixtureStudy.sections.length)
  const table = screen.getByRole('table')
  expect(table.querySelector('caption')).not.toBeNull()
  for (const th of table.querySelectorAll('th')) expect(th.getAttribute('scope')).toBe('col')
  expect(within(container.querySelector('main section ul') as HTMLElement).getAllByRole('listitem').length).toBeGreaterThan(0)
})

test('the breadcrumb is an ordered list of three, ending on the current page', () => {
  render(<ProjectPage {...props} />)
  const crumbs = within(screen.getByRole('navigation', { name: 'Breadcrumb' }))
  const items = crumbs.getAllByRole('listitem')
  expect(items).toHaveLength(3)
  expect(items[2]).toHaveAttribute('aria-current', 'page')
  expect(crumbs.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/#work')
})

test('the facts strip is a dl of Result, My role, Team, Links', () => {
  const { container } = render(<ProjectPage {...props} />)
  const dts = [...container.querySelectorAll('dl dt')].map((dt) => dt.textContent)
  expect(dts).toEqual(['Result', 'My role', 'Team', 'Links'])
})

test('the award badge shows only when the project has an award', () => {
  const { unmount } = render(<ProjectPage {...props} />)
  expect(screen.queryByText(/winner/i)).toBeNull()
  unmount()
  render(<ProjectPage {...props} project={{ ...props.project, award: 'Winner, fixture track' }} />)
  expect(screen.getByText('Winner, fixture track')).toBeInTheDocument()
})

test('ends with résumé, contact and next-project links', () => {
  render(<ProjectPage {...props} />)
  expect(screen.getByRole('link', { name: /view résumé/i })).toHaveAttribute('href', site.resumePath)
  expect(screen.getByRole('link', { name: /contact me/i })).toHaveAttribute('href', '/#contact')
  expect(screen.getByRole('link', { name: new RegExp(props.next.title) })).toHaveAttribute(
    'href',
    `/projects/${props.next.slug}/`,
  )
})

test('the screenshot loads first, with its size reserved', () => {
  for (const project of [props.project]) {
    const { unmount } = render(<ProjectPage {...props} project={project} />)
    const img = screen.getByAltText(project.image!.alt)
    expect(img).not.toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(img).toHaveAttribute('width', String(project.image!.width))
    expect(img).toHaveAttribute('height', String(project.image!.height))
    unmount()
  }
})

test('navbar section links point back to the homepage', () => {
  render(<ProjectPage {...props} />)
  const nav = within(screen.getByRole('navigation', { name: 'Primary' }))
  const hrefs = nav.getAllByRole('link').map((a) => a.getAttribute('href'))
  expect(hrefs.length).toBeGreaterThan(0)
  for (const href of hrefs) expect(href).toMatch(/^\/#/)
})
