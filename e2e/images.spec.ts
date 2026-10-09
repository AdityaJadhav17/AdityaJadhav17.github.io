import { test, expect, type Browser } from '@playwright/test'

// Every image must be fetched at a size close to what it is drawn at. The
// chosen candidate (read from the -<width> suffix of currentSrc) may not be
// more than 1.5x the device pixels it covers. Upscaling is allowed: when the
// largest asset is smaller than the slot, there is nothing bigger to choose.
// Each project shows one screen in both themes (light captures, dimmed in dark),
// so the theme must never change which file is requested.
const contexts = [
  { name: '412x823 @1.75', viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true },
  { name: '1440x900 @1', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: '1440x900 @2', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
]

type Options = Omit<(typeof contexts)[number], 'name'>
type Row = { src: string; shown: number; dpr: number; chosen: number }

// Scrolls the whole page so every lazy image loads, then reads what was chosen.
async function load(browser: Browser, options: Options, colorScheme: 'light' | 'dark'): Promise<Row[]> {
  const context = await browser.newContext({ ...options, colorScheme })
  const page = await context.newPage()
  await page.goto('/')
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 50))
    }
  })
  await page.waitForFunction(() => [...document.images].filter((i) => i.clientWidth > 0).every((i) => i.complete))
  const images = await page.evaluate(() =>
    [...document.images]
      .filter((i) => i.clientWidth > 0)
      .map((i) => ({ src: i.currentSrc.split('/').pop()!, shown: i.clientWidth })),
  )
  await context.close()
  const dpr = options.deviceScaleFactor
  return images.flatMap(({ src, shown }) => {
    const chosen = Number(/-(\d+)\.\w+$/.exec(src)?.[1])
    return chosen ? [{ src, shown, dpr, chosen }] : [] // the SVG has no width suffix
  })
}

for (const { name, ...options } of contexts) {
  test(`images are sized from their rendered width and match across themes at ${name}`, async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium only')
    const light = await load(browser, options, 'light')
    const dark = await load(browser, options, 'dark')
    console.table(light)
    expect(light.length).toBeGreaterThanOrEqual(4) // one per project with a screenshot
    expect(dark.map((r) => r.src)).toEqual(light.map((r) => r.src))
    for (const rows of [light, dark]) {
      expect(rows.filter((r) => r.chosen > 1.5 * r.shown * r.dpr + 1)).toEqual([])
    }
  })
}

// Reports, never fails: images served below shown width x DPR (blurry on that
// screen because no larger file exists). Run with `--grep shortfall` to read it.
for (const [name, options] of [
  ['390x844 @3', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }],
  ['1440x900 @2', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }],
] as const) {
  test(`shortfall report at ${name}`, async ({ browser, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'Chromium only')
    const short = (await load(browser, options, 'light'))
      .filter((r) => r.chosen < r.shown * r.dpr - 1)
      .map((r) => ({ ...r, wanted: Math.round(r.shown * r.dpr) }))
    console.log(`shortfall at ${name}`)
    console.table(short)
    await testInfo.attach(`shortfall-${name}`, { body: JSON.stringify(short, null, 2), contentType: 'application/json' })
  })
}
