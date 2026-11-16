import { afterEach, expect, test } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from './Navbar'
import { site } from '@/content/site'

afterEach(cleanup)

test('the header has a résumé download link', () => {
  render(<Navbar sectionIds={['work']} />)
  const link = screen.getByRole('link', { name: 'Résumé' })
  expect(link).toHaveAttribute('href', site.resumePath)
  expect(link).toHaveAttribute('download')
})

test('the mobile menu has a résumé link that closes the sheet', async () => {
  const user = userEvent.setup()
  render(<Navbar sectionIds={['work']} />)
  await user.click(screen.getByRole('button', { name: 'Open menu' }))
  const dialog = await screen.findByRole('dialog')
  const link = within(dialog).getByRole('link', { name: 'Résumé' })
  expect(link).toHaveAttribute('href', site.resumePath)
  await user.click(link)
  expect(screen.queryByRole('dialog')).toBeNull()
})
