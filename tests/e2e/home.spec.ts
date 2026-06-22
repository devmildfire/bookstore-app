import { test, expect } from '@playwright/test'

// Phase 1 E2E smoke. The home page SSRs the featured hero, whose slides link to
// `/books/<slug>`. We assert such a link is present, then navigate to it and
// confirm the book detail page renders. (Navigate by href rather than click —
// the hero is an Embla carousel whose off-screen slides are flaky to click.)
test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Чтиво/)
})

test('home links to a book detail page that renders', async ({ page }) => {
  await page.goto('/')

  const bookLink = page.locator('a[href^="/books/"]').first()
  await expect(bookLink).toBeAttached()

  const href = await bookLink.getAttribute('href')
  expect(href).toMatch(/^\/books\/.+/)

  await page.goto(href!)
  await expect(page).toHaveURL(/\/books\/.+/)
  await expect(page.locator('h1')).toBeVisible()
})
