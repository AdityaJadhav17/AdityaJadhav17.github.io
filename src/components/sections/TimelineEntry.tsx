import { motion, useTransform, type MotionValue } from 'motion/react'
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
  // than snapping after it has already passed.
  const at = total > 1 ? index / (total - 1) : 0
  const fill = useTransform(progress, [Math.max(at - 0.08, 0), at], [0, 1])

  return (
    <Reveal.Item as="li" className="relative flex gap-4 sm:gap-6">
      <div aria-hidden="true" className="flex w-4 flex-none justify-center">
        <span className="relative mt-1.5 size-2.5 flex-none rounded-full bg-border ring-4 ring-background">
          <motion.span
            className="absolute inset-0 rounded-full bg-accent"
            style={{ scale: reduced ? 1 : fill }}
          />
        </span>
      </div>

      <div className="flex-1 pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-heading text-lg font-semibold text-foreground">{entry.role}</h3>
          <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
            {entry.start} – {entry.end}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {entry.organization}
          {entry.location ? ` · ${entry.location}` : ''}
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground">
          {entry.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
    </Reveal.Item>
  )
}
