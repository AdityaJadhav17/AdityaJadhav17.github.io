import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // e2e/ holds Playwright specs (run via `npm run test:e2e`), not Vitest
    // specs; Vitest's default include pattern would otherwise pick them up
    // and fail, since they call Playwright's test.describe() outside of a
    // Playwright test run.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
