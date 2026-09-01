import { useReducedMotion, type Variants } from 'motion/react'

// Shared entrance choreography for the hero. Motion's useReducedMotion reads
// the same prefers-reduced-motion query the global guard in theme.css uses,
// so honouring it here keeps JS-driven animation consistent with the CSS.
//
// Typed as an explicit 4-tuple rather than `as const`: Motion's
// BezierDefinition is a mutable tuple, and a readonly array does not satisfy
// it.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function useHeroMotion() {
  const reduced = useReducedMotion() ?? false

  const container: Variants = {
    hidden: {},
    visible: {
      transition: reduced
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  }

  const item: Variants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.75, ease: EASE },
    },
  }

  return { container, item, reduced, ease: EASE }
}

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
