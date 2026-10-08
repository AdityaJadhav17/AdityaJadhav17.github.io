import { ChevronDown, ExternalLink, FileText } from 'lucide-react'
import { FaGithub, FaYoutube } from 'react-icons/fa'
import type { Project } from '@/content/projects'
import { TierChart } from '@/components/TierChart'
import { cn } from '@/lib/utils'

type ProjectCardProps = {
  project: Project
  className?: string
  // 'stacked' puts the poster above the text, which is right in the narrow
  // grid. 'wide' puts it alongside, for the full-width featured cards: at
  // 1024px an aspect-video poster is 576px tall, so a stacked featured card
  // spent its first screenful on a screenshot rendered too small to read
  // anything in, and pushed the text that actually sells the project below
  // the fold. Cropping it to a letterbox would only have made a smaller
  // unreadable screenshot.
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
// (<768), 32px (768+), 48px (1024+) and stops at 1200px; the poster adds
// 12px padding a side and, in the wide layout, a 1px divider.
// Wide (md:w-2/5 column from 768): 294/324/346 at 360/390/412, 574 at 640,
// 256 at 768, 345 at 1024, 416 from 1280 up.
// Stacked (two columns from 640): 294/324/346 at 360/390/412, 262 at 640,
// 314 at 768, 426 at 1024, 514 from 1280 up.
const SIZES = {
  wide:
    '(min-width: 1200px) 417px, (min-width: 1024px) calc(40vw - 63px), (min-width: 768px) calc(40vw - 51px), calc(100vw - 66px)',
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
  const ratio = isWide ? 'aspect-[16/10]' : 'aspect-[2/1]'
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
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[box-shadow,border-color] duration-200 hover:border-muted-foreground/40 hover:shadow-lg',
        // Side by side only from md up. Below that the column is too narrow
        // to carry both, so every card stacks.
        isWide && 'md:flex-row',
        className,
      )}
    >
      <div
        className={cn(
          // The padding and muted ground frame the screenshot as an artefact
          // instead of a white slab running edge to edge.
          'shrink-0 border-b border-border bg-muted p-3',
          isWide && 'md:flex md:w-2/5 md:items-center md:border-r md:border-b-0',
        )}
      >
        {project.chart ? (
          <TierChart
            alt={project.chart.alt}
            className={cn('w-full rounded-md bg-card ring-1 ring-border', ratio)}
          />
        ) : project.image ? (
          <img
            src={project.image.src}
            srcSet={project.image.srcSet}
            sizes={isWide ? SIZES.wide : SIZES.stacked}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            className={cn(
              // Every image is pre-cropped to its slot (16:10 wide, 2:1 in the
              // grid), so object-cover only absorbs rounding. Light screenshots
              // are dimmed in dark theme so they do not glare; dark ones keep
              // their own ground. Never inverted.
              'w-full rounded-md object-cover ring-1 ring-border',
              project.image.tone === 'light' && 'dark:brightness-[.85]',
              ratio,
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className={cn(
              'flex w-full flex-col justify-center gap-2 bg-muted p-6',
              isWide ? 'aspect-video md:aspect-auto md:h-full' : 'aspect-video',
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

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-1">
          <h3 className="font-heading text-xl font-semibold text-card-foreground">
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
