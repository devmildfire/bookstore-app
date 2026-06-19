'use client'

import dynamic from 'next/dynamic'
import type { Subscription } from '@/entities/subscription'

// The mobile carousel sits well below the fold (after the hero + catalog grid), so defer the
// whole instance off the initial load (ssr:false). The desktop grid in SubscriptionsSection is
// server-rendered and unaffected; on mobile the carousel mounts after hydration, by which point
// the user hasn't scrolled to it.
const SubscriptionsCarousel = dynamic(() => import('./SubscriptionsCarousel'), { ssr: false })

export default function SubscriptionsCarouselLazy({ items }: { items: Subscription[] }) {
  return <SubscriptionsCarousel items={items} />
}
