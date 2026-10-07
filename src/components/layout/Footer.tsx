import { ArrowUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { currentRoles, site } from '@/content/site'

// No `behavior` on purpose: theme.css sets `scroll-behavior` (smooth, or auto
// under prefers-reduced-motion), so the CSS decides. Focus then follows the
// scroll to the hero, same pattern as the Navbar section jumps, so a keyboard
// user does not stay parked on a button at the bottom of the page.
function backToTop() {
  window.scrollTo({ top: 0 })
  const home = document.getElementById('home')
  if (!home) return
  home.setAttribute('tabindex', '-1')
  home.addEventListener('blur', () => home.removeAttribute('tabindex'), { once: true })
  home.focus({ preventScroll: true })
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-site py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-heading text-base font-semibold text-foreground">{site.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{currentRoles.join(' · ')}</p>
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

        <div className="mt-8 flex flex-col items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="ghost" size="sm" onClick={backToTop}>
            <ArrowUp aria-hidden="true" className="size-4" />
            Back to top
          </Button>
        </div>
      </div>
    </footer>
  )
}
