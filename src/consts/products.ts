import type { ProductCategory } from '@/types/database'

// Digital product types are sold as files (download/stream) — a buyer can
// only own one copy, so the cart caps them at quantity 1 and renders no
// quantity stepper. The add-to-cart modal mirrors this with a toggle button
// instead of +/−.
//
// Book2.0 is intentionally NOT digital: it's a physical object (key-card /
// USB drive) that ships with digital media on it, so it can be sold in
// quantities like any other physical product.
export const DIGITAL_CATEGORIES = new Set<ProductCategory>(['EBook', 'AudioBook'])

export function isDigitalCategory(category: ProductCategory): boolean {
  return DIGITAL_CATEGORIES.has(category)
}
