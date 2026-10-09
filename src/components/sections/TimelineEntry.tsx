import { m, useTransform, type MotionValue } from 'motion/react'
import { Reveal } from '@/components/motion/Reveal'
import type { Experience } from '@/content/experience'

type TimelineEntryProps = {
  entry: Experience
  index: number
  total: number
  progress: MotionValue<number>
  reduced: boolean
}

// One row of the Experience timeline. This is a separate component because
// each row needs its own useTransform slice of the shared scroll progress to
// fill its dot as the drawn line arrives, and hooks cannot be called in a
// loop inside the parent's map.
export function TimelineEntry({ entry, index, total, progress, reduced }: TimelineEntryProps) {
  // Where this dot sits along the line: the first at 0, the last at 1.
  // The 0.08 lead-in makes the dot fill just as the line reaches it rather
  // than snapping after it has already passed. Called unconditionally so
  // hook order stays stable across rows, even though its result is
  // overridden below for the first entry.
  const at = total > 1 ? index / (total - 1) : 0
  const fill = useTransform(progress, [Math.max(at - 0.08, 0), at], [0, 1])

  // The first entry sits at progress 0, so its lead-in range above collapses
  // to [0, 0]. It has no meaningful "unfilled" state to transition from, so
  // state that intent plainly instead of relying on how useTransform happens
  // to resolve a zero-width range.
  const dotFill = index === 0 ? 1 : fill

  // Leadership roles are one step lighter (smaller title, one heading level
  // down under the "Leadership" subheading).
  const minor = entry.group === 'leadership'
  const Title = minor ? 'h4' : 'h3'

  // One grid per row, flat children, so the date can sit under the title below
  // lg and in its own left column from lg up without being written twice.
  // lg columns: date (8rem, right-aligned) | dot (12px) | content, with the
  // rail drawn by Experience at the dot column's centre. Date edge to content
  // edge is 5 + 12 + 5 = 22px.
  return (
    <Reveal.Item
      as="li"
      id={`experience-${entry.id}`}
      className="relative grid grid-cols-[1rem_1fr] gap-x-4 sm:gap-x-6 lg:grid-cols-[8rem_0.75rem_1fr] lg:gap-x-[5px]"
    >
      <div aria-hidden="true" className="col-start-1 row-start-1 flex justify-center lg:col-start-2">
        <span className="relative mt-1.5 size-2.5 flex-none rounded-full bg-border ring-4 ring-background">
          <m.span
            className="absolute inset-0 rounded-full bg-accent-signal"
            style={{ scale: reduced ? 1 : dotFill }}
          />
        </span>
      </div>

      <Title
        className={`col-start-2 row-start-1 font-heading font-semibold text-foreground lg:col-start-3 lg:self-baseline ${minor ? 'text-base' : 'text-lg'}`}
      >
        {entry.role}
      </Title>
      <span className="col-start-2 row-start-2 text-xs whitespace-nowrap text-muted-foreground tabular-nums lg:col-start-1 lg:row-start-1 lg:justify-self-end lg:self-baseline">
        {entry.start} – {entry.end}
      </span>
      <p className="col-start-2 row-start-3 text-sm text-muted-foreground lg:col-start-3 lg:row-start-2">
        {entry.organization}
        {entry.location ? ` · ${entry.location}` : ''}
      </p>
      <ul className="col-start-2 row-start-4 mt-3 max-w-[70ch] list-disc space-y-1.5 pb-2 pl-5 text-[0.9375rem] text-foreground lg:col-start-3 lg:row-start-3">
        {entry.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </Reveal.Item>
  )
}
