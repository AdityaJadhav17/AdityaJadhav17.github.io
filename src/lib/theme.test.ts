import { describe, it, expect, beforeEach } from 'vitest'
import { getStoredTheme, setTheme, resolveTheme } from './theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to system when nothing is stored', () => {
    expect(getStoredTheme()).toBe('system')
  })

  it('persists an explicit choice', () => {
    setTheme('dark')
    expect(getStoredTheme()).toBe('dark')
  })

  it('applies the dark class when resolving to dark', () => {
    setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class when resolving to light', () => {
    setTheme('dark')
    setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('resolves system using the media query', () => {
    expect(['light', 'dark']).toContain(resolveTheme('system'))
  })

  it('ignores a corrupt stored value', () => {
    localStorage.setItem('theme', 'banana')
    expect(getStoredTheme()).toBe('system')
  })
})
