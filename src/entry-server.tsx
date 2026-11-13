import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { ProjectPage } from './pages/ProjectPage'
import type { CaseStudy } from './content/case-study'
import type { Project } from './content/projects'
import { pageFor, pagePath } from './lib/pages'
export { buildHead } from './lib/head'
export { currentRoles, site } from './content/site'
export { projects } from './content/projects'

const studies = import.meta.glob<{ default: CaseStudy }>('./content/case-studies/*.ts', { eager: true })

export const pages: { path: string; project: Project; study: CaseStudy }[] = Object.entries(studies).map(([file, m]) => {
  const study = m.default
  const name = file.replace(/^.*\//, '').replace(/\.ts$/, '')
  if (study.slug !== name) throw new Error(`pages: case study file "${name}" has slug "${study.slug}"`)
  return { path: pagePath(study.slug), project: pageFor(study).project, study }
})

export function render(path = '/'): string {
  const page = pages.find((p) => p.path === path)
  if (path !== '/' && !page) throw new Error(`render: no page at ${path}`)
  return renderToString(
    <StrictMode>{page ? <ProjectPage {...pageFor(page.study)} /> : <App />}</StrictMode>,
  )
}
