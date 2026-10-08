// Runs after both Vite builds. Puts the rendered app and the generated head
// into dist/index.html so crawlers, unfurlers and no-JS visitors get the
// whole page, then removes the temporary SSR bundle.
import { readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { fill, readTokens } from './tokens.mjs'

const ssr = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const file = resolve('dist/index.html')
const html = readFileSync(file, 'utf8')
if (!html.includes('<!--app-head-->') || !html.includes('<!--app-html-->')) {
  throw new Error('prerender: placeholders missing from dist/index.html')
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
writeFileSync(
  file,
  fill(html, readTokens())
    .replace('<!--app-head-->', () => preload + ssr.buildHead())
    .replace('<!--app-html-->', () => app),
)
rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerender: dist/index.html written')
