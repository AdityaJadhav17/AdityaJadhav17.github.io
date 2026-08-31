import { experience } from '@/content/experience'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'

// Vertical timeline, newest first (order comes from src/content/experience.ts,
// which also carries a code comment noting the UC San Diego entry's
// highlights are scope-derived pending real accomplishments; not repeated
// or altered here). Dates render in font-mono per MASTER.md's typography rule.
export function Experience() {
  const { ref, revealed } = useScrollReveal<HTMLElement>()

  return (
    <section
      id="experience"
      ref={ref}
      className={cn('reveal border-t border-border py-16 md:py-24', !revealed && 'reveal-hidden')}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground">Experience</h2>

        <ol className="mt-8 space-y-10 md:mt-12">
          {experience.map((entry, index) => (
            <li key={`${entry.organization}-${entry.role}`} className="relative flex gap-4 sm:gap-6">
              <div aria-hidden="true" className="flex w-4 flex-none flex-col items-center">
                <span className="mt-1.5 size-2.5 flex-none rounded-full bg-accent ring-4 ring-background" />
                {index < experience.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {entry.role}
                  </h3>
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
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
