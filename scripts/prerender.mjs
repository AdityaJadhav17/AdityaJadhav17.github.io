// Runs after both Vite builds. Puts the rendered app and the generated head
// into dist/index.html so crawlers, unfurlers and no-JS visitors get the
// whole page, then removes the temporary SSR bundle.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const ssr = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const file = resolve('dist/index.html')
const html = readFileSync(file, 'utf8')
if (!html.includes('<!--app-head-->') || !html.includes('<!--app-html-->')) {
  throw new Error('prerender: placeholders missing from dist/index.html')
}
writeFileSync(file, html.replace('<!--app-head-->', ssr.buildHead()).replace('<!--app-html-->', ssr.render()))
rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerender: dist/index.html written')
