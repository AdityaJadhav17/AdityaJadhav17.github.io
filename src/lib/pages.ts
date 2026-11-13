import type { CaseStudy } from '@/content/case-study'
import { projects, type Project } from '@/content/projects'

const loaders = import.meta.glob<{ default: CaseStudy }>('../content/case-studies/*.ts')
const slugOf = (key: string) => key.replace(/^.*\//, '').replace(/\.ts$/, '')
const byFile = Object.fromEntries(Object.entries(loaders).map(([k, v]) => [slugOf(k), v]))

export const publishedSlugs: string[] = Object.keys(byFile)

export const pagePath = (slug: string) => `/projects/${slug}/`

export function slugFromPath(pathname: string): string | null {
  return pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1] ?? null
}

export async function loadStudy(slug: string): Promise<CaseStudy> {
  const load = byFile[slug]
  if (!load) throw new Error(`pages: no case study "${slug}"`)
  return (await load()).default
}

export function pageFor(study: CaseStudy): { project: Project; study: CaseStudy; next: Project; others: Project[] } {
  const project = projects.find((p) => p.slug === study.slug)
  if (!project) throw new Error(`pages: no project with slug "${study.slug}"`)
  const pool = projects.filter((p) => p === project || publishedSlugs.includes(p.slug))
  return { project, study, next: pool[(pool.indexOf(project) + 1) % pool.length], others: pool.filter((p) => p !== project) }
}
