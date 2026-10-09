import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']

for (const width of [390, 1440]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe: 0 violations at ${width}px, ${colorScheme}`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name === 'iphone', 'axe runs once, on Chromium')
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme })
      const page = await context.newPage()
      await page.goto('/')
      // Walk the page so every reveal has fired: axe scores contrast on
      // what is painted, and a half-faded element reads as low contrast.
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y < height; y += 500) {
        await page.evaluate((v) => window.scrollTo(0, v), y)
        await page.waitForTimeout(100)
      }
      await page.waitForTimeout(800)
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
      await context.close()
    })
  }
}

// GitHub Pages serves dist/404.html for unknown paths; it is static, no JS.
for (const colorScheme of ['light', 'dark'] as const) {
  test(`axe: 0 violations on /404.html, ${colorScheme}`, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name === 'iphone', 'axe runs once, on Chromium')
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, colorScheme })
    const page = await context.newPage()
    await page.goto('/404.html')
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
    expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
    await context.close()
  })
}
