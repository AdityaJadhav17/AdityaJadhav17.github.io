import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { projects } from '@/content/projects'
import { ProjectCard } from './ProjectCard'

const byId = (id: string) => projects.find((p) => p.id === id)!

describe('ProjectCard', () => {
  it('shows title, context and outcome, with the metric in accent ink, semibold', () => {
    const p = byId('sim2real')
    render(<ProjectCard project={p} />)
    expect(screen.getByRole('heading', { name: p.title })).toBeInTheDocument()
    expect(screen.getByText(p.context!)).toBeInTheDocument()
    const metric = screen.getByText(p.metric!)
    expect(metric).toHaveClass('font-semibold', 'tabular-nums', 'text-accent-ink')
    expect(metric).not.toHaveClass('font-mono')
    expect(metric.parentElement).toHaveTextContent(p.outcome)
  })

  it('renders an outcome without a metric as plain text', () => {
    const p = byId('personal-tracker')
    render(<ProjectCard project={p} />)
    expect(screen.getByText(p.outcome)).toBeInTheDocument()
  })

  it('renders a theme-matched pair when a dark capture exists, dimming neither', () => {
    const p = byId('stockroom')
    render(<ProjectCard project={p} layout="wide" />)
    const light = screen.getByAltText(p.image!.alt)
    const dark = screen.getByAltText(p.image!.dark!.alt)
    expect(light).toHaveClass('dark:hidden')
    expect(dark).toHaveClass('hidden', 'dark:block')
    for (const img of [light, dark]) {
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img.className).not.toContain('brightness')
    }
  })

  it('shows at most five stack tags outside the details, plus a +N item', () => {
    const p = byId('travel-agntcy')
    const { container } = render(<ProjectCard project={p} />)
    const details = container.querySelector('details')!
    const visible = [...container.querySelectorAll('li')].filter((li) => !details.contains(li))
    expect(visible).toHaveLength(6)
    expect(visible.slice(0, 5).map((li) => li.textContent)).toEqual(p.stack.slice(0, 5))
    expect(screen.getByText('and 3 more')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeVisible()
  })

  it('shows no +N item when the stack fits', () => {
    render(<ProjectCard project={byId('bird-classifier')} />)
    expect(screen.queryByText(/^\+\d/)).toBeNull()
  })

  it('keeps Problem, What I built, Stack and Result inside a details labelled "Read the details"', () => {
    const p = byId('travel-agntcy')
    const { container } = render(<ProjectCard project={p} />)
    const details = container.querySelector('details')!
    expect(details.querySelector('summary')).toHaveTextContent('Read the details')
    expect(details).not.toHaveAttribute('open')
    const d = within(details)
    for (const label of ['Problem', 'What I built', 'Stack', 'Result']) {
      expect(d.getByText(label)).toBeInTheDocument()
    }
    expect(d.getByText(p.problem)).toBeInTheDocument()
    expect(d.getByText(p.contribution)).toBeInTheDocument()
    expect(d.getByText(p.result!)).toBeInTheDocument()
    for (const tech of p.stack) expect(d.getByText(tech)).toBeInTheDocument()
  })
})
