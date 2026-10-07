import type { CSSProperties } from 'react'
import { Download, ExternalLink } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { HeroPortrait } from '@/components/sections/HeroPortrait'
import { Button } from '@/components/ui/button'
import { currentRoles, site } from '@/content/site'

// lucide-react ships no brand/logo marks (Github/Linkedin/Youtube all
// resolve undefined), so official brand glyphs come from react-icons,
// already a dependency (Footer.tsx, Contact.tsx). Lucide stays the icon set
// for every non-brand UI icon (Download, above). ExternalLink is kept as the
// fallback glyph for a social label this map doesn't recognize, so an
// unexpected future entry in site.social still renders sensibly.
const SOCIAL_ICONS: Record<string, typeof FaGithub> = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
}

// Hero entrance step: the .hero-in CSS class staggers by --i (theme.css).
const step = (i: number) => ({ '--i': i }) as CSSProperties

// Hero: a multi-column editorial composition rather than a centred stack.
//
// One CSS grid drives both layouts. The DOM order below is the mobile
// reading order: identity, claim, availability, actions, portrait, then the
// supporting metadata. That puts the claim and the primary CTA in the first
// phone screen instead of under a tall portrait. At `lg` the same children
// are placed explicitly by row and column: metadata across the top, the claim
// directly under it, availability and actions beneath the claim, proof pinned
// to the bottom, portrait absolutely positioned behind the right half.
//
// Height: the design brief says never `100vh`, which excludes mobile browser
// chrome and causes a jump on load. It is `calc(100dvh-4rem-1px)` rather than
// a plain `100dvh` because Navbar.tsx is `sticky` and therefore still in
// flow: a full-dvh hero underneath it ends 65px below the fold and crops the
// portrait. The 4rem is the header's `h-16` and the 1px its `border-b`. Keep
// both in sync with Navbar.tsx.
//
// Width: the same container-site as the header and every section, so the
// name, the section titles and the footer all start on one left edge. The
// portrait is absolutely positioned inside it.
export function Hero() {
  return (
    <section
      id="home"
      className="container-site relative grid min-h-[calc(100dvh-4rem-1px)] grid-cols-1 content-start gap-y-6 overflow-hidden pt-8 pb-16 lg:grid-cols-4 lg:content-stretch lg:gap-x-8 lg:grid-rows-[auto_auto_auto_auto_1fr] lg:gap-y-0 lg:py-12"
    >
      {/* Identity */}
      <div style={step(0)} className="hero-in relative z-10 lg:col-start-1 lg:row-start-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {site.name}
        </h1>
        <p className="label mt-2">
          {site.discipline}
        </p>
      </div>

      {/* The claim. The single most important sentence on the site, so it is
          the largest element and it stays in the accessibility tree. z-10
          puts it in front of the portrait, which is what makes the two read
          as one composition rather than a photo with a caption. */}
      <p
        style={step(1)}
        className="hero-in relative z-10 max-w-[14ch] font-heading text-[clamp(2rem,5vw,4rem)] leading-[0.95] font-bold tracking-tight text-balance text-foreground uppercase lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mt-16 lg:max-w-[14ch]"
      >
        {site.positioning}
      </p>

      {/* Availability. Confined to the left two columns at lg: the portrait
          sits over the right half there, and text set over the subject's arms
          is unreadable in both themes. */}
      <p
        style={step(2)}
        className="hero-in relative z-10 max-w-sm text-sm leading-relaxed text-muted-foreground lg:col-span-2 lg:col-start-1 lg:row-start-3 lg:mt-8"
      >
        {site.availability}
      </p>

      {/* Actions. Not animated: the primary CTA is visible from first paint.
          Phone: résumé full width, the two profiles side by side below it. */}
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center lg:col-span-2 lg:col-start-1 lg:row-start-4 lg:mt-6">
        <Button asChild size="lg" className="col-span-2 h-11">
          <a href={site.resumePath} download>
            {/* The arrow leans toward what the button does. Brand marks below
                are deliberately left still: a company's logo should not
                wiggle. */}
            <Download aria-hidden="true" className="icon-nudge transition-transform duration-200 group-hover/button:translate-y-0.5" />
            Download résumé
          </a>
        </Button>

        {site.social.map((link) => {
          const Icon = SOCIAL_ICONS[link.label] ?? ExternalLink
          return (
            <Button key={link.label} asChild variant="outline" size="lg" className="h-11">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <Icon aria-hidden="true" className="size-4" />
                {link.label}
              </a>
            </Button>
          )
        })}
      </div>

      {/* Portrait. Absolute at lg only, so at mobile widths it sits in flow
          here in the reading order instead of overlapping the text stack. */}
      <HeroPortrait />

      {/* Current roles */}
      <div style={step(3)} className="hero-in relative z-10 lg:col-start-3 lg:row-start-1">
        <p id="hero-currently" className="label">Currently</p>
        <ul aria-labelledby="hero-currently" className="mt-3 space-y-1.5">
          {currentRoles.map((role) => (
            <li key={role} className="text-sm leading-snug text-foreground">
              {role}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-xs text-muted-foreground">{site.location}</p>
      </div>

      {/* Capabilities */}
      <div style={step(3)} className="hero-in relative z-10 lg:col-start-4 lg:row-start-1">
        <p className="label">Capabilities</p>
        <ul className="mt-3 space-y-1.5">
          {site.capabilities.map((capability) => (
            <li key={capability} className="text-sm leading-snug text-muted-foreground">
              {capability}
            </li>
          ))}
        </ul>
      </div>

      {/* Proof. A recruiter who reads nothing else should still leave with a
          number. Phone: one row per figure, so no label wraps past two lines.
          Left two columns at lg, for the same reason as availability. */}
      <ul
        style={step(4)}
        className="hero-in relative z-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-4 lg:col-span-2 lg:col-start-1 lg:row-start-5 lg:self-end"
      >
        {site.proof.map((point) => (
          <li key={point.label} className="flex items-baseline gap-4 sm:block sm:max-w-[12rem] sm:flex-1">
            <p className="w-20 shrink-0 font-mono text-xl font-medium text-accent tabular-nums sm:w-auto">
              {point.value}
            </p>
            <p className="text-[0.8125rem] leading-snug text-muted-foreground sm:mt-1">{point.label}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
