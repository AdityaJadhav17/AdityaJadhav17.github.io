import { test as base, expect, type BrowserContext } from '@playwright/test'

// Tests must never contact Cloudflare. The site loads its analytics beacon, so
// every context (the built-in one and any made with browser.newContext) gets
// the two Cloudflare hosts fulfilled locally.
const mock = async (context: BrowserContext) => {
  await context.route('https://static.cloudflareinsights.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  )
  await context.route('https://cloudflareinsights.com/**', (r) => r.fulfill({ status: 204 }))
}

export const test = base.extend<{ cloudflareMock: void }>({
  cloudflareMock: [
    async ({ browser, context }, use) => {
      await mock(context)
      const original = browser.newContext.bind(browser)
      browser.newContext = async (options) => {
        const created = await original(options)
        await mock(created)
        return created
      }
      await use()
      browser.newContext = original
    },
    { auto: true },
  ],
})

export { expect }
