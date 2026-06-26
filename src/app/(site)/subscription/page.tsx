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
  // eager: this page is the section's above-the-fold content — SSR it (no defer)
  // so there's no pop-in shift and the LCP image is in the initial document.
  return <SubscriptionsSection eager />
}
