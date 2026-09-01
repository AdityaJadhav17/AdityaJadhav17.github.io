import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { CountUp } from './CountUp'

// jsdom does not implement IntersectionObserver, so these run against the
// static branch. That is the branch worth protecting: it is what a visitor
// gets when the observer is missing, and it must show the real figure rather
// than a zero left over from an animation that never started.
describe('CountUp without an IntersectionObserver', () => {
  test.each([
    ['11', '11'],
    ['0.9175', '0.9175'],
    ['150+', '150+'],
  ])('renders %s exactly', (value, expected) => {
    render(<CountUp value={value} />)
    expect(screen.getByText(expected)).toBeVisible()
  })

  test('never renders a zero placeholder', () => {
    render(<CountUp value="150+" />)
    expect(screen.queryByText('0')).toBeNull()
    expect(screen.queryByText('0+')).toBeNull()
  })
})
