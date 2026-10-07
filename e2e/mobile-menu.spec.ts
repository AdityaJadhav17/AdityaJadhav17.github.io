import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

// Navigating from the drawer (scroll-lock wait, focus handoff) and the plain
// close path (focus returns to the trigger) are what Navbar's refs exist for.
test('a link in the menu scrolls to its section and focuses it, close returns focus', async ({ page }, ti) => {
  test.skip(ti.project.name !== 'chromium')
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'About' }).click()
  await page.waitForTimeout(1500)
  const r = await page.evaluate(() => ({ y: scrollY, active: document.activeElement?.id, hash: location.hash, locked: document.body.hasAttribute('data-scroll-locked') }))
  expect(r.y).toBeGreaterThan(300)
  expect(r.active).toBe('about')
  // plain close returns focus to trigger
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('button', { name: 'Close' }).click()
  await page.waitForTimeout(500)
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
})

// The menu's Radix Dialog loads on first touch of the button. A single tap
// must still open it when the chunk is slow.
test('the first tap opens the lazy mobile menu even when its chunk is slow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
  await page.route('**/assets/MobileSheet-*.js', async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.continue()
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
})
