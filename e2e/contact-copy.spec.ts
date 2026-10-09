import { test, expect } from '@playwright/test'

const EMAIL = 'aditya.jadhav7910@gmail.com'

test.describe('copy email', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'clipboard permissions are Chromium only')

  test('copies the address and announces it once', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto('/')
    const button = page.getByRole('button', { name: 'Copy email' })
    const live = page.locator('#contact [aria-live="polite"]')
    await button.scrollIntoViewIfNeeded()
    await button.click()
    await expect(live).toHaveText('Copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL)
    await expect(live).toHaveText('', { timeout: 3000 })
    await expect(page.getByRole('link', { name: 'Email', exact: true })).toHaveAttribute('href', `mailto:${EMAIL}`)
    await context.close()
  })

  test('selects the address when the clipboard is unavailable', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }))
    await page.goto('/')
    await page.getByRole('button', { name: 'Copy email' }).click()
    expect(await page.evaluate(() => getSelection()?.toString())).toBe(EMAIL)
    await expect(page.locator('#contact [aria-live="polite"]')).toHaveText('Email selected')
    await context.close()
  })
})

// "Copy email" is the same Button size as the Email/GitHub/LinkedIn buttons
// below it: equal heights at a mouse width and on a touch phone.
test('copy email is as tall as the contact buttons', async ({ page }, testInfo) => {
  test.skip(!['chromium', 'iphone'].includes(testInfo.project.name))
  if (testInfo.project.name === 'chromium') await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const heights = await page.evaluate(() =>
    [...document.querySelectorAll('#contact .flex-wrap button, #contact .flex-wrap a')]
      .filter((el) => !el.closest('form') && el.textContent)
      .map((el) => [el.textContent!.trim(), el.getBoundingClientRect().height]),
  )
  expect(heights.map(([name]) => name)).toEqual(['Copy email', 'Email', 'GitHub', 'LinkedIn'])
  expect(new Set(heights.map(([, h]) => h)).size, JSON.stringify(heights)).toBe(1)
})
