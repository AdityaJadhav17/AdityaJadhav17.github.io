import { test, expect } from './fixtures'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

const PAGE = '/projects/coverage-keeper/'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']

const collectErrors = (page: Page) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

test('without JS the page has its title, sections and links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(PAGE)
  await expect(page.locator('h1')).toHaveText('Coverage Keeper')
  const h2s = await page.locator('main h2').allTextContents()
  expect(h2s).toEqual(expect.arrayContaining(['The problem', 'Limits and next steps']))
  await expect(page.locator('main a[href="/#contact"]')).toHaveCount(1)
  await context.close()
})

// vite preview is not Cloudflare Pages: it answers both URLs below with the
// homepage index.html (SPA fallback), where Pages redirects the no-slash URL
// to the slash one and serves dist/404.html for an unknown one. Measured here:
// the no-slash URL got the homepage canonical. Task 5 checks the redirect and
// the 404 status on the live site after deploy.

test('the URL without a trailing slash reaches the page', async ({ page }) => {
  test.skip(true, 'vite preview serves index.html here; checked live in Task 5')
  await page.goto('/projects/coverage-keeper')
  await expect(page.locator('h1')).toHaveText(/coverage keeper/i)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://adityajadhav.dev/projects/coverage-keeper/')
})

// Any host that answers an unknown project URL with index.html (vite preview
// does) must still get a working page, never a script error.
test('an unknown project URL throws no script error', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/projects/nope/')
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})

test('an unknown project is a 404', async ({ page }) => {
  test.skip(true, 'vite preview serves index.html here; checked live in Task 5')
  const res = await page.goto('/projects/nope/')
  if (res!.status() !== 404) await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
})

test('a navbar link goes to the homepage section', async ({ page }, ti) => {
  await page.goto(PAGE)
  if (ti.project.name === 'iphone') {
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Work' }).click()
  } else {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Work' }).click()
  }
  await expect(page).toHaveURL(/\/#work$/)
  await expect(page.locator('#work')).toBeVisible()
})

test('the homepage card links to the page', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator(`#project-coverage-keeper a[href="${PAGE}"]`).count()).toBeGreaterThanOrEqual(1)
})

// The next project is the next published page in homepage order, wrapping.
for (const [from, to] of [
  ['coverage-keeper', 'watchtower'],
  ['watchtower', 'travel-agntcy'],
  ['travel-agntcy', 'talk-to-robot'],
  ['talk-to-robot', 'bayt-qareeb'],
  ['bayt-qareeb', 'stockroom'],
  ['stockroom', 'margin'],
  ['margin', 'synthetic-to-real'],
  ['synthetic-to-real', 'coverage-keeper'],
]) {
  test(`${from} links to ${to} as the next project`, async ({ page }) => {
    await page.goto(`/projects/${from}/`)
    await expect(page.locator('main a', { hasText: 'Next project' })).toHaveAttribute('href', `/projects/${to}/`)
  })
}

test('no console or CSP errors, and hydration is clean', async ({ page }) => {
  const errors = collectErrors(page)
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP ${e.violatedDirective} ${e.blockedURI}`))
  })
  await page.goto(PAGE)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1)
  expect(errors).toEqual([])
})

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [390, 1440]) {
    test(`axe: 0 violations at ${width}px, ${colorScheme}`, async ({ browser }, ti) => {
      test.skip(ti.project.name === 'iphone', 'axe runs once, on Chromium')
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme })
      const page = await context.newPage()
      await page.goto(PAGE)
      // Walk the page so every reveal has fired (axe scores what is painted).
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

for (const width of [360, 390, 768, 1440]) {
  test(`no horizontal page scroll at ${width}px`, async ({ page }, ti) => {
    test.skip(ti.project.name !== 'chromium', 'Chromium only')
    await page.setViewportSize({ width, height: 900 })
    await page.goto(PAGE)
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(scroll).toBeLessThanOrEqual(client)
  })
}

// The six-column Results table may scroll inside its own box on a phone, but
// that box must be reachable and scrollable from the keyboard.
test('the results table scrolls in its own focusable box on a phone', async ({ page }, ti) => {
  test.skip(ti.project.name !== 'chromium', 'Chromium only')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(PAGE)
  const box = page.locator('main table').locator('xpath=..')
  await expect(box).toHaveAttribute('tabindex', '0')
  const { scroll, client } = await box.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }))
  expect(scroll).toBeGreaterThan(client)
  await box.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => box.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
})

// From lg the heading takes a left rail and the prose the right column, so the
// article uses the width; the results table spans both. Below lg, one column.
for (const width of [768, 1024, 1280, 1440]) {
  test(`sections ${width >= 1024 ? 'set heading beside prose' : 'stack'} at ${width}px`, async ({ page }, ti) => {
    test.skip(ti.project.name !== 'chromium', 'Chromium only')
    await page.setViewportSize({ width, height: 900 })
    await page.goto(PAGE)
    const m = await page.evaluate(() => {
      const box = (el: Element) => el.getBoundingClientRect()
      const article = box(document.querySelector('main article')!)
      const sections = [...document.querySelectorAll('main article section')].map((s) => {
        const h2 = box(s.querySelector('h2')!)
        const prose = box(s.querySelector('h2 ~ p, h2 ~ ul, h2 ~ * p, h2 ~ * ul')!)
        return { gap: prose.left - h2.right, top: prose.top - h2.top, sameLeft: Math.abs(prose.left - h2.left) }
      })
      const table = box(document.querySelector('main [role="region"]')!)
      return { sections, tableSpan: table.width / article.width, right: Math.max(...[...document.querySelectorAll('main article section p')].map((p) => box(p).right)), articleRight: article.right }
    })
    expect(m.sections.length).toBe(6)
    if (width >= 1024) {
      for (const s of m.sections) {
        expect(s.gap).toBeGreaterThan(0)
        expect(Math.abs(s.top)).toBeLessThan(40)
      }
      // The prose column reaches the right edge: no blank right half.
      expect(m.articleRight - m.right).toBeLessThan(80)
    } else {
      for (const s of m.sections) expect(s.sameLeft).toBeLessThanOrEqual(1)
    }
    expect(m.tableSpan).toBeGreaterThan(0.99)
  })
}
