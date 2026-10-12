// Runs after both Vite builds. Puts the rendered app and the generated head
// into dist/index.html so crawlers, unfurlers and no-JS visitors get the
// whole page, then removes the temporary SSR bundle.
import { readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { addCsp } from './csp.mjs'
import { fill, readTokens } from './tokens.mjs'

const ssr = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const file = resolve('dist/index.html')
const html = readFileSync(file, 'utf8')
for (const marker of ['<!--app-head-->', '<!--app-html-->']) {
  const n = html.split(marker).length - 1
  if (n !== 1) throw new Error(`prerender: expected exactly 1 ${marker} in dist/index.html, found ${n}`)
}
// Preload only the above-the-fold display face (Archivo latin). The hash in the
// file name changes with the fontsource version, so look it up rather than pin it.
const archivo = readdirSync('dist/assets').find((f) => /^archivo-latin-wght-normal-.+\.woff2$/.test(f))
if (!archivo) throw new Error('prerender: Archivo latin woff2 not found in dist/assets')
const preload = `<link rel="preload" as="font" type="font/woff2" href="/assets/${archivo}" crossorigin>
    `
const app = ssr.render()
if (!app) throw new Error('prerender: render() returned an empty string')
// Function replacers: a string replacement would interpret $&, $' and $` in the content.
// app-html goes first so a literal placeholder inside the rendered content can never be
// matched by the app-head replace. The CSP goes in last, so the hash covers the final file.
writeFileSync(
  file,
  addCsp(
    fill(html, readTokens())
      .replace('<!--app-html-->', () => app)
      .replace('<!--app-head-->', () => preload + ssr.buildHead()),
  ),
)
// The 404 page is static and JS-free, so it gets the same hashed font by file name.
const notFound = resolve('dist/404.html')
writeFileSync(notFound, readFileSync(notFound, 'utf8').replace('{{archivo}}', archivo))

// The origin comes from package.json, same as the canonical URL in head.ts.
const { homepage } = JSON.parse(readFileSync('package.json', 'utf8'))
if (typeof homepage !== 'string') throw new Error('prerender: package.json homepage is missing')
const siteUrl = new URL(homepage)
if (siteUrl.protocol !== 'https:') throw new Error(`prerender: homepage must be https, got ${homepage}`)
const xmlEscape = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
// lastmod is the last commit date (the content's real age); the build date if git is unavailable.
let lastmod = new Date().toISOString().slice(0, 10)
try {
  lastmod = execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || lastmod
} catch {
  // no git here: keep the build date
}
writeFileSync(
  resolve('dist/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(siteUrl.origin)}/</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`,
)
rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerender: dist/index.html, 404.html, sitemap.xml written')
