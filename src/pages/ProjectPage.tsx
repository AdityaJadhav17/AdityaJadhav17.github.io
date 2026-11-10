import type { Block, CaseStudy } from '@/content/case-study'
import type { Project } from '@/content/projects'
import { SkipLink } from '@/components/layout/SkipLink'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

function BlockView({ block }: { block: Block }) {
  if ('p' in block) return <p>{block.p}</p>
  if ('ul' in block) return <ul>{block.ul.map((li) => <li key={li}>{li}</li>)}</ul>
  const { caption, head, rows } = block.table
  return (
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r) => <tr key={r.join('|')}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}
      </tbody>
    </table>
  )
}

// Task 1 is plumbing only: plain semantic HTML. The design lands in a later task.
// `next` is unused until then.
export function ProjectPage({ project, study }: { project: Project; study: CaseStudy; next: Project }) {
  return (
    <>
      <SkipLink />
      <Navbar sectionIds={[]} />
      <main id="main">
        <h1>{project.title}</h1>
        {study.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((b, i) => <BlockView key={i} block={b} />)}
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
