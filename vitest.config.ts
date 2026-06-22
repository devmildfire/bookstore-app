import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Phase 1 harness (docs/testing/STRATEGY.md §7). Unit tests are pure functions —
// `node` environment, no jsdom/MSW/RTL (those arrive with component tests in
// Phase 2). Integration tests live under tests/integration and run against the
// real local Supabase stack in CI only. E2E (tests/e2e) is Playwright, excluded
// here. Coverage thresholds are intentionally NOT enforced yet — added once
// Phase 1 coverage clears them (§10 step 7), so they can't redden a green CI.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
})
