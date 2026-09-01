import { motion } from 'motion/react'
import type { AriaAttributes, ReactNode } from 'react'
import { revealContainer, revealItem } from '@/lib/motion'

// A closed, type-checked set of tags rather than an index into `motion` by
// string. Passing `as` is what keeps this wrapper from flattening the
// document's semantics into divs: a section stays a section, a list row
// stays an li.
const TAGS = {
  section: motion.section,
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
} as const

export type RevealTag = keyof typeof TAGS

// Feature-detected once, at module scope. useScrollReveal (which this
// replaces) was deliberately built "start visible, then enhance": no
// JavaScript, an unsupported observer, and an observer that throws all had
// to resolve to visible content rather than content stranded at opacity 0.
// Motion's whileInView defaults to the opposite, holding content at
// `initial` until an observer fires, so the guard below preserves the
// original guarantee. Rendering the plain element is stronger than a
// try/catch: Motion is never constructed at all.
const CAN_OBSERVE = typeof IntersectionObserver !== 'undefined'

// Matches the rootMargin useScrollReveal used, so the trigger point does not
// shift as part of this change.
const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

type RevealProps = {
  as?: RevealTag
  className?: string
  id?: string
  children: ReactNode
} & Pick<AriaAttributes, 'aria-label' | 'aria-labelledby' | 'aria-hidden'>

export function Reveal({ as = 'div', children, ...rest }: RevealProps) {
  if (!CAN_OBSERVE) {
    const Plain = as
    return <Plain {...rest}>{children}</Plain>
  }

  const Motion = TAGS[as]
  return (
    <Motion
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </Motion>
  )
}

function RevealItem({ as = 'div', children, ...rest }: RevealProps) {
  if (!CAN_OBSERVE) {
    const Plain = as
    return <Plain {...rest}>{children}</Plain>
  }

  // No initial/whileInView here on purpose. Motion propagates variant state
  // from the nearest parent motion component through React context, so
  // intervening plain elements (the max-w wrappers, the ol in Experience) do
  // not break the chain.
  const Motion = TAGS[as]
  return (
    <Motion variants={revealItem} {...rest}>
      {children}
    </Motion>
  )
}

Reveal.Item = RevealItem
