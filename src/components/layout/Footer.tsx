import { ArrowUp, Download, Mail } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { site } from '@/content/site'

// Brand marks come from react-icons because Lucide 1.x resolves
// Github/Linkedin/Youtube as undefined; Lucide covers every other icon,
// including the generic Mail glyph for the email link (not a brand mark, so
// it stays Lucide rather than react-icons/md).
const SOCIAL_ICONS: Record<string, typeof FaGithub> = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
}

// Icon-only links get the same "expand the hit area without growing the
// glyph" treatment as Navbar's mobile-menu trigger: a before-pseudo-element
// inset -8px on every side. Measured (not assumed) rendered size is 46x46,
// not the naively-expected 48x48. The inset on an absolutely-positioned
// pseudo-element resolves against the button's padding box, so its 1px
// border eats 1px off each side before the -8px inset adds it back. 46px
// still clears the 44x44 CSS px minimum for icon-only controls on mobile.
//
// The container gap must be >= this pseudo-element's growth (8px per side
// = 16px total), or adjacent hit areas overlap, making a tap near the
// boundary ambiguous: WCAG 2.5.8's spacing exception does not apply once
// targets actually overlap. gap-4 (16px) was verified by measuring each
// ::before's derived rect and by elementFromPoint hit-testing across the
// boundary, confirming a clean handoff with a couple px of clearance, not
// an overlap.
const ICON_LINK_CLASS = 'relative before:absolute before:-inset-2 before:content-[\'\']'

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

          <div className="flex flex-wrap items-center gap-4">
            <Button asChild variant="outline" size="icon" className={ICON_LINK_CLASS}>
              <a href={`mailto:${site.email}`} aria-label="Email me">
                <Mail aria-hidden="true" className="size-4" />
              </a>
            </Button>

            {site.social.map((link) => {
              const Icon = SOCIAL_ICONS[link.label] ?? Mail
              return (
                <Button
                  key={link.label}
                  asChild
                  variant="outline"
                  size="icon"
                  className={ICON_LINK_CLASS}
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                    <Icon aria-hidden="true" className="size-4" />
                  </a>
                </Button>
              )
            })}

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
