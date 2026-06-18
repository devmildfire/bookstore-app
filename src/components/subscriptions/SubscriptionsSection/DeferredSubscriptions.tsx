'use client'

import dynamic from 'next/dynamic'
import useInView from '@/hooks/useInView'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// ssr:false → the body's JS chunk, images and DOM are NOT in the initial document
// or the LCP window; they mount only once the section approaches the viewport.
const SubscriptionsBody = dynamic(() => import('./SubscriptionsBody'), { ssr: false })

export default function DeferredSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section
      ref={ref}
      className={styles.section}
      // Reserve space until mounted so the page height (and below content) doesn't jump.
      style={inView ? undefined : { minHeight: 640 }}
    >
      {inView && <SubscriptionsBody subscriptions={subscriptions} />}
    </section>
  )
}
