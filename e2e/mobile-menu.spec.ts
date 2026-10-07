import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

// Navigating from the drawer (scroll-lock wait, focus handoff) and the plain
// close path (focus returns to the trigger) are what Navbar's refs exist for.
test('a link in the menu scrolls to its section and focuses it, close returns focus', async ({ page }, ti) => {
  test.skip(ti.project.name !== 'chromium')
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'About' }).click()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300)
  await expect(page.locator('#about')).toBeFocused()
  // plain close returns focus to trigger
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('button', { name: 'Close' }).click()
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

// Touch smoke test: the lazy menu and the theme toggle respond to a tap.
test.describe('touch', () => {
  test.use({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true })

  test('menu and theme toggle respond to the first tap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium only')
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto('/', { waitUntil: 'load' })
    await page.getByRole('button', { name: 'Switch to dark theme' }).tap()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.getByRole('button', { name: 'Open menu' }).tap()
    await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  })
})
