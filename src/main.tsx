import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { openHashTarget } from './lib/hash'
import { loadStudy, pageFor, slugFromPath } from './lib/pages'

const root = document.getElementById('root')!
// A project page loads its case study and component lazily, so the homepage never ships them.
const slug = slugFromPath(location.pathname)
async function mount() {
  let page = <App />
  if (slug) {
    const [study, { ProjectPage }] = await Promise.all([loadStudy(slug), import('./pages/ProjectPage')])
    page = <ProjectPage {...pageFor(study)} />
  }
  const app = <StrictMode>{page}</StrictMode>
  // Production HTML is prerendered (scripts/prerender.mjs). In dev the root
  // holds only the <!--app-html--> comment, so check for an element, not a node.
  if (root.firstElementChild) hydrateRoot(root, app)
  else createRoot(root).render(app)
}
void mount()
// A link or bookmark to #project-<id> arrives with the card's details open.
openHashTarget(location.hash)
addEventListener('hashchange', () => openHashTarget(location.hash))
