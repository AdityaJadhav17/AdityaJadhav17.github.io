import { test, expect } from '@playwright/test'

// Playwright snapshots are per-OS (font rasterisation differs on Linux CI), so
// baselines are not committed: the first local run generates them (gitignored)
// and later runs compare against them. CI runs every functional check.
test.skip(!!process.env.CI, 'snapshots are per-OS; run locally')

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

for (const vp of viewports) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`${vp.name} ${colorScheme}`, async ({ browser, browserName }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium' || browserName !== 'chromium', 'chromium only')
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)

      // Scroll through so every Reveal has intersected, then return to top.
      await page.evaluate(async () => {
        const step = window.innerHeight / 2
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 100))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(800)

      await expect(page).toHaveScreenshot(`${vp.name}-${colorScheme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      })
      await context.close()
    })
  }
}
