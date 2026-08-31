import { test, expect, type Page } from '@playwright/test'

// Parses a CSS computed transition-duration string (e.g. "0.35s, 0.35s" or
// "1e-05s, 1e-05s") into its first value, in milliseconds. Chromium reports
// these in seconds, including scientific notation for very small values
// (0.01ms round-trips through computed style as "1e-05s"), so this checks
// the unit suffix first, then lets parseFloat handle whatever numeric
// notation follows rather than assuming a plain decimal.
function firstDurationMs(computed: string): number {
  const first = computed.split(',')[0].trim()
  const isMs = first.endsWith('ms')
  const numeric = first.slice(0, first.length - (isMs ? 2 : 1))
  const value = Number.parseFloat(numeric)
  if (Number.isNaN(value)) throw new Error(`Unrecognized transition-duration value: "${computed}"`)
  return isMs ? value : value * 1000
}

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

test.describe('content without JavaScript', () => {
  // The catastrophic failure mode for a scroll-reveal implementation: if the
  // IntersectionObserver never fires (because it never runs at all), content
  // gated behind it stays at `opacity: 0` forever. A context with JS fully
  // disabled is the only way to observe this - unit tests run inside jsdom
  // with JS very much enabled, so they cannot catch it.
  test('hero name, a project title, and the experience section are visible', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')

    const heroName = page.getByRole('heading', { level: 1, name: 'Aditya Jadhav' })
    await expect(heroName).toBeVisible()
    await expect(heroName).toHaveCSS('opacity', '1')

    const firstProjectTitle = page.locator('#work h3').first()
    await expect(firstProjectTitle).toBeVisible()
    await expect(firstProjectTitle).toHaveCSS('opacity', '1')

    const experienceSection = page.locator('#experience')
    await expect(experienceSection).toBeVisible()
    await expect(experienceSection).toHaveCSS('opacity', '1')
    await expect(experienceSection).toContainText('Experience')

    await context.close()
  })
})

test.describe('prefers-reduced-motion suppresses the scroll-reveal animation', () => {
  // NOTE: `reducedMotion` is not a flat PlaywrightTestOptions property in
  // this Playwright version (unlike `colorScheme` or `javaScriptEnabled`) -
  // it must go through `contextOptions`, or `test.use({ reducedMotion })`
  // silently does nothing (no type error, since e2e/ is outside
  // tsconfig.json's `include`, and no runtime error, since it's just an
  // unrecognized extra key). Confirmed by checking
  // `window.matchMedia('(prefers-reduced-motion: reduce)').matches` under
  // both forms before settling on this one.
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('revealed sections are fully opaque with an effectively-zero transition', async ({ page }) => {
    await page.goto('/')

    const work = page.locator('#work')
    await work.scrollIntoViewIfNeeded()
    await expect(work).toHaveCSS('opacity', '1')
    const workDuration = await work.evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(firstDurationMs(workDuration)).toBeLessThan(10)

    const experience = page.locator('#experience')
    await experience.scrollIntoViewIfNeeded()
    await expect(experience).toHaveCSS('opacity', '1')
    const experienceDuration = await experience.evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(firstDurationMs(experienceDuration)).toBeLessThan(10)
  })
})

test.describe('control: without reduced motion the reveal transition is real', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  // Same assertions as the reduced-motion test above, but proving the
  // opposite value in the opposite state - this is what makes the
  // reduced-motion test meaningful rather than something that would pass
  // vacuously regardless of whether the media query does anything at all.
  test('revealed sections use the real ~350ms transition', async ({ page }) => {
    await page.goto('/')

    const work = page.locator('#work')
    await work.scrollIntoViewIfNeeded()
    await expect(work).toHaveCSS('opacity', '1')
    const workDuration = await work.evaluate((el) => getComputedStyle(el).transitionDuration)
    const ms = firstDurationMs(workDuration)
    expect(ms).toBeGreaterThan(300)
    expect(ms).toBeLessThan(400)
  })
})

test.describe('keyboard traversal never hides focus under the sticky navbar', () => {
  // The focus-driven scrollIntoView that the browser performs on Tab uses
  // `scroll-behavior: smooth` (see src/styles/theme.css), which animates
  // over several hundred ms. Reduced motion collapses that to instant
  // (`scroll-behavior: auto`), which is what makes checking a bounding box
  // immediately after each Tab press deterministic instead of a race against
  // an in-flight scroll animation. scroll-padding-top itself (the thing
  // under test) is a static layout property, unaffected by motion prefs, so
  // this does not change what is being verified. (See the reduced-motion
  // describe block above for why this goes through `contextOptions`.)
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('every focused element clears the sticky navbar, and the skip link is first', async ({ page }) => {
    await page.goto('/')

    const navbar = page.locator('header').first()
    const navbarBox = await navbar.boundingBox()
    if (!navbarBox) throw new Error('Could not measure the navbar')
    const navbarBottom = navbarBox.y + navbarBox.height

    // First Tab from a page with nothing focused: the skip link must be
    // first in the tab order, ahead of the navbar itself.
    await page.keyboard.press('Tab')
    const skipLink = page.locator(':focus')
    await expect(skipLink).toHaveText('Skip to content')

    // The skip link is deliberately pinned above the navbar (z-50 vs the
    // navbar's z-40) when focused, precisely so it is reachable without
    // being pushed below a sticky header - that is its job, so it is
    // exempt from the "clears the navbar" check that applies to everything
    // after it. The navbar's OWN contents (logo link, nav items, theme
    // toggle) are also exempt: they live inside the header, at y-coordinates
    // between 0 and navbarBottom by construction, so "top >= navbarBottom"
    // would never hold for them even though nothing is obscuring them. The
    // check is about page CONTENT scrolling underneath the sticky header,
    // not about the header's own children.
    const failures: string[] = []
    const maxTabs = 80
    const VISITED_ATTR = 'data-e2e-tab-visited'

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      const count = await focused.count()
      if (count === 0) break

      const alreadyVisited = await focused.evaluate((el, attr) => el.hasAttribute(attr), VISITED_ATTR)
      if (alreadyVisited) break // cycled back to the start of the tab order
      await focused.evaluate((el, attr) => el.setAttribute(attr, '1'), VISITED_ATTR)

      const insideNavbar = await focused.evaluate((el) => el.closest('header') !== null)
      if (insideNavbar) continue

      const label = await focused.evaluate(
        (el) =>
          el.getAttribute('aria-label') ||
          el.textContent?.trim().slice(0, 40) ||
          el.tagName,
      )
      const box = await focused.boundingBox()
      if (!box) continue // not visible/rendered a box; nothing to check

      if (box.y < navbarBottom - 1) {
        failures.push(`"${label}" top=${box.y.toFixed(1)}px < navbar bottom=${navbarBottom.toFixed(1)}px`)
      }
    }

    expect(
      failures,
      `Focused element(s) obscured by the sticky navbar:\n${failures.join('\n')}`,
    ).toEqual([])
  })
})

test.describe('theme toggle', () => {
  test('round-trips to dark, persists across reload, and round-trips back', async ({ page }) => {
    await page.goto('/')

    const html = page.locator('html')
    const isDark = await html.evaluate((el) => el.classList.contains('dark'))
    if (!isDark) {
      await page.getByRole('button', { name: /switch to dark theme/i }).click()
    }

    await expect(html).toHaveClass(/dark/)
    const darkBg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(darkBg).toBe('rgb(9, 9, 11)') // --color-background under .dark, #09090B

    await page.reload()
    await expect(html).toHaveClass(/dark/)
    const darkBgAfterReload = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(darkBgAfterReload).toBe('rgb(9, 9, 11)')

    await page.getByRole('button', { name: /switch to light theme/i }).click()
    await expect(html).not.toHaveClass(/dark/)
  })
})

test.describe('no console errors on load', () => {
  test('light theme', async ({ page }) => {
    const errors = await collectConsoleErrors(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('dark theme', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('theme', 'dark'))
    const errors = await collectConsoleErrors(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })
})
