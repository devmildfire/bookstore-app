import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Phase 1 harness (docs/testing/STRATEGY.md §7). Unit tests are pure functions —
// `node` environment, no jsdom/MSW/RTL (those arrive with component tests in
// Phase 2). Integration tests live under tests/integration and run against the
// real local Supabase stack in CI only. E2E (tests/e2e) is Playwright, excluded.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      // Whole-repo denominator (honest "% of the codebase exercised"). Most .tsx
      // components/pages are 0 until component/E2E tests land — that's expected;
      // the ratchet below climbs as they do.
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['**/*.test.ts', '**/*.d.ts', 'src/types/supabase.ts'],
      // Ratchet: the floor only ever rises. autoUpdate bumps these numbers on a
      // local run when coverage improves (commit the bump); CI enforces the
      // committed floor and fails any PR that drops below it. We gate on
      // lines+statements only — v8 counts branches/functions for loaded files
      // only, so those % can dip when a new test imports an untested module.
      thresholds: {
        autoUpdate: true,
        lines: 0.42,
        statements: 0.42,
      },
    },
  },
})