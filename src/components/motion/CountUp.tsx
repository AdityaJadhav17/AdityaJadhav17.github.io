import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { EASE } from '@/lib/motion'

// Splits a proof value into the parts needed to count toward it:
//   '11'     -> { target: 11,     decimals: 0, suffix: ''  }
//   '0.9175' -> { target: 0.9175, decimals: 4, suffix: ''  }
//   '150+'   -> { target: 150,    decimals: 0, suffix: '+' }
// Returns null for anything that does not start with a number, which is the
// signal to render the string untouched rather than guess at it.
function parseValue(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return null

  const [, numeric, suffix] = match
  const dot = numeric.indexOf('.')

  return {
    target: Number(numeric),
    decimals: dot === -1 ? 0 : numeric.length - dot - 1,
    suffix,
  }
}

type CountUpProps = {
  value: string
}

// Renders the value as-is. Used verbatim when the value is not numeric, and
// swapped in wholesale below when there is no IntersectionObserver to drive
// the animation.
function StaticCountUp({ value }: CountUpProps) {
  return <span>{value}</span>
}

function AnimatedCountUp({ value }: CountUpProps) {
  const parsed = parseValue(value)
  const target = parsed?.target ?? 0
  const decimals = parsed?.decimals ?? 0
  const suffix = parsed?.suffix ?? ''

  const ref = useRef<HTMLSpanElement>(null)
  // No negative bottom margin here, unlike Reveal. That margin delays a
  // section reveal until the section is meaningfully on screen, but these
  // numbers sit near the bottom of the hero and are already visible at load:
  // measured at a 720px viewport the row's top is 692px, so a -10% margin
  // shrinks the trigger area to 648px and the count never starts at all.
  const inView = useInView(ref, { once: true })

  // Explicit check, deliberately not delegated to the MotionConfig in
  // App.tsx. That suppresses transform and layout animations; a number
  // counting in text is neither, and a value churning in the corner of the
  // eye is exactly the kind of motion the preference exists to stop.
  const reduced = useReducedMotion() ?? false

  const count = useMotionValue(reduced ? target : 0)
  const text = useTransform(count, (latest) => latest.toFixed(decimals) + suffix)

  useEffect(() => {
    if (!parsed) return

    if (reduced) {
      count.set(target)
      return
    }

    if (!inView) return

    const controls = animate(count, target, { duration: 1.1, ease: EASE })
    return () => controls.stop()
  }, [count, decimals, inView, parsed, reduced, target])

  if (!parsed) return <StaticCountUp value={value} />

  return (
    <span ref={ref}>
      {/* The animating text is hidden from assistive technology and the real
          value is exposed alongside it, so a screen reader reads the figure
          once and never a half-counted number. */}
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

// Same guard, and same reasoning, as Reveal.tsx: `useInView` is built on
// IntersectionObserver, so where that does not exist the animated version
// must never mount at all.
const CAN_OBSERVE = typeof IntersectionObserver !== 'undefined'

// Picking between two components rather than branching inside one keeps each
// one's hook order unconditional. CAN_OBSERVE is a module constant, so this
// never switches at runtime and neither component is ever remounted.
export function CountUp({ value }: CountUpProps) {
  return CAN_OBSERVE ? <AnimatedCountUp value={value} /> : <StaticCountUp value={value} />
}
