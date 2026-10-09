import { ChevronDown, ExternalLink, FileText } from 'lucide-react'
import { FaGithub, FaYoutube } from 'react-icons/fa'
import type { Project } from '@/content/projects'
import { TierChart } from '@/components/TierChart'
import { cn } from '@/lib/utils'

type ProjectCardProps = {
  project: Project
  className?: string
  // 'stacked' is the grid card: poster above the text, inside a bordered card.
  // 'wide' is the featured treatment from md up: no card chrome at all, the
  // poster at 45% of the container width with the text beside it. Below md it
  // is the same carded, stacked card as every grid card, so a phone sees one
  // treatment. The hierarchy between featured and grid reads from layout, not
  // from a heavier border or shadow.
  layout?: 'stacked' | 'wide'
}

// One shape for every project card. Collapsed it is poster, title, context,
// one outcome line (the metric in accent ink), five stack tags, links; the Problem
// -> What I built -> Stack -> Result story sits in a <details> below.
// `result` is optional and the card reads as complete without it;
// `project.image` is optional (watchtower, talk-to-robot) and falls back to
// a typographic treatment built entirely from design tokens, with no
// AI-generated art.
const MAX_TAGS = 5
// `sizes` for the poster, written from measured renders (CSS px at viewport
// widths 360/390/412/640/768/1024/1280/1440/1920). The container pads 20px
// (<768), 32px (768+), 48px (1024+) and stops at 1200px.
// Wide (no wrapper padding; 45% of the container from 768; below that the
// carded stack, whose poster is the container minus 2px border and 24px padding):
// 294/324/346 at 360/390/412, 574 at 640, 701 at 767, 317 at 768, 418 at 1024,
// 497 from 1200 up.
// Stacked (two columns from 640; the poster adds 12px padding a side):
// 294/324/346 at 360/390/412, 262 at 640, 314 at 768, 426 at 1024, 514 from
// 1280 up.
const SIZES = {
  wide:
    '(min-width: 1200px) 497px, (min-width: 1024px) calc(45vw - 43px), (min-width: 768px) calc(45vw - 29px), calc(100vw - 66px)',
  stacked:
    '(min-width: 1200px) 514px, (min-width: 1024px) calc(50vw - 86px), (min-width: 768px) calc(50vw - 70px), (min-width: 640px) calc(50vw - 58px), calc(100vw - 66px)',
}
const tagClass =
  'rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground'
// Visible text stays 14px; the pseudo-element grows the hit area to 44px
// without overlapping its neighbour (gap-4 = 16px, each side adds 8px).
const linkClass =
  "relative inline-flex items-center gap-1.5 font-sans text-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-200 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:decoration-2"

export function ProjectCard({ project, className, layout = 'stacked' }: ProjectCardProps) {
  const isWide = layout === 'wide'
  // Featured posters are 4:3 on phones (a taller crop keeps the text legible), 16:10 from md.
  const ratio = isWide ? 'aspect-[4/3] md:aspect-[16/10]' : 'aspect-[2/1]'
  const shownStack = project.stack.slice(0, MAX_TAGS)
  const hiddenCount = project.stack.length - shownStack.length
  const { outcome, metric } = project
  const at = metric ? outcome.indexOf(metric) : -1
  const before = at < 0 ? outcome : outcome.slice(0, at)
  const after = at < 0 ? '' : outcome.slice(at + metric!.length)
  // Apply the brand-mark split consistently: every links.github
  // points at GitHub, so the code link always gets the real GitHub mark.
  // A demo link only gets the YouTube mark when it actually is one
  // (travel-agntcy's is youtu.be; sim2real's is a Kaggle URL and stays
  // generic); a live-site link is never a brand link, so it always stays
  // the generic Lucide ExternalLink. Restores the previous site's
  // FaGithub / FaYoutube / FiExternalLink split.
  const codeLink = project.links.github
  const liveLink = project.links.live
  const demoLink = project.links.demo
  const secondaryLink = liveLink ?? demoLink
  const paperLink = project.links.paper
  const secondaryLabel = liveLink ? 'Live' : 'Demo'
  const isYouTubeDemo = !liveLink && Boolean(demoLink) && demoLink!.includes('youtu')
  const SecondaryIcon = isYouTubeDemo ? FaYoutube : ExternalLink

  return (
    <article
      id={`project-${project.id}`}
      className={cn(
        // The shadow lift alone is invisible in dark theme: the shadow colour
        // is black at 10%, so on a rgb(9,9,11) ground it darkens an already
        // near-black area by about one value. Measured identical rest and
        // hover appearance in dark, while light reads correctly. The border
        // lift is what carries the hover on dark, and it reads on both.
        //
        // Deliberately neutral and quiet rather than an accent border: this
        // article is not clickable, only the Code and Live links inside it
        // are, so a strong affordance here would promise something the card
        // does not do.
        'flex flex-col',
        // Featured: carded like the grid below md, then bare layout (no border,
        // ground or shadow) and side by side from md up.
        'overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md',
        isWide
          ? 'md:flex-row md:items-center md:gap-10 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none'
          : 'transition-[box-shadow,border-color] duration-200 hover:border-muted-foreground/40 hover:shadow-lg',
        className,
      )}
    >
      <div
        className={cn(
          // Grid cards: the padding and muted ground frame the screenshot as
          // an artefact instead of a white slab running edge to edge.
          // Featured: from md the image stands alone at 45% width.
          'shrink-0 border-b border-border bg-muted p-3',
          isWide && 'md:w-[45%] md:border-0 md:bg-transparent md:p-0',
        )}
      >
        {project.chart ? (
          <TierChart
            alt={project.chart.alt}
            className={cn('w-full bg-card ring-1 ring-border', isWide ? 'rounded-md md:rounded-lg' : 'rounded-md', ratio)}
          />
        ) : project.image ? (
          <picture className="block">
            {project.image.mobileSrcSet && (
              <source media="(max-width: 767px)" srcSet={project.image.mobileSrcSet} sizes={SIZES.wide} />
            )}
            <img
              src={project.image.src}
              srcSet={project.image.srcSet}
              sizes={isWide ? SIZES.wide : SIZES.stacked}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              loading="lazy"
              decoding="async"
              className={cn(
                // Every image is pre-cropped to its slot (16:10 wide, 4:3 on
                // phones, 2:1 in the grid), so object-cover only absorbs rounding. Each project shows
                // the same screen in both themes; light screenshots are dimmed in
                // dark theme so they do not glare. Never inverted.
                'w-full object-cover ring-1 ring-border',
                isWide ? 'rounded-md md:rounded-lg' : 'rounded-md',
                project.image.tone === 'light' && 'dark:brightness-[.85]',
                ratio,
              )}
            />
          </picture>
        ) : (
          <div
            aria-hidden="true"
            className={cn(
              'flex w-full flex-col justify-center gap-2 bg-muted p-6',
              isWide ? 'aspect-[4/3] rounded-md md:aspect-[16/10] md:rounded-lg' : 'aspect-video',
            )}
          >
            <p className="font-heading text-2xl leading-tight font-semibold tracking-tight text-foreground uppercase md:text-3xl">
              {project.title}
            </p>
            <div className="h-px w-12 bg-border" />
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {project.stack.slice(0, 4).join(' / ')}
            </p>
          </div>
        )}
      </div>

      <div className={cn('flex flex-1 flex-col gap-4 p-6', isWide && 'md:p-0')}>
        <div className="space-y-1">
          <h3 className={cn('font-heading text-xl font-semibold text-card-foreground', isWide && 'md:text-2xl')}>
            {project.title}
          </h3>
          {project.context && <p className="label">{project.context}</p>}
        </div>

        <p className="text-base text-card-foreground">
          {before}
          {metric && <span className="font-semibold text-accent-ink tabular-nums">{metric}</span>}
          {after}
        </p>

        <ul className="flex flex-wrap gap-1.5">
          {shownStack.map((tech) => (
            <li key={tech} className={tagClass}>
              {tech}
            </li>
          ))}
          {hiddenCount > 0 && (
            <li className={tagClass}>
              <span aria-hidden="true">+{hiddenCount}</span>
              <span className="sr-only">and {hiddenCount} more</span>
            </li>
          )}
        </ul>

        {(codeLink || secondaryLink || paperLink) && (
          <div className="mt-auto flex flex-wrap gap-4">
            {codeLink && (
              <a href={codeLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <FaGithub aria-hidden="true" className="size-4" />
                Code
              </a>
            )}
            {secondaryLink && (
              <a
                href={secondaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(linkClass, 'group/link')}
              >
                {/* Leans up and to the right, the direction the link goes.
                    Only for the generic external-link glyph: when the demo is
                    a YouTube link this renders the brand mark instead, which
                    stays still. */}
                <SecondaryIcon
                  aria-hidden="true"
                  className={cn(
                    'size-4',
                    !isYouTubeDemo &&
                      'icon-nudge transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5',
                  )}
                />
                {secondaryLabel}
              </a>
            )}

            {paperLink && (
              <a
                href={paperLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(linkClass, 'group/link')}
              >
                <FileText
                  aria-hidden="true"
                  className="icon-nudge size-4 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
                Paper
              </a>
            )}
          </div>
        )}

        {/* Native disclosure: no JS, keyboard and screen-reader support for
            free, and the closed content stays in the prerendered HTML. The
            chevron turns by rotation, not translation, so it may keep
            animating under reduced motion. */}
        <details className="group -mb-2 border-t border-border">
          <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 select-none hover:text-foreground [&::-webkit-details-marker]:hidden">
            Read the details
            <span className="sr-only"> about {project.title}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="space-y-4 pt-2 pb-2">
            <div>
              <p className="label">Problem</p>
              <p className="mt-1 text-sm text-card-foreground">{project.problem}</p>
            </div>
            <div>
              <p className="label">What I built</p>
              <p className="mt-1 text-sm text-card-foreground">{project.contribution}</p>
            </div>
            <div>
              <p className="label">Stack</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li key={tech} className={tagClass}>
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            {project.result && (
              <div>
                <p className="label">Result</p>
                <p className="mt-1 max-w-[68ch] text-base text-foreground">{project.result}</p>
              </div>
            )}
          </div>
        </details>
      </div>
    </article>
  )
}
