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

// Closed cards keep the page short: the full story is behind <details>.
for (const [width, height, max] of [
  [1440, 900, 6300],
  [390, 844, 9900],
] as const) {
  test(`page stays under ${max}px tall at ${width}px with details closed`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('#work details[open]').count()).toBe(0)
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(h).toBeLessThanOrEqual(max)
  })
}

// Probe with elementFromPoint 21px off the centre in each direction, so it
// sees the ::after hit areas as the browser does. Returns the offsets that
// land outside the element. Runs in the page (passed to evaluate).
const hitMisses = (node: Element) => {
  const r = node.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  return [[-21, 0], [21, 0], [0, -21], [0, 21]]
    .filter(([dx, dy]) => {
      const hit = document.elementFromPoint(cx + dx, cy + dy)
      return !hit || !node.contains(hit)
    })
    .map(([dx, dy]) => `${dx},${dy}`)
}

// Every control in Work has a >= 44x44 hit box on touch.
test('work controls have 44px touch targets', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone', 'iPhone only')
  await page.goto('/')
  const controls = page.locator('#work :is(a, button, summary)')
  const count = await controls.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    const el = controls.nth(i)
    await el.scrollIntoViewIfNeeded()
    const misses = await el.evaluate(hitMisses)
    const name = await el.evaluate((n) => n.textContent?.trim())
    expect(misses, `${name} (#${i}) misses at offsets`).toEqual([])
  }
})

// Site-wide: every control that is not an inline link in prose, including the
// ones inside the mobile nav sheet. Hidden (sr-only, aria-hidden, display:none)
// controls are skipped.
test('every control has a 44px touch target', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone', 'iPhone only')
  await page.goto('/')
  // Past the hero so the header brand link is shown (aria-hidden before that).
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }))
  await expect(page.locator('header a[href="#home"]')).not.toHaveAttribute('aria-hidden', 'true')
  const controls = page.locator('button, a[href], summary')
  const check = async () => {
    const count = await controls.count()
    const failures: string[] = []
    let checked = 0
    for (let i = 0; i < count; i++) {
      const el = controls.nth(i)
      if (!(await el.isVisible())) continue
      const skip = await el.evaluate(
        (n) => !!n.closest('p, [aria-hidden="true"]') || n.getBoundingClientRect().width < 2,
      )
      if (skip) continue
      await el.scrollIntoViewIfNeeded()
      checked++
      const misses = await el.evaluate(hitMisses)
      if (misses.length) {
        const name = await el.evaluate((n) => (n.textContent?.trim() || n.getAttribute('aria-label') || n.tagName))
        failures.push(`${name}: ${misses.join(' | ')}`)
      }
    }
    expect(checked).toBeGreaterThan(0)
    return failures
  }
  const page_ = await check()
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  const sheet = await check()
  expect([...page_, ...sheet]).toEqual([])
})

// B4: the primary CTA is in the first phone screen; proof labels do not
// sprawl; the two profile buttons share a row.
test.describe('hero on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('résumé link is in the first screen, labels stay short, profiles share a row', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.goto('/')
    const cta = await page.getByRole('link', { name: /download résumé/i }).boundingBox()
    expect(cta!.y).toBeGreaterThanOrEqual(0)
    expect(cta!.y + cta!.height).toBeLessThanOrEqual(844)

    const labels = page.locator('#home ul li p:last-child')
    expect(await labels.count()).toBeGreaterThan(0)
    const tooTall = await labels.evaluateAll((els) =>
      els
        .map((el) => {
          const lh = parseFloat(getComputedStyle(el).lineHeight)
          return { text: el.textContent, h: el.getBoundingClientRect().height, max: 2 * lh + 1 }
        })
        .filter((l) => l.h > l.max),
    )
    expect(tooTall).toEqual([])

    const gh = await page.locator('#home a[href*="github.com"]').boundingBox()
    const li = await page.locator('#home a[href*="linkedin.com"]').boundingBox()
    expect(gh!.y).toBe(li!.y)
  })
})

// B4: no dead band, and the portrait stays clear of the Capabilities list.
test('portrait clears the capabilities list by 24px at 1440x900', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const capsBottom = await page
    .locator('#home p', { hasText: /^Capabilities$/ })
    .locator('xpath=..')
    .evaluate((el) => el.getBoundingClientRect().bottom)
  const portraitTop = await page.locator('#home picture img').evaluate((el) => el.getBoundingClientRect().top)
  expect(portraitTop - capsBottom).toBeGreaterThanOrEqual(24)
})
