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
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
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
