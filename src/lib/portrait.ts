// Shared by the portrait markup and the head preload so they cannot drift.
const WIDTHS = [400, 560, 720, 960, 1200]
// The portrait is sized by height (h-[38vh] sm:h-[46vh] lg:h-[62vh] capped to
// min(35rem, 100dvh - 366px) from 1024px, see HeroPortrait.tsx; aspect
// 1467:1600), so its width is 0.917 x height and these are vh, not vw.
// Measured widths (CSS px) at viewport WxH: 360x800 278, 390x844 294,
// 412x823 286, 640x900 379, 768x1024 432, 1024x768 369, 1280x800 398,
// 1440x900 489, 1920x1080 513. That is 34.8vh below 640px, 42.1vh from 640px,
// and from 1024px 56.8vh until the 366px / 35rem caps bite (the formula below).
export const PORTRAIT_SIZES = '(min-width: 1024px) min(57vh, calc(0.917 * (100vh - 366px)), 514px), (min-width: 640px) 42vh, 35vh'
export const srcSet = (ext: 'avif' | 'webp') =>
  WIDTHS.map((w) => `/portrait-${w}.${ext} ${w}w`).join(', ')
