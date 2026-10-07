import { test, expect } from '@playwright/test'

// One container: header, hero text, every section title and the footer all
// start at the same x at every width.
for (const width of [390, 768, 1440]) {
  test(`content shares one left edge at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const lefts = await page.evaluate(() => {
      const left = (el: Element) => {
        const r = el.getBoundingClientRect()
        return r.left + parseFloat(getComputedStyle(el).paddingLeft)
      }
      const q = (s: string) => document.querySelector(s)!
      return {
        header: left(q('header > div')),
        hero: left(q('h1')),
        footer: left(q('footer p')),
        titles: [...document.querySelectorAll('main h2')].map(left),
      }
    })
    const all = [lefts.header, lefts.hero, lefts.footer, ...lefts.titles]
    expect(lefts.titles.length).toBeGreaterThan(0)
    expect(Math.max(...all) - Math.min(...all), JSON.stringify(lefts)).toBeLessThanOrEqual(1)
  })
}
