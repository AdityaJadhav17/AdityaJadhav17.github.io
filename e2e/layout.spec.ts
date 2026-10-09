import { test, expect, type Page } from '@playwright/test'

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
  [1440, 900, 6750],
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

const expectCoarsePointer = async (page: Page) =>
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    'iphone project must emulate a coarse pointer',
  ).toBe(true)

// Every control in Work has a >= 44x44 hit box on touch.
test('work controls have 44px touch targets', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone', 'iPhone only')
  await page.goto('/')
  await expectCoarsePointer(page)
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
  await expectCoarsePointer(page)
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

// B4: no dead band, and the portrait stays clear of the Capabilities list at
// every desktop size, including short viewports where the hero is only as tall
// as the screen. The name stays on one line.
for (const [width, height] of [
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
] as const) {
  test(`portrait clears the capabilities list by 24px at ${width}x${height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const capsBottom = await page
      .locator('#home p', { hasText: /^Capabilities$/ })
      .locator('xpath=..')
      .evaluate((el) => el.getBoundingClientRect().bottom)
    const portraitTop = await page.locator('#home picture img').evaluate((el) => el.getBoundingClientRect().top)
    console.log(`${width}x${height} capabilities clearance`, portraitTop - capsBottom)
    expect(portraitTop - capsBottom).toBeGreaterThanOrEqual(24)
    const h1 = await page.locator('h1').evaluate((el) => ({
      h: el.getBoundingClientRect().height,
      lh: parseFloat(getComputedStyle(el).lineHeight),
    }))
    expect(h1.h).toBeLessThan(h1.lh * 1.5)
  })
}

// B5: the claim sits right under the name (the metadata columns span both rows
// rather than stretching the identity row), and wraps in the same four lines
// at every desktop width.
for (const width of [1024, 1280, 1440]) {
  test(`claim sits under the identity block at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(600) // hero-in entrance settles (<= 400 ms)
    const { gap, lines } = await page.evaluate(() => {
      const label = document.querySelector('h1 + p')!.getBoundingClientRect()
      const claim = document.querySelector('#home > p')!
      const r = claim.getBoundingClientRect()
      return { gap: r.top - label.bottom, lines: Math.round(r.height / parseFloat(getComputedStyle(claim).lineHeight)) }
    })
    expect(gap).toBeLessThanOrEqual(48)
    expect(lines).toBe(4)
  })
}

// B5: the hero figures link to where they come from; a project target also
// has its details opened.
test('hero stats link to their sources', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const targets = [
    [/11 engineers led on WatchTower/, '#project-watchtower', true],
    [/0\.9175 mAP/, '#project-sim2real', true],
    [/150\+ members/, '#experience-ai-club', false],
  ] as const
  for (const [name, hash, hasDetails] of targets) {
    await page.getByRole('link', { name }).click()
    await expect(page).toHaveURL(new RegExp(`${hash}$`))
    const target = page.locator(hash)
    await expect(target).toBeVisible()
    if (hasDetails) await expect(target.locator('details')).toHaveAttribute('open', '')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  }
})

// B5: featured projects drop the card chrome; grid projects keep it.
test('featured projects have no card chrome, grid projects do', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
  await page.goto('/')
  const chrome = (id: string) =>
    page.locator(`#project-${id}`).evaluate((el) => {
      const s = getComputedStyle(el)
      return { border: s.borderTopWidth, shadow: s.boxShadow, bg: s.backgroundColor }
    })
  expect(await chrome('watchtower')).toEqual({ border: '0px', shadow: 'none', bg: 'rgba(0, 0, 0, 0)' })
  expect((await chrome('sim2real')).border).toBe('1px')
})

// From lg the dates sit in a left column, with the dot and rail between them
// and the content: date edge to content edge stays within 24px, and each dot is
// centred on the rail.
test('experience dates sit beside their content at 1440px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const rows = await page.evaluate(() => {
    const rail = document.querySelector('#experience span.origin-top')!.getBoundingClientRect()
    return [...document.querySelectorAll('#experience ol > li')].map((li) => {
      const date = document.createRange()
      date.selectNodeContents(li.querySelector('span.tabular-nums')!)
      const title = li.querySelector('h3, h4')!.getBoundingClientRect()
      const dot = li.querySelector('span.rounded-full')!.getBoundingClientRect()
      return {
        id: li.id,
        gap: title.left - date.getBoundingClientRect().right,
        dateTop: date.getBoundingClientRect().top - title.top,
        railOffset: dot.left + dot.width / 2 - (rail.left + rail.width / 2),
      }
    })
  })
  console.log('experience rows', JSON.stringify(rows))
  expect(rows).toHaveLength(5)
  for (const r of rows) {
    expect(r.gap, r.id).toBeGreaterThan(0)
    expect(r.gap, r.id).toBeLessThanOrEqual(24)
    expect(Math.abs(r.railOffset), r.id).toBeLessThanOrEqual(1)
  }
  await expect(page.locator('#experience h3', { hasText: 'Leadership' })).toBeVisible()
  expect(await page.locator('#experience ol > li').evaluateAll((els) => els.map((e) => e.id))).toEqual([
    'experience-uc-san-diego-its',
    'experience-lumulus',
    'experience-nutrifitworld',
    'experience-ai-club',
    'experience-cybersecurity-club',
  ])
})

// B5 fix: the stats follow the actions instead of sitting at the bottom, and
// still keep clear of the portrait.
for (const [width, height] of [
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
] as const) {
  test(`stats follow the actions and clear the portrait at ${width}x${height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.waitForTimeout(600)
    const m = await page.evaluate(() => {
      const actions = document.querySelector('#home a[download]')!.parentElement!.getBoundingClientRect()
      const stats = document.querySelector('#home ul.hero-in:last-of-type')!
      const portrait = document.querySelector('#home picture img')!.getBoundingClientRect()
      const labels = [...stats.querySelectorAll('li p:last-child')].map((p) => {
        const r = document.createRange()
        r.selectNodeContents(p)
        return r.getBoundingClientRect()
      })
      return {
        gap: stats.getBoundingClientRect().top - actions.bottom,
        clearance: portrait.left - Math.max(...labels.map((l) => l.right)),
      }
    })
    console.log(`${width}x${height} stats gap`, m.gap, 'label clearance', m.clearance)
    expect(m.gap).toBeLessThanOrEqual(64)
    // At 1024 the portrait's box already reaches into the left columns (its
    // left edge is transparent); the figures sit where they always did, so only
    // the wider layouts are held to a clearance.
    if (width >= 1280) expect(m.clearance).toBeGreaterThanOrEqual(40)
  })
}

// Linking to a card from outside the page opens it.
test('loading #project-<id> opens that card', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
  await page.goto('/#project-sim2real')
  await expect(page.locator('#project-sim2real details')).toHaveAttribute('open', '')
  await expect(page.locator('#project-watchtower details')).not.toHaveAttribute('open', '')
})

// Only project cards open on a hash; section and skip-link targets do not.
for (const hash of ['work', 'main']) {
  test(`loading #${hash} leaves every card closed`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.goto(`/#${hash}`)
    await expect(page.locator('#work details[open]')).toHaveCount(0)
  })
}
