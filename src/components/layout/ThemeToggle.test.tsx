import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { ThemeToggle } from './ThemeToggle'

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

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockSystemScheme(false)
  })
  afterEach(cleanup)

  it('server render shows the system state', () => {
    const html = renderToString(<ThemeToggle />)
    expect(html).toContain('aria-label="Switch to light theme"')
    expect(html).toContain('lucide-monitor')
  })

  it('cycles light, dark, system, light with the next state in the label', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    // Starts in system: next is light.
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.querySelector('.lucide-sun')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(isDark()).toBe(true)
    expect(document.querySelector('.lucide-moon')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch to system theme' }))
    expect(localStorage.getItem('theme')).toBe('system')
    expect(document.querySelector('.lucide-monitor')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('applies a stored theme after mount', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Switch to system theme' })).toBeInTheDocument()
  })

  it('system follows prefers-color-scheme, including live changes', async () => {
    const setScheme = mockSystemScheme(true)
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' })) // light
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' })) // dark
    await user.click(screen.getByRole('button', { name: 'Switch to system theme' })) // system
    expect(isDark()).toBe(true)

    act(() => setScheme(false))
    expect(isDark()).toBe(false)
    act(() => setScheme(true))
    expect(isDark()).toBe(true)
  })

  it('ignores system changes while a theme is forced', async () => {
    const setScheme = mockSystemScheme(false)
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))

    act(() => setScheme(true))
    expect(isDark()).toBe(false)
  })
})
