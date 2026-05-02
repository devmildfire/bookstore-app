import type { ProductCategory } from '@/types/database'

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  PrintBook: 'Печатная книга',
  AudioBook: 'Аудиокнига',
  EBook: 'Электронная книга',
  'Book2.0': 'Книга 2.0',
  GiftCard: 'Подарочная карта',
  BoxSet: 'Комплект',
  Subscription: 'Подписка',
  Course: 'Курс',
}

export function getProductCategoryLabel(category: ProductCategory): string {
  return PRODUCT_CATEGORY_LABELS[category]
}
