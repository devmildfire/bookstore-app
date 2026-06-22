import { test, expect } from '@playwright/test'

// Phase 1 E2E smoke. Targets only always-present, SSR'd chrome: the home page
// title + the «ИЗДАНИЯ» catalog heading, and a stable header link (the profile
// cabinet, reachable by anon users). Deliberately avoids book/catalog cards —
// the featured hero can be empty and the catalog grid is interaction-deferred.
test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Чтиво/)
  await expect(page.getByRole('heading', { name: 'ИЗДАНИЯ' })).toBeVisible()
})

test('header navigates to the profile cabinet', async ({ page }) => {
  await page.goto('/')
  await page.locator('header a[href="/profile"]').first().click()
  await expect(page).toHaveURL(/\/profile/)
})
