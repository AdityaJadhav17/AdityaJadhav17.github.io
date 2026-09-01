import { ArrowUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { site } from '@/content/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-heading text-base font-semibold text-foreground">{site.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{site.tagline}</p>
          </div>

          {/* Email, GitHub and LinkedIn used to repeat here. Contact is the
              last section on the page, so this sat roughly one screen below
              the same three links and nobody reaches the footer without
              passing them. The resume button stays because it is the one
              action here that is NOT duplicated in Contact, which makes it a
              genuine last chance rather than an echo. */}
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <a href={site.resumePath} download>
                <Download aria-hidden="true" className="icon-nudge transition-transform duration-200 group-hover/button:translate-y-0.5" />
                Résumé
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground">
            &copy; {year} {site.name}. All rights reserved.
          </p>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp aria-hidden="true" className="size-4" />
            Back to top
          </Button>
        </div>
      </div>
    </footer>
  )
}
