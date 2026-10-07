import { defineConfig, devices } from '@playwright/test'

// End-to-end / accessibility verification tests. They run on every pull
// request to main via .github/workflows/ci.yml (a required check), not in
// deploy.yml: by the time a commit reaches main it has already passed here,
// so repeating the ~300MB browser download on every deploy buys nothing.
// They cover what the Vitest suite cannot observe: prefers-reduced-motion
// emulation, real OS focus for Tab-driven scrolling, and a JavaScript-disabled
// render.
//
// webServer builds the production bundle and serves it with `vite preview`
// rather than `vite dev`, so the suite exercises the actual deployed
// artifact (minified, tree-shaken, no dev-only React warnings/overlay)
// instead of a dev-server approximation of it.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // WebKit is Safari's engine; the device preset adds the iPhone viewport,
      // touch, and mobile user agent. Closest stand-in for a real iPhone on CI.
      name: 'iphone',
      use: { ...devices['iPhone 15'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
