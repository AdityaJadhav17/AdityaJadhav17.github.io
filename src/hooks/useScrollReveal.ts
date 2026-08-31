import { useLayoutEffect, useRef, useState } from 'react'

// Scroll-reveal (Task 13 / RULING AL) — MASTER.md's Motion section specifies
// a subtle fade+rise on scroll entry (300-400ms, 8-16px) via GSAP +
// ScrollTrigger, but a GSAP dependency is overkill for a static portfolio.
// This reproduces the same effect with IntersectionObserver + a CSS
// transition, following the observer setup/cleanup shape of
// useActiveSection.ts.
//
// "Start visible, then enhance" — `revealed` defaults to `true`, so the
// element renders fully visible (no hidden class) until an effect proves an
// IntersectionObserver is actually available and working. That means:
//   - No JS at all (bundle never runs): section stays visible (never had
//     the hidden class applied in the first place).
//   - IntersectionObserver unsupported (feature-detected via `typeof`):
//     stays visible, hook is a no-op.
//   - `new IntersectionObserver(...)` / `.observe()` throws: caught, and
//     the section is immediately revealed rather than left hidden.
// The only way content goes to the hidden state at all is once an observer
// has been constructed and started successfully — at which point the
// observer itself (fired async, always, per spec) is what brings it back,
// so it can never be left stranded invisible.
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [revealed, setRevealed] = useState(true)

  // useLayoutEffect (not useEffect): flips to hidden before the browser
  // paints, so an already-in-viewport section never flashes
  // visible -> hidden -> visible on mount.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    let revealedOnce = false
    const reveal = () => {
      if (revealedOnce) return
      revealedOnce = true
      setRevealed(true)
    }

    setRevealed(false)

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) reveal()
        },
        // Roughly matches MASTER.md's ScrollTrigger 'top 90%': fires once
        // the section is ~10% into the viewport from the bottom edge.
        { threshold: 0, rootMargin: '0px 0px -10% 0px' },
      )
      observer.observe(el)
      return () => observer.disconnect()
    } catch {
      // Observer construction/observe failed — never leave content
      // trapped invisible.
      reveal()
      return
    }
  }, [])

  return { ref, revealed }
}
