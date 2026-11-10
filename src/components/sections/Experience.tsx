import { useEffect, useRef } from 'react'
import { experience } from '@/content/experience'
import { Reveal } from '@/components/motion/Reveal'
import { railProgress } from '@/lib/motion'
import { TimelineEntry } from '@/components/sections/TimelineEntry'

// Vertical timeline, newest first (order comes from src/content/experience.ts,
// which also carries a code comment noting the UC San Diego entry's
// highlights are scope-derived pending real accomplishments; not repeated
// or altered here). Dates render in tabular Archivo; mono is for stack tags only.
//
// The connector was previously a per-entry segment inside each row. It is now
// one continuous track down the whole list, with an accent line drawn over it
// whose height follows scroll position, because a scrubbed draw needs a single
// element to scale rather than five independent ones.
// Paid roles first, then the club roles under a "Leadership" subheading. One
// rail runs through both lists; the subheading sits in the content column so
// the rail never strikes through it.
const groups = [
  { id: 'work', entries: experience.filter((e) => e.group === 'work') },
  { id: 'leadership', entries: experience.filter((e) => e.group === 'leadership') },
]

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null)

  // The scroll position drives one CSS variable, --p, on the list wrapper.
  // The rail and the dots read it in theme.css (.rail-line, .rail-dot), which
  // also draws everything fully under reduced motion. Scroll events arrive at
  // most once a frame, and each does one read then one write.
  useEffect(() => {
    const node = listRef.current
    if (!node) return
    const update = () => {
      const { top, height } = node.getBoundingClientRect()
      node.style.setProperty('--p', railProgress(top, height, window.innerHeight).toFixed(3))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <Reveal as="section" id="experience" className="py-16 md:py-20">
      <div className="container-site">
        <Reveal.Item>
          <h2 className="section-title">Experience</h2>
        </Reveal.Item>

        {/* Wrapper supplies the positioning context for the track and drawn
            line and the ref the scroll handler measures: HTML's content model only
            allows <li> (and script-supporting elements) as direct children
            of an <ol>, so the two decorative spans live here. */}
        <div ref={listRef} className="relative mt-8 md:mt-12">
          {/* Static track and drawn line, centred under the dot column: left
              7px for the 16px column below lg, and 10px past the 8rem date
              column for the 12px one from lg (a 1px rule cannot be centred in
              an even column, so both sit half a pixel left). Verify by
              measurement, not by trusting this sum. */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px bg-border lg:left-[calc(8rem+10px)]"
          />
          <span
            aria-hidden="true"
            className="rail-line absolute top-2 bottom-2 left-[7px] w-px origin-top bg-accent-signal lg:left-[calc(8rem+10px)]"
          />

          {groups.map(({ id, entries }) => (
            <div key={id} className={id === 'leadership' ? 'mt-12' : undefined}>
              {id === 'leadership' && (
                <h3 className="label mb-6 pl-8 sm:pl-10 lg:pl-[calc(8rem+22px)]">Leadership</h3>
              )}
              <ol className="space-y-10">
                {entries.map((entry) => (
                  <TimelineEntry
                    key={`${entry.organization}-${entry.role}`}
                    entry={entry}
                    index={experience.indexOf(entry)}
                    total={experience.length}
                  />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
