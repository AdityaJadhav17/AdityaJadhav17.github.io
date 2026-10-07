import { test, expect } from '@playwright/test'

// Main-thread blocking on a phone-class CPU (4x throttle). Measured on the dev
// machine the longest task is 80-215 ms run to run, and it is mostly parse,
// layout and paint rather than hydration, so this is a coarse regression
// ceiling, not the 50 ms Lighthouse target. Tighten it if the page gets lighter.
const CEILING_MS = 350

test.use({ viewport: { width: 412, height: 823 } })

test('the longest main-thread task stays under the ceiling on a throttled phone', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium' || browserName !== 'chromium', 'Chromium only (CDP throttling)')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await page.addInitScript(() => {
    const w = window as unknown as { __long: number[] }
    w.__long = []
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) w.__long.push(e.duration)
    }).observe({ type: 'longtask', buffered: true })
  })
  await page.goto('/', { waitUntil: 'load' })
  await page.waitForTimeout(3000)
  const long = await page.evaluate(() => (window as unknown as { __long: number[] }).__long)
  const max = Math.max(0, ...long)
  console.log(`longtasks: ${JSON.stringify(long.map(Math.round))} max=${Math.round(max)}ms`)
  expect(max).toBeLessThan(CEILING_MS)
})
