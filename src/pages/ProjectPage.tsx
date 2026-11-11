import type { CSSProperties, ReactNode } from 'react'
import { Award, ExternalLink, FileText } from 'lucide-react'
import { FaGithub, FaYoutube } from 'react-icons/fa'
import type { Block, CaseStudy } from '@/content/case-study'
import type { Project } from '@/content/projects'
import { site } from '@/content/site'
import { pagePath } from '@/lib/pages'
import { SkipLink } from '@/components/layout/SkipLink'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Layout A from the design spec: one column, facts under the title. Everything
// sits on container-site so the breadcrumb, the h1, every h2 and the footer
// share the header's left edge, as on the homepage. Prose stops at 65ch; the
// facts strip, the screenshot and the results table may use the full width.

// Header entrance: the homepage hero's CSS stagger (.hero-in in theme.css).
const step = (i: number) => ({ '--i': i }) as CSSProperties

// lg:col-start-2: from lg every prose block sits in the section's right column.
const prose = 'max-w-[65ch] text-base leading-relaxed text-pretty text-foreground md:text-[1.0625rem] lg:col-start-2'
// The card's link style: 14px text, the ::after grows the hit area to 44px.
const linkClass =
  "relative inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-200 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:decoration-2"

function BlockView({ block }: { block: Block }) {
  if ('p' in block) return <p className={prose}>{block.p}</p>
  if ('ul' in block)
    return (
      <ul className={`${prose} list-disc space-y-2 pl-5 marker:text-muted-foreground`}>
        {block.ul.map((li) => <li key={li}>{li}</li>)}
      </ul>
    )
  const { caption, head, rows } = block.table
  return (
    <figure className="space-y-3 lg:col-span-2">
      {/* The caption is shown here, outside the scroll box, so a phone never
          clips it; the table keeps it for screen readers. */}
      <p aria-hidden="true" className="label max-w-[65ch]">{caption}</p>
      {/* Scrolls sideways inside its own box on a phone, never the page. It is
          focusable so a keyboard can scroll it; the shadows at its edges show
          there is more (.scroll-shadow in theme.css). */}
      <div
        tabIndex={0}
        role="region"
        aria-label={caption}
        className="scroll-shadow overflow-x-auto overscroll-x-contain rounded-lg border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border">
              {head.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 align-bottom font-heading font-semibold text-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.join('|')} className="border-b border-border last:border-0">
                {r.map((c, i) => (
                  <td key={i} className={i === 0 ? 'px-4 py-3 text-foreground' : 'px-4 py-3 text-muted-foreground'}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="py-4 md:py-5">
      <dt className="label">{term}</dt>
      <dd className="mt-1 text-sm leading-snug text-foreground md:text-base">{children}</dd>
    </div>
  )
}

function ProjectLinks({ project }: { project: Project }) {
  const { github, live, demo, paper } = project.links
  const other = live ?? demo
  const OtherIcon = !live && demo?.includes('youtu') ? FaYoutube : ExternalLink
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-2">
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <FaGithub aria-hidden="true" className="size-4" />
          Code
        </a>
      )}
      {other && (
        <a href={other} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <OtherIcon aria-hidden="true" className="size-4" />
          {live ? 'Live' : 'Demo'}
        </a>
      )}
      {paper && (
        <a href={paper} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <FileText aria-hidden="true" className="size-4" />
          Paper
        </a>
      )}
    </span>
  )
}

// Eager and high priority: on this page the screenshot is the image that matters.
function Screenshot({ project }: { project: Project }) {
  const image = project.image
  if (!image) return null
  // Light captures are dimmed in dark theme so they do not glare, as on the cards.
  const dim = image.tone === 'light' && 'dark:brightness-[.85]'
  return (
    <picture className="mt-10 block md:mt-12">
      {image.mobileSrcSet && <source media="(width < 48rem)" srcSet={image.mobileSrcSet} sizes="calc(100vw - 40px)" />}
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="(min-width: 1200px) 1104px, (min-width: 1024px) calc(100vw - 96px), calc(100vw - 64px)"
        alt={image.alt}
        width={image.width}
        height={image.height}
        fetchPriority="high"
        className={cn('aspect-[4/3] h-auto w-full rounded-xl object-cover ring-1 ring-border md:aspect-[16/10]', dim)}
      />
    </picture>
  )
}

export function ProjectPage({ project, study, next }: { project: Project; study: CaseStudy; next: Project }) {
  const { facts } = study
  return (
    <>
      <SkipLink />
      <Navbar sectionIds={[]} base="/" />
      <main id="main" className="container-site pt-8 pb-20 md:pt-14 md:pb-32">
        <article>
          <header>
            <nav aria-label="Breadcrumb" style={step(0)} className="hero-in">
              <ol className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                <li>
                  <a href="/" className="relative underline-offset-4 after:absolute after:-inset-3 after:content-[''] hover:text-foreground hover:underline">
                    {site.name}
                  </a>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <a href="/#work" className="relative underline-offset-4 after:absolute after:-inset-3 after:content-[''] hover:text-foreground hover:underline">
                    Projects
                  </a>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground">
                  {project.title}
                </li>
              </ol>
            </nav>

            {project.award && (
              <p
                style={step(1)}
                className="hero-in mt-8 inline-flex items-center gap-2 rounded-md border border-border bg-muted px-2.5 py-1 text-sm font-medium text-foreground md:mt-10"
              >
                <Award aria-hidden="true" className="size-4 shrink-0 stroke-accent-signal" />
                {project.award}
              </p>
            )}

            <h1
              style={step(2)}
              className="hero-in mt-4 font-heading text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] font-bold tracking-tight text-balance text-foreground uppercase"
            >
              {project.title}
            </h1>
            <p style={step(3)} className="hero-in mt-5 max-w-[48ch] text-lg leading-snug text-pretty text-muted-foreground md:text-xl">
              {project.summary}
            </p>

            <dl
              style={step(4)}
              className="hero-in mt-8 grid grid-cols-2 gap-x-6 border-y border-border md:mt-12 md:grid-cols-4 md:gap-x-8"
            >
              <Fact term="Result">{facts.result}</Fact>
              <Fact term="My role">{facts.role}</Fact>
              <Fact term="Team">{facts.team}</Fact>
              <Fact term="Links">
                <ProjectLinks project={project} />
              </Fact>
            </dl>
          </header>

          <Screenshot project={project} />

          <div className="mt-16 space-y-14 md:mt-24 md:space-y-20">
            {study.sections.map((s) => (
              <Reveal as="section" key={s.heading}>
                {/* From lg the heading takes a left rail and the prose a 65ch
                    column ending at the container's right edge, so the article
                    fills the width; the table spans both. The 17px font size
                    makes the 65ch track match the prose's own measure. minmax(0,1fr)
                    below lg keeps the wide table from widening the page. */}
                <Reveal.Item className="grid grid-cols-[minmax(0,1fr)] gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,65ch)] lg:gap-x-12 lg:text-[1.0625rem]">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-balance text-foreground md:text-3xl">
                    {s.heading}
                  </h2>
                  {s.body.map((b, i) => <BlockView key={i} block={b} />)}
                </Reveal.Item>
              </Reveal>
            ))}
          </div>
        </article>

        <Reveal className="mt-20 border-t border-border pt-12 md:mt-32 md:pt-16">
          <Reveal.Item className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 px-4">
              <a href={site.resumePath}>
                <FileText aria-hidden="true" />
                View résumé
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-4">
              <a href="/#contact">Contact me</a>
            </Button>
          </Reveal.Item>
          {/* With one published page the next project is this one; no self-link. */}
          {next.slug !== project.slug && (
            <Reveal.Item className="mt-12 md:mt-16">
              <a href={pagePath(next.slug)} className="group block max-w-[65ch]">
                <span className="label">Next project</span>
                <span className="mt-1 block font-heading text-2xl font-bold tracking-tight text-foreground underline-offset-4 group-hover:underline md:text-3xl">
                  {next.title}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{next.summary}</span>
              </a>
            </Reveal.Item>
          )}
        </Reveal>
      </main>
      <Footer />
    </>
  )
}
