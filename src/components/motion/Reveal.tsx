import { useEffect, useRef, type AriaAttributes, type ReactNode } from 'react'

// A closed set of tags. Passing `as` is what keeps this wrapper from
// flattening the document's semantics into divs: a section stays a section,
// a list row stays an li.
export type RevealTag = 'section' | 'div' | 'ul' | 'ol' | 'li'

// The guarantee: the server and the first client render are the same plain,
// fully visible element, so the prerendered HTML shows all content with no
// JavaScript and hydration cannot mismatch. Content is hidden only after JS
// has run, an IntersectionObserver exists, and the element is below the fold;
// the observer then reveals it. No observer, or already on screen, means it
// is simply left visible, never stranded at opacity 0.
//
// The animation itself is CSS: [data-reveal] and .reveal-item in theme.css.
const VIEWPORT_MARGIN = '0px 0px -10% 0px'

type RevealProps = {
  as?: RevealTag
  className?: string
  id?: string
  children: ReactNode
} & Pick<AriaAttributes, 'aria-label' | 'aria-labelledby' | 'aria-hidden'>

export function Reveal({ as: Tag = 'div', children, ...rest }: RevealProps) {
  const el = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = el.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    // Already on screen at hydration: leave it alone, never flash it out.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) return
    // Stagger order is document order, wherever the items sit in the tree.
    node.querySelectorAll<HTMLElement>('.reveal-item').forEach((item, i) => {
      item.style.setProperty('--i', String(i))
    })
    // Set on the DOM, not through React state: no re-render, and React never
    // owns this attribute so it cannot reset it.
    node.dataset.reveal = 'hidden'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.reveal = 'visible'
          io.disconnect()
        }
      },
      { rootMargin: VIEWPORT_MARGIN },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      // Callback ref: a RefObject<HTMLElement> does not satisfy the tag union.
      ref={(node: HTMLElement | null) => {
        el.current = node
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function RevealItem({ as: Tag = 'div', className, children, ...rest }: RevealProps) {
  return (
    <Tag className={className ? `reveal-item ${className}` : 'reveal-item'} {...rest}>
      {children}
    </Tag>
  )
}

Reveal.Item = RevealItem
