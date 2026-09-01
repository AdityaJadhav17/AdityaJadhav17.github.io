import { ExternalLink } from 'lucide-react'
import { FaGithub, FaYoutube } from 'react-icons/fa'
import type { Project } from '@/content/projects'
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

// One shape for every project card: Problem -> What I built -> Stack ->
// Result. `stack`, `result`, and `context` render in font-mono per
// MASTER.md's typography rule (tech tags, metrics, dates). `result` is
// optional (bird-classifier has none) and the card must read as complete
// without it; `project.image` is optional (watchtower, talk-to-robot) and
// falls back to a typographic treatment built entirely from design tokens,
// with no AI-generated art.
export function ProjectCard({ project, className, layout = 'stacked' }: ProjectCardProps) {
  const isWide = layout === 'wide'
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
          'shrink-0 border-b border-border',
          isWide && 'md:w-2/5 md:self-stretch md:border-r md:border-b-0',
        )}
      >
        {project.image ? (
          <img
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            className={cn(
              'w-full object-cover',
              // In the wide layout the poster fills its column's full height,
              // so the card is sized by its text rather than by the image.
              // Anchored top-left rather than centre: these are screenshots of
              // real interfaces, and the top-left is where the heading and the
              // first rows live, so the crop stays readable and looks like a
              // deliberate product detail. A centred crop lands on an
              // arbitrary middle slice, and object-contain shrinks the whole
              // screenshot to an unreadable thumbnail floating in dead space.
              // Both were tried in the browser before settling here.
              isWide ? 'aspect-video object-left-top md:aspect-auto md:h-full' : 'aspect-video',
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
          {project.context && (
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {project.context}
            </p>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Problem
            </p>
            <p className="mt-1 text-card-foreground">{project.problem}</p>
          </div>
          <div>
            <p className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              What I built
            </p>
            <p className="mt-1 text-card-foreground">{project.contribution}</p>
          </div>
        </div>

        <div>
          <p className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Stack
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        {project.result && (
          <div>
            <p className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Result
            </p>
            {/* Space Grotesk, not JetBrains Mono. Three of the four result
                lines are sentences rather than figures, and MASTER.md
                reserves mono for tags, metrics and dates. The one that is a
                bare figure still reads as one because the label above it
                says Result. */}
            <p className="mt-1 text-sm text-foreground">{project.result}</p>
          </div>
        )}

        {(codeLink || secondaryLink) && (
          <div className="mt-auto flex flex-wrap gap-4 pt-2">
            {codeLink && (
              <a
                href={codeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground"
              >
                <FaGithub aria-hidden="true" className="size-4" />
                Code
              </a>
            )}
            {secondaryLink && (
              <a
                href={secondaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-1.5 font-sans text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground"
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
          </div>
        )}
      </div>
    </article>
  )
}
