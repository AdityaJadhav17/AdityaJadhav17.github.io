import { Download, ExternalLink, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { site } from '@/content/site'

// Hero — name, both current roles (folded into `site.tagline`, the
// one-line positioning statement), résumé download, and social links.
// `min-h-dvh` per the design brief — never `100vh`, which excludes mobile
// browser chrome and causes a jump on load.
export function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-24 text-center md:px-6"
    >
      {/* LCP element: eager-loaded, intrinsic size fixed to prevent layout shift. */}
      <img
        src="/aditya-profile.jpg"
        alt={`${site.name} headshot`}
        width={200}
        height={200}
        loading="eager"
        className="size-[200px] rounded-full border border-border object-cover shadow-xl"
      />

      <div className="max-w-2xl space-y-3">
        <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
          {site.name}
        </h1>
        <p className="font-sans text-lg text-muted-foreground md:text-xl">{site.tagline}</p>
        <p className="flex items-center justify-center gap-1.5 font-sans text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-4" />
          {site.location}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <a href={site.resumePath} download>
            <Download aria-hidden="true" />
            Download résumé
          </a>
        </Button>

        {site.social.map((link) => (
          <Button key={link.label} asChild variant="outline" size="lg">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          </Button>
        ))}
      </div>
    </section>
  )
}
