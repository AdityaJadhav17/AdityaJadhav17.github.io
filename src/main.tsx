import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { openHashTarget } from './lib/hash'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// Production HTML is prerendered (scripts/prerender.mjs). In dev the root
// holds only the <!--app-html--> comment, so check for an element, not a node.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
// A link or bookmark to #project-<id> arrives with the card's details open.
openHashTarget(location.hash)
addEventListener('hashchange', () => openHashTarget(location.hash))
