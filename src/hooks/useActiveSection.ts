import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    // Reveal promises that content stays visible even without an
    // IntersectionObserver, constructing a plain element instead of one
    // stuck at a hidden variant. That promise depends on this effect never
    // throwing: an unguarded throw here would unmount the whole React root
    // (there is no error boundary above it) and blank the page before
    // Reveal's fallback could matter. So we return early when the observer
    // is unsupported, and wrap construction/observe in try/catch in case a
    // supported-looking environment still throws. Either path just leaves
    // no section highlighted, which is cosmetic: the nav links are plain
    // anchors and keep working.
    if (typeof IntersectionObserver === 'undefined') return

    try {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
          if (visible) setActive(visible.target.id)
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
      )
      const els = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      els.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    } catch {
      return
    }
  }, [ids])

  return active
}
