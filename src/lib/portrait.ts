// Shared by the portrait markup and the head preload so they cannot drift.
const WIDTHS = [400, 560, 720, 960, 1200]
// The portrait is sized by height (h-[38vh] sm:h-[46vh] lg:h-[62vh], aspect
// 1467:1600), so its width is 0.917 x height and these are vh, not vw.
// Measured widths (CSS px) at viewport WxH: 360x800 278, 390x844 294,
// 412x823 286, 640x900 379, 768x1024 432, 1024x768 436, 1440x900 511,
// 1920x1080 614. That is 34.8vh below 640px, 42.1vh from 640px, 56.8vh from 1024px.
export const PORTRAIT_SIZES = '(min-width: 1024px) 57vh, (min-width: 640px) 42vh, 35vh'
export const srcSet = (ext: 'avif' | 'webp') =>
  WIDTHS.map((w) => `/portrait-${w}.${ext} ${w}w`).join(', ')
