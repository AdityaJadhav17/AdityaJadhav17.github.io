import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { experience } from '@/content/experience'
import { Reveal } from '@/components/motion/Reveal'
import { TimelineEntry } from '@/components/sections/TimelineEntry'

// Vertical timeline, newest first (order comes from src/content/experience.ts,
// which also carries a code comment noting the UC San Diego entry's
// highlights are scope-derived pending real accomplishments; not repeated
// or altered here). Dates render in font-mono per MASTER.md's typography rule.
//
// The connector was previously a per-entry segment inside each row. It is now
// one continuous track down the whole list, with an accent line drawn over it
// whose height follows scroll position, because a scrubbed draw needs a single
// element to scale rather than five independent ones.
export function Experience() {
  const listRef = useRef<HTMLOListElement>(null)

  // Explicit check, deliberately not delegated to the MotionConfig in
  // App.tsx. That handles animations; the line below is a MotionValue bound
  // to a style, which MotionConfig does not touch. Under reduced motion the
  // timeline renders fully drawn and every dot filled, statically.
  const reduced = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.8', 'end 0.6'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <Reveal as="section" id="experience" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Reveal.Item>
          <h2 className="font-heading text-3xl font-semibold text-foreground">Experience</h2>
        </Reveal.Item>

        {/* Wrapper supplies the positioning context for the track and drawn
            line instead of the <ol>: HTML's content model only allows <li>
            (and script-supporting elements) as direct children of an <ol>,
            so the two decorative spans live here. The <ol> keeps the ref
            useScroll targets and drops its own `relative` now that the
            wrapper provides it. */}
        <div className="relative mt-8 md:mt-12">
          {/* Static track and drawn line. left-[7px] centres a 1px rule under
              a 2.5-unit (10px) dot inside a 4-unit (16px) column: (16-1)/2
              rounds to 7. Verify by measurement, not by trusting this sum. */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px bg-border"
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-accent"
            style={{ scaleY: reduced ? 1 : progress }}
          />

          <ol ref={listRef} className="space-y-10">
            {experience.map((entry, index) => (
              <TimelineEntry
                key={`${entry.organization}-${entry.role}`}
                entry={entry}
                index={index}
                total={experience.length}
                progress={progress}
                reduced={reduced}
              />
            ))}
          </ol>
        </div>
      </div>
    </Reveal>
  )
}
