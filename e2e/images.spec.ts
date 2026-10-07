import { test, expect } from '@playwright/test'

// Every image must be fetched at a size close to what it is drawn at. The
// chosen candidate (read from the -<width> suffix of currentSrc) may not be
// more than 1.5x the device pixels it covers. Upscaling is allowed: when the
// largest asset is smaller than the slot, there is nothing bigger to choose.
const contexts = [
  { name: '412x823 @1.75', viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true },
  { name: '1440x900 @1', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: '1440x900 @2', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
]

for (const { name, ...options } of contexts) {
  test(`images are sized from their rendered width at ${name}`, async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium only')
    const context = await browser.newContext(options)
    const page = await context.newPage()
    await page.goto('/')
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 50))
      }
    })
    await page.waitForFunction(() => [...document.images].every((i) => i.complete))
    const images = await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.clientWidth > 0)
        .map((i) => ({ src: i.currentSrc.split('/').pop()!, shown: i.clientWidth })),
    )
    const dpr = options.deviceScaleFactor
    const rows = images.flatMap(({ src, shown }) => {
      const chosen = Number(/-(\d+)\.\w+$/.exec(src)?.[1])
      return chosen ? [{ src, shown, dpr, chosen }] : [] // the SVG has no width suffix
    })
    console.table(rows)
    expect(rows.length).toBeGreaterThan(0)
    const oversized = rows.filter((r) => r.chosen > 1.5 * r.shown * r.dpr + 1)
    expect(oversized).toEqual([])
    await context.close()
  })
}
