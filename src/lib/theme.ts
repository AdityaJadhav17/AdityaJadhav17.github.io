export type Theme = 'light' | 'dark' | 'system'

const KEY = 'theme'
const VALID: Theme[] = ['light', 'dark', 'system']

export function getStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return VALID.includes(v as Theme) ? (v as Theme) : 'system'
  } catch {
    return 'system'
  }
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // storage unavailable (private mode) — apply without persisting
  }
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
}
