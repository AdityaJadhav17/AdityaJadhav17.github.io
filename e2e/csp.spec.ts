import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

// The built pages carry a Content-Security-Policy <meta>. A blocked resource or
// inline script would show up as a securitypolicyviolation event, so these
// tests exercise the page for real (theme script, lazy menus, form submit) and
// require zero of them.
async function watch(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] }
    w.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)
    })
  })
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  return {
    errors,
    violations: () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp),
  }
}

test('the home page runs under its CSP with no violations', async ({ page }, ti) => {
  const seen = await watch(page)
  await page.route('https://formspree.io/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: '{"ok":true}',
    }),
  )
  await page.goto('/')
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1)

  // The inline pre-paint script ran (it is hash-allowed), then the theme menu works.
  await expect(page.locator('html')).toHaveAttribute('data-theme-pref', /.+/)
  await page.getByRole('button', { name: /^theme/i }).click()
  await page.getByRole('menuitemradio', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  if (ti.project.name === 'iphone') {
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()
  }

  await page.locator('#contact-name').fill('Test Person')
  await page.locator('#contact-email').fill('test@example.com')
  await page.locator('#contact-message').fill('Hello there')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('status').filter({ hasText: /\S/ })).toBeVisible()

  expect(await seen.violations()).toEqual([])
  expect(seen.errors).toEqual([])
})

test('the 404 page has a CSP and no violations', async ({ page }) => {
  const seen = await watch(page)
  await page.goto('/404.html')
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1)
  expect(await seen.violations()).toEqual([])
  expect(seen.errors).toEqual([])
})
