import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './index.css'

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
