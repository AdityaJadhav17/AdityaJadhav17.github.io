import { projects } from '@/content/projects'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/motion/Reveal'

// Featured projects (the three `featured: true` projects, in array order) render full width,
// one per row; the rest render in a two-column grid. Same collapsed ProjectCard
// throughout (outcome line, tags, links; the full story is behind a <details>),
// so only the container width differs and the page stays short.
//
// Each card is its own Reveal.Item so the grid arrives as a sequence rather
// than as one slab. Stack tags inside a card are deliberately not staggered:
// at five per card that reads as a loading state, not as choreography.
export function Work() {
  const featured = projects.filter((project) => project.featured)
  const rest = projects.filter((project) => !project.featured)

  return (
    <Reveal as="section" id="work" className="border-t border-border py-20 md:py-32">
      <div className="container-site">
        <Reveal.Item>
          <h2 className="section-title">Selected Work</h2>
        </Reveal.Item>

        <div className="mt-8 flex flex-col gap-10 md:mt-12 md:gap-12">
          {featured.map((project) => (
            <Reveal.Item key={project.id}>
              <ProjectCard project={project} layout="wide" />
            </Reveal.Item>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:mt-12">
          {rest.map((project) => (
            <Reveal.Item key={project.id} className="flex">
              <ProjectCard project={project} className="flex-1" />
            </Reveal.Item>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
