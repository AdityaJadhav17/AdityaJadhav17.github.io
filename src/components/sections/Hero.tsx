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
// reading order (identity, claim, portrait, then the supporting metadata),
// which puts the positioning claim above the fold on a phone instead of
// burying it under a tall portrait. At `lg` the same children are placed
// explicitly by row and column into the editorial arrangement: metadata
// across the top, claim anchored bottom-left, portrait absolutely positioned
// behind both.
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
      className="container-site relative grid min-h-[calc(100dvh-4rem-1px)] grid-cols-1 content-start gap-y-8 overflow-hidden py-20 lg:grid-cols-4 lg:content-stretch lg:gap-x-8 lg:grid-rows-[auto_1fr_auto_auto_auto] lg:py-12"
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
        className="hero-in relative z-10 max-w-[14ch] font-heading text-[clamp(2rem,5vw,4rem)] leading-[0.95] font-bold tracking-tight text-balance text-foreground uppercase lg:col-span-2 lg:col-start-1 lg:row-start-3 lg:max-w-[14ch]"
      >
        {site.positioning}
      </p>

      {/* Portrait. Absolute at lg only, so at mobile widths it sits in flow
          here in the reading order instead of overlapping the text stack. */}
      <HeroPortrait />

      {/* Current roles */}
      <div style={step(2)} className="hero-in relative z-10 lg:col-start-3 lg:row-start-1">
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

      {/* Footer band: availability left, proof right. A recruiter who reads
          nothing else should still leave with a number.

          Confined to the left two columns at lg. The portrait is absolutely
          positioned over the right half at that breakpoint, and these numbers
          set over the subject's arms are unreadable in both themes. */}
      <div
        style={step(4)}
        className="hero-in relative z-10 flex flex-col gap-5 lg:col-span-2 lg:col-start-1 lg:row-start-4"
      >
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {site.availability}
        </p>

        <ul className="flex flex-wrap gap-x-8 gap-y-4">
          {site.proof.map((point) => (
            <li key={point.label} className="max-w-[12rem] flex-1">
              <p className="font-mono text-xl font-medium text-accent tabular-nums">
                {point.value}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-snug text-muted-foreground">{point.label}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div
        className="relative z-10 flex flex-wrap items-center gap-3 lg:col-span-2 lg:col-start-1 lg:row-start-5"
      >
        <Button asChild size="lg">
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
            <Button key={link.label} asChild variant="outline" size="lg">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <Icon aria-hidden="true" className="size-4" />
                {link.label}
              </a>
            </Button>
          )
        })}
      </div>
    </section>
  )
}
