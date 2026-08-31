import { ExternalLink } from 'lucide-react'
import { FaGithub, FaYoutube } from 'react-icons/fa'
import type { Project } from '@/content/projects'
import { cn } from '@/lib/utils'

type ProjectCardProps = {
  project: Project
  className?: string
}

// One shape for every project card: Problem -> What I built -> Stack ->
// Result. `stack`, `result`, and `context` render in font-mono per
// MASTER.md's typography rule (tech tags, metrics, dates). `result` is
// optional (bird-classifier has none) and the card must read as complete
// without it; `project.image` is optional (watchtower, talk-to-robot) and
// falls back to a typographic treatment built entirely from design tokens
// — no AI-generated art.
export function ProjectCard({ project, className }: ProjectCardProps) {
  // RULING AM: apply RULING AJ's split consistently — every links.github
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
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-shadow duration-200 hover:shadow-lg',
        className,
      )}
    >
      {project.image ? (
        <img
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          loading="lazy"
          className="aspect-video w-full border-b border-border object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-video w-full flex-col justify-center gap-2 border-b border-border bg-muted p-6"
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
            <p className="mt-1 font-mono text-sm text-foreground">{project.result}</p>
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
                className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground"
              >
                <SecondaryIcon aria-hidden="true" className="size-4" />
                {secondaryLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
