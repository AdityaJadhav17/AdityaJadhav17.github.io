import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { ThemeMenu } from './ThemeMenu'

const isDark = () => document.documentElement.classList.contains('dark')

// Controllable prefers-color-scheme: tests flip `dark` and fire the listeners.
function mockSystemScheme(initialDark: boolean) {
  let dark = initialDark
  const listeners = new Set<() => void>()
  window.matchMedia = vi.fn(
    () =>
      ({
        get matches() {
          return dark
        },
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      }) as unknown as MediaQueryList,
  )
  return (next: boolean) => {
    dark = next
    listeners.forEach((fn) => fn())
  }
}

describe('ThemeMenu', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    delete document.documentElement.dataset.themePref
    mockSystemScheme(false)
  })
  afterEach(cleanup)

  it('server render is a plain menu button with both icons, picked by CSS', () => {
    const html = renderToString(<ThemeMenu />)
    expect(html).toContain('aria-label="Theme"')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('lucide-sun')
    expect(html).toContain('lucide-moon')
    expect(html).not.toContain('lucide-monitor')
  })

  it('labels the stored choice and the resolved scheme after mount', () => {
    const { unmount } = render(<ThemeMenu />)
    expect(screen.getByRole('button', { name: 'Theme: System (light)' })).toBeInTheDocument()
    unmount()

    localStorage.setItem('theme', 'dark')
    render(<ThemeMenu />)
    expect(screen.getByRole('button', { name: 'Theme: Dark' })).toBeInTheDocument()
  })

  it('system follows prefers-color-scheme, including live changes', () => {
    const setScheme = mockSystemScheme(true)
    render(<ThemeMenu />)
    expect(screen.getByRole('button', { name: 'Theme: System (dark)' })).toBeInTheDocument()

    act(() => setScheme(false))
    expect(isDark()).toBe(false)
    expect(screen.getByRole('button', { name: 'Theme: System (light)' })).toBeInTheDocument()
    act(() => setScheme(true))
    expect(isDark()).toBe(true)
    expect(screen.getByRole('button', { name: 'Theme: System (dark)' })).toBeInTheDocument()
  })

  it('opens on click, applies a choice, and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<ThemeMenu />)
    const trigger = screen.getByRole('button', { name: 'Theme: System (light)' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(await screen.findByRole('menuitemradio', { name: 'Dark' }))
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.dataset.themePref).toBe('dark')
    expect(isDark()).toBe(true)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Theme: Dark' })).toHaveFocus()
  })

  it('ignores system changes while a theme is forced', () => {
    localStorage.setItem('theme', 'light')
    const setScheme = mockSystemScheme(false)
    render(<ThemeMenu />)

    act(() => setScheme(true))
    expect(isDark()).toBe(false)
  })
})
