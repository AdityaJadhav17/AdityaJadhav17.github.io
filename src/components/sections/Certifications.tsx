import { ExternalLink, FileText } from 'lucide-react'
import { certifications } from '@/content/certifications'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'

// Compact row, not full-height cards. Badge PNGs are light artwork on
// transparent backgrounds, so each gets an explicit bg-card surface with
// padding (not just an ambient page background) so it stays legible in
// dark mode instead of reading as a floating white artifact.
export function Certifications() {
  const { ref, revealed } = useScrollReveal<HTMLElement>()

  return (
    <section
      id="certifications"
      ref={ref}
      className={cn('reveal border-t border-border py-16 md:py-24', !revealed && 'reveal-hidden')}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground">Certifications</h2>

        <ul className="mt-8 divide-y divide-border border-t border-border md:mt-12">
          {certifications.map((cert) => (
            <li
              key={cert.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex-none rounded-md bg-card p-2 shadow-sm">
                  <img
                    src={cert.badge}
                    alt={`${cert.title} badge`}
                    width={40}
                    height={40}
                    loading="lazy"
                    className="size-10 object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-heading text-sm font-semibold text-foreground">{cert.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {cert.issuer} · {cert.year}
                  </p>
                </div>
              </div>

              <div className="flex flex-none flex-wrap gap-x-4 gap-y-1">
                <a
                  href={cert.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground"
                >
                  <FileText aria-hidden="true" className="size-4" />
                  View Certificate
                </a>
                <a
                  href={cert.verify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  Verify
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
