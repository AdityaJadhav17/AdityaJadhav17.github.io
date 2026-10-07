import { test, expect } from '@playwright/test'
import { projects } from '../src/content/projects'
import { experience } from '../src/content/experience'
import { site } from '../src/content/site'

test('without JS the page carries the claim, every project and every role', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  // CSS uppercases the claim, so compare case-insensitively.
  const text = await page.locator('body').innerText()
  expect(text.toLowerCase()).toContain(site.positioning.toLowerCase())
  for (const p of projects) expect(text).toContain(p.title)
  for (const e of experience) expect(text).toContain(e.role)
  await expect(page.locator('noscript')).toHaveCount(0)
  await context.close()
})

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`images are not oversized at ${viewport.width}px`, async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium only')
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
    const page = await context.newPage()
    await page.goto('/')
    // Scroll through so lazy images load.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 50))
      }
    })
    await page.waitForFunction(() => [...document.images].every((i) => i.complete))
    const oversized = await page.evaluate(() =>
      [...document.images]
        // Phase B (B6) removes this exemption
        .filter((i) => i.clientWidth > 0 && !i.closest('#work'))
        .filter((i) => i.naturalWidth > i.clientWidth * 2 + 1)
        .map((i) => `${i.currentSrc} natural ${i.naturalWidth} shown ${i.clientWidth}`),
    )
    expect(oversized).toEqual([])
    await context.close()
  })
}

test('fonts are self-hosted and load', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium only')
  const hosts: string[] = []
  page.on('request', (r) => hosts.push(new URL(r.url()).hostname))
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  expect(hosts.filter((h) => /google|gstatic/.test(h))).toEqual([])
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
  )
  expect(loaded).toEqual(expect.arrayContaining(['Archivo Variable', 'Space Grotesk Variable']))
  const stacks = await page.evaluate(() => [
    getComputedStyle(document.querySelector('h1')!).fontFamily,
    getComputedStyle(document.querySelector('#about p')!).fontFamily,
  ])
  expect(stacks[0]).toContain('Archivo Variable')
  expect(stacks[1]).toContain('Space Grotesk Variable')
})
