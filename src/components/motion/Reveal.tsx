import { motion, useAnimationControls } from 'motion/react'
import { useEffect, useRef, type AriaAttributes, type ReactNode } from 'react'
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

// The guarantee: the server and the first client render are the same plain,
// fully visible element, so the prerendered HTML shows all content with no
// JavaScript and hydration cannot mismatch. Content is hidden only after JS
// has run, an IntersectionObserver exists, and the element is below the fold;
// the observer then reveals it. No observer, or already on screen, means it
// is simply left visible, never stranded at opacity 0.
//
// Matches the rootMargin useScrollReveal used, so the trigger point does not
// shift as part of this change.
const VIEWPORT_MARGIN = '0px 0px -10% 0px'

type RevealProps = {
  as?: RevealTag
  className?: string
  id?: string
  children: ReactNode
} & Pick<AriaAttributes, 'aria-label' | 'aria-labelledby' | 'aria-hidden'>

export function Reveal({ as = 'div', children, ...rest }: RevealProps) {
  const el = useRef<HTMLElement | null>(null)
  const controls = useAnimationControls()

  useEffect(() => {
    const node = el.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    // Already on screen at hydration: leave it alone, never flash it out.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) return
    controls.set('hidden')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible')
          io.disconnect()
        }
      },
      { rootMargin: VIEWPORT_MARGIN },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [controls])

  const Motion = TAGS[as]
  return (
    <Motion
      // Callback ref: a RefObject<HTMLElement> does not satisfy the tag union.
      ref={(node: HTMLElement | null) => {
        el.current = node
      }}
      variants={revealContainer}
      initial={false}
      animate={controls}
      {...rest}
    >
      {children}
    </Motion>
  )
}

function RevealItem({ as = 'div', children, ...rest }: RevealProps) {
  // Variants only, no initial/animate: an item's variant state comes from the
  // nearest parent motion component through React context, so intervening
  // plain elements (the max-w wrappers, the ol in Experience) do not break
  // the chain. Reveal drives it with controls.set('hidden') then
  // controls.start('visible').
  const Motion = TAGS[as]
  return (
    <Motion variants={revealItem} {...rest}>
      {children}
    </Motion>
  )
}

Reveal.Item = RevealItem
