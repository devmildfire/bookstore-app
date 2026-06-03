import type { Metadata } from 'next'
import { getGiftCardProducts } from '@/api/giftCards/getGiftCardProducts'
import GiftCardStorefront from '@/components/giftCards/GiftCardStorefront'

export const metadata: Metadata = {
  title: 'Карты даров',
  description: 'Подарочные карты Чтива для покупки книг, цифровых изданий и подписок.',
  openGraph: {
    title: 'Карты даров',
    description: 'Подарочные карты Чтива для покупки книг, цифровых изданий и подписок.',
  },
}

export default async function GiftCardsPage() {
  const products = await getGiftCardProducts()

  return <GiftCardStorefront products={products} />
}
