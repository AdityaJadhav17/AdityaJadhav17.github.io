// node scripts/og.mjs <slug>: writes public/og/<slug>.png (1200 x 630), the
// share image for /projects/<slug>/. The line under the title is the project's
// award, or the case study's facts.result when there is none. Local tool, not
// part of the build: run it when a study's title or line changes, commit the PNG.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'
import { readTokens } from './tokens.mjs'

const font = (path) => readFileSync(new URL(`../node_modules/${path}`, import.meta.url)).toString('base64')
const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)

export function html({ title, line }, t = readTokens().dark) {
  return `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Archivo; font-weight: 100 900; src: url(data:font/woff2;base64,${font('@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2')}) }
@font-face { font-family: Mono; src: url(data:font/woff2;base64,${font('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2')}) }
* { margin: 0; box-sizing: border-box }
body { width: 1200px; height: 630px; overflow: hidden; position: relative; padding: 78px 84px; font-family: Archivo, sans-serif;
  color: ${t.foreground}; background:
    radial-gradient(circle at 82% 18%, ${t.foreground}0A, transparent 45%),
    linear-gradient(${t.foreground}08 1px, transparent 1px) 0 0 / 60px 60px,
    linear-gradient(90deg, ${t.foreground}08 1px, transparent 1px) 0 0 / 60px 60px,
    ${t.background} }
.mark { width: 74px; height: 74px; border-radius: 16px; display: grid; place-items: center;
  background: ${t.foreground}; color: ${t.background}; font-weight: 700; font-size: 26px }
h1 { margin-top: 40px; font-size: 72px; line-height: 1.05; font-weight: 800; letter-spacing: -0.035em; max-width: 1032px }
h1 span { color: ${t['accent-signal']} }
p { margin-top: 26px; font-size: 30px; line-height: 1.3; color: ${t['muted-foreground']}; max-width: 1032px }
footer { position: absolute; left: 84px; bottom: 76px }
b { display: block; font-size: 22px; font-weight: 700 }
small { display: block; margin-top: 14px; font: 15px Mono, monospace; color: ${t['muted-foreground']}; opacity: 0.75 }
</style>
<div class="mark">AJ</div>
<h1>${esc(title)}<span>.</span></h1>
<p>${esc(line)}</p>
<footer><b>Aditya Jadhav</b><small>adityajadhav.dev</small></footer>`
}

export async function lineFor(slug) {
  const { projects } = await import('../src/content/projects.ts')
  const project = projects.find((p) => p.slug === slug)
  if (!project) throw new Error(`og: no project with slug "${slug}"`)
  const { default: study } = await import(`../src/content/case-studies/${slug}.ts`)
  return { title: project.title, line: project.award ?? study.facts.result }
}

export async function render(content, out) {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
    await page.setContent(html(content))
    await page.evaluate(() => document.fonts.ready)
    // Self-check: the text must clear the footer and stay inside the frame.
    const bad = await page.evaluate(() => {
      const p = document.querySelector('p').getBoundingClientRect()
      const f = document.querySelector('footer').getBoundingClientRect()
      return p.bottom > f.top - 24 || document.body.scrollWidth > 1200
    })
    if (bad) throw new Error(`og: text overflows for "${content.title}"`)
    await page.screenshot({ path: out })
  } finally {
    await browser.close()
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slug = process.argv[2]
  if (!slug) throw new Error('usage: node scripts/og.mjs <slug>')
  await render(await lineFor(slug), `public/og/${slug}.png`)
  console.log(`og: public/og/${slug}.png written`)
}
