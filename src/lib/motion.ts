import type { Variants } from 'motion/react'

// Shared easing and reveal choreography. Reduced motion is handled once by
// the MotionConfig in App.tsx, so this file never branches on it. (The hero
// entrance is plain CSS now: .hero-in in theme.css.)
//
// Typed as an explicit 4-tuple rather than `as const`: Motion's
// BezierDefinition is a mutable tuple, and a readonly array does not satisfy
// it.
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Reveal choreography for the four sections below the hero. Exported as
// plain Variants rather than from a hook: reduced motion is handled once by
// the MotionConfig in App.tsx, so there is no per-component state left to
// compute. Tuned quicker than the hero's, because these carry body content
// rather than a cover.
export const revealContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
