import { test, expect } from '@playwright/test'

// Phase 1 E2E smoke: home renders and links into the catalog. The hero (featured
// books) renders eagerly, so a /books/ link is present without scrolling the
// deferred catalog section into view. See docs/testing/STRATEGY.md §3 Layer 3.
test('home renders and navigates to a book detail page', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Чтиво/)

  const bookLink = page.locator('a[href^="/books/"]').first()
  await expect(bookLink).toBeVisible()

  await bookLink.click()
  await expect(page).toHaveURL(/\/books\//)
})
