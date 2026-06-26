import { defineConfig, devices } from '@playwright/test'

// E2E config (docs/testing/STRATEGY.md §7). Runs in CI against the local Supabase
// stack (supabase start) + the Next.js server Playwright launches via `webServer`.
// The anon/service keys come from the CI env (deterministic local-stack keys);
// PAYMENT_PROVIDER=mock keeps checkout self-contained.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  // CI: `list` prints a line per test to the log, `junit` feeds the Markdown
  // job-summary table (scripts/junit-summary.mjs), `github` adds inline failure
  // annotations, `html` is uploaded as an artifact.
  reporter: process.env.CI
    ? [['list'], ['junit', { outputFile: 'results.junit.xml' }], ['github'], ['html']]
    : 'list',
  use: {
    // E2E_BASE_URL is set when testing the already-running production IMAGE
    // (ci.yml 1.3); otherwise the dev server below serves localhost:3000.
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /.*mobile.*/,
    },
  ],
  // When E2E_AGAINST_IMAGE is set, the built production image is already running
  // (ci.yml `docker run`s it) — don't start a dev server. Otherwise (local dev,
  // feature-branch e2e) launch `next dev`.
  webServer: process.env.E2E_AGAINST_IMAGE
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
          PAYMENT_PROVIDER: 'mock',
          SEND_EMAIL_HOOK_SECRET: 'whsec_test_secret_for_ci',
        },
      },
})
