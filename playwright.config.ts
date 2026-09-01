import { defineConfig, devices } from '@playwright/test'

// These are local end-to-end / accessibility verification tests, not part of
// the deploy gate. They intentionally do NOT run in .github/workflows/deploy.yml:
// that workflow already gates on typecheck, lint, and the Vitest unit suite,
// and adding a ~300MB browser download to every deploy is an ongoing cost
// (CI minutes, cache maintenance) with no benefit for a static portfolio site
// that changes infrequently. Run `npm run test:e2e` locally (or in a manually
// triggered workflow) before a release that touches theming, motion, or
// keyboard/focus behavior, since those are exactly what this suite checks and
// what the previous (non-Playwright) test harness could not observe:
// prefers-reduced-motion emulation, real OS focus for Tab-driven scrolling,
// and a JavaScript-disabled render.
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
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
