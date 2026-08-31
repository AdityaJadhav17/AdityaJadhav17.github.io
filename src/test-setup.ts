import '@testing-library/jest-dom/vitest'

// jsdom does not implement window.matchMedia. Stub it so code that reads
// prefers-color-scheme (src/lib/theme.ts's resolveTheme, and anything that
// consumes it, e.g. Task 6's ThemeToggle) can run under test. Defaults to
// "no preference" (matches: false) since jsdom has no real OS theme.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = function matchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList
  }
}
