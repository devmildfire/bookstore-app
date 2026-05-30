import type { Metadata } from 'next'
import SubscriptionsSection from '@/components/subscriptions/SubscriptionsSection/SubscriptionsSection'

export const metadata: Metadata = {
  title: 'Чудеса подписки',
  description: 'Подпишитесь на Чтиво и получайте все новые издания: цифровые, аудио и печатные.',
  openGraph: {
    title: 'Чудеса подписки',
    description: 'Подпишитесь на Чтиво и получайте все новые издания: цифровые, аудио и печатные.',
  },
}

export default function SubscriptionPage() {
  return <SubscriptionsSection />
}
