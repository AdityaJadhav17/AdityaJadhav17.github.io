import { test, expect } from '@playwright/test'
import { projects } from '../src/content/projects'
import { experience } from '../src/content/experience'
import { site } from '../src/content/site'

test('without JS the page carries the claim, every project and every role', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  // CSS uppercases the claim, so compare case-insensitively.
  const text = await page.locator('body').innerText()
  expect(text.toLowerCase()).toContain(site.positioning.toLowerCase())
  for (const p of projects) expect(text).toContain(p.title)
  for (const e of experience) expect(text).toContain(e.role)
  await expect(page.locator('noscript')).toHaveCount(0)
  await context.close()
})
