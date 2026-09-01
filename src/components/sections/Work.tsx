import { projects } from '@/content/projects'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/motion/Reveal'

// Featured projects (the first two, `featured: true`) render full width,
// one per row; the rest render in a responsive grid. Same ProjectCard
// shape throughout: only the container width differs.
//
// Each card is its own Reveal.Item so the grid arrives as a sequence rather
// than as one slab. Stack tags inside a card are deliberately not staggered:
// at six per card that reads as a loading state, not as choreography.
export function Work() {
  const featured = projects.filter((project) => project.featured)
  const rest = projects.filter((project) => !project.featured)

  return (
    <Reveal as="section" id="work" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Reveal.Item>
          <h2 className="font-heading text-3xl font-semibold text-foreground">Selected Work</h2>
        </Reveal.Item>

        <div className="mt-8 flex flex-col gap-6 md:mt-12">
          {featured.map((project) => (
            <Reveal.Item key={project.id}>
              <ProjectCard project={project} />
            </Reveal.Item>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <Reveal.Item key={project.id}>
              <ProjectCard project={project} />
            </Reveal.Item>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
