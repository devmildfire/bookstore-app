import { test, expect } from '@playwright/test'

// Phase 1 E2E smoke. The home hero needs featured books and the home catalog is
// deferred (useInView), so the reliable book link is the catalog page /books,
// which server-renders BookCard links (`/books/<slug>`). See STRATEGY.md §3.
test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Чтиво/)
})

test('catalog lists books and navigates to a book detail page', async ({ page }) => {
  await page.goto('/books')

  const bookLink = page.locator('a[href^="/books/"]').first()
  await expect(bookLink).toBeVisible()

  await bookLink.click()
  await expect(page).toHaveURL(/\/books\/.+/)
})
