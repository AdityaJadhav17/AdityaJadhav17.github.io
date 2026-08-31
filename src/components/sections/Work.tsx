import { projects } from '@/content/projects'
import { ProjectCard } from '@/components/ProjectCard'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'

// Featured projects (the first two, `featured: true`) render full width,
// one per row; the rest render in a responsive grid. Same ProjectCard
// shape throughout: only the container width differs.
export function Work() {
  const featured = projects.filter((project) => project.featured)
  const rest = projects.filter((project) => !project.featured)
  const { ref, revealed } = useScrollReveal<HTMLElement>()

  return (
    <section
      id="work"
      ref={ref}
      className={cn('reveal border-t border-border py-16 md:py-24', !revealed && 'reveal-hidden')}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground">Selected Work</h2>

        <div className="mt-8 flex flex-col gap-6 md:mt-12">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
