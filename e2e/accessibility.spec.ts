import { test, expect, type Page } from '@playwright/test'

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

// The reveal transform lives on the wrapper div that Reveal.Item renders,
// not on the heading itself, so these assertions read the heading's
// parentElement. Asserting on the h2 would read "none" in both states and
// pass vacuously, which is the exact defect this rewrite removes.
//
// What separates the two motion modes is INTERPOLATION, not any single
// sampled value. Asserting "never translated" under reduced motion is racy:
// the wrapper still starts at its static `hidden` translate and settles a
// few frames later, so an early sample can legitimately catch it. But under
// reduced motion there is no transform animation, so the transform never
// takes an intermediate value; without it, it passes through many.
// Measured over four runs per mode: 0 intermediate samples under `reduce`,
// 15 under `no-preference`.

/** translateY in px from a computed transform, or null if unparseable. */
function translateY(transform: string): number | null {
  if (transform === 'none') return 0
  const match = transform.match(/^matrix\(([^)]+)\)$/)
  if (!match) return null
  const parts = match[1].split(',').map((part) => Number(part.trim()))
  return parts.length === 6 ? parts[5] : null
}

// The reveal rises 16px. A value strictly inside that range is evidence of
// an in-flight transform animation: the bounds exclude both the resting
// hidden value and the settled one.
const RISE_PX = 16

function midRiseCount(samples: string[]): number {
  return samples.filter((sample) => {
    const y = translateY(sample)
    return y !== null && y > 0.5 && y < RISE_PX - 0.5
  }).length
}

async function sampleRevealEntrance(page: Page) {
  return page.locator('#work h2').evaluate(async (heading) => {
    const wrapper = heading.parentElement as HTMLElement
    const samples: string[] = []

    wrapper.scrollIntoView()
    // 45 frames is roughly 750ms at 60fps, comfortably past the 500ms
    // reveal, so the entrance is fully covered and settled by the end.
    // scrollIntoView() itself inherits the page's CSS scroll-behavior,
    // which is smooth without a motion preference and forced instant under
    // reduced motion (see src/styles/theme.css). So the no-preference
    // sampling window here absorbs an animated scroll on top of the reveal,
    // while the reduced-motion window above only ever covers the reveal.
    // That asymmetry has not produced flakiness (three full-suite runs,
    // twelve single-worker runs), but it is worth knowing before changing
    // frame counts or timings here.
    for (let i = 0; i < 45; i++) {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      samples.push(getComputedStyle(wrapper).transform)
    }

    const settled = getComputedStyle(wrapper)
    return { samples, transform: settled.transform, opacity: settled.opacity }
  })
}

test.describe('reduced motion suppresses the reveal translate', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('the Work heading never interpolates its transform, and ends visible', async ({
    page,
  }) => {
    await page.goto('/')

    const { samples, transform, opacity } = await sampleRevealEntrance(page)

    expect(midRiseCount(samples)).toBe(0)
    expect(transform).toBe('none')
    expect(opacity).toBe('1')
  })
})

test.describe('control: without reduced motion the reveal does translate', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  // The same sampling in the opposite state. This is what stops the test
  // above from passing vacuously: it proves the motion preference changes
  // the rendered result rather than merely being readable.
  test('the Work heading interpolates its transform, then settles visible', async ({
    page,
  }) => {
    await page.goto('/')

    const { samples, transform, opacity } = await sampleRevealEntrance(page)

    expect(midRiseCount(samples)).toBeGreaterThan(0)
    expect(transform).toBe('none')
    expect(opacity).toBe('1')
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
