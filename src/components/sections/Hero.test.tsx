import { test, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Hero } from './Hero'
import { currentRoles } from '@/content/site'

test('"Currently" lists exactly the current roles', () => {
  render(<Hero />)
  const list = screen.getByRole('list', { name: 'Currently' })
  expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(currentRoles)
})
