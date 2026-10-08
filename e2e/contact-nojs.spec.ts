import { test, expect } from '@playwright/test'

// Submitting before hydration (or with JS off) used to fall back to a GET on
// the current URL, reloading the page with the fields in the query string and
// sending nothing to Formspree. The form must POST to Formspree natively.
test('contact form posts to Formspree without JavaScript', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'native form submit runs once, on Chromium')

  const context = await browser.newContext({
    javaScriptEnabled: false,
    // theme.css turns smooth scrolling off under reduced motion; otherwise the
    // submit button keeps moving while fill() scrolls and click never settles.
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()

  const formspree: { method: string; body: string | null }[] = []
  await page.route('https://formspree.io/**', async (route) => {
    const req = route.request()
    formspree.push({ method: req.method(), body: req.postData() })
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>ok</p>' })
  })

  const navigations: string[] = []
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigations.push(frame.url())
  })

  await page.goto('/')
  await page.locator('#contact-name').fill('Test Person')
  await page.locator('#contact-email').fill('test@example.com')
  await page.locator('#contact-message').fill('Hello there')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect.poll(() => formspree.length).toBe(1)
  await page.waitForLoadState()

  expect(formspree).toHaveLength(1)
  expect(formspree[0].method).toBe('POST')
  const params = new URLSearchParams(formspree[0].body ?? '')
  expect(params.get('name')).toBe('Test Person')
  expect(params.get('email')).toBe('test@example.com')
  expect(params.get('message')).toBe('Hello there')
  expect(navigations.filter((u) => u.includes('?'))).toEqual([])

  await context.close()
})
