import { test, expect } from '@playwright/test'

// Every image must be fetched at a size close to what it is drawn at. The
// chosen candidate (read from the -<width> suffix of currentSrc) may not be
// more than 1.5x the device pixels it covers. Upscaling is allowed: when the
// largest asset is smaller than the slot, there is nothing bigger to choose.
// Personal Tracker and Stockroom ship a separate -dark- capture. Each theme
// must request only its own: the other <img> is display:none and lazy, so the
// browser never fetches it.
const contexts = [
  { name: '412x823 @1.75', viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true },
  { name: '1440x900 @1', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: '1440x900 @2', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
]

const cases = contexts.flatMap((c) => (['light', 'dark'] as const).map((colorScheme) => ({ ...c, colorScheme })))

for (const { name, colorScheme, ...options } of cases) {
  test(`images are sized from their rendered width at ${name}, ${colorScheme}`, async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium only')
    const context = await browser.newContext({ ...options, colorScheme })
    const page = await context.newPage()
    const requested: string[] = []
    page.on('request', (r) => requested.push(new URL(r.url()).pathname))
    await page.goto('/')
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 50))
      }
    })
    // A lazy image in the hidden theme variant never loads, so only wait on the shown ones.
    await page.waitForFunction(() => [...document.images].filter((i) => i.clientWidth > 0).every((i) => i.complete))
    const own = (p: string) => (colorScheme === 'dark' ? /-dark-\d+\.webp$/ : /^\/(personal-tracker|stockroom)-\d+\.webp$/).test(p)
    const other = (p: string) => (colorScheme === 'dark' ? /^\/(personal-tracker|stockroom)-\d+\.webp$/ : /-dark-\d+\.webp$/).test(p)
    expect(requested.filter(own).length).toBeGreaterThanOrEqual(2) // one per project
    expect(requested.filter(other)).toEqual([])
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
