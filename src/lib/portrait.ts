// Shared by the portrait markup and the head preload so they cannot drift.
const WIDTHS = [480, 800, 1200]
export const PORTRAIT_SIZES = '(min-width: 1024px) 40vw, 76vw'
export const srcSet = (ext: 'avif' | 'webp') =>
  WIDTHS.map((w) => `/portrait-${w}.${ext} ${w}w`).join(', ')
