import Image from 'next/image'
import SubscriptionConnectButton from './SubscriptionConnectButton'
import { formatPrice, formatProductPrice } from '@/lib/formatPrice'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// Directive-less (shared) component: renders on the SERVER in the desktop grid
// (SubscriptionsSection) and as CLIENT inside the mobile Swiper (SubscriptionsCarousel).
// The only interactive part — the connect button — is the client leaf below.
export default function SubscriptionCard({ sub }: { sub: Subscription }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        {sub.imageUrl ? (
          <Image
            src={sub.imageUrl}
            alt={sub.name}
            fill
            className={styles.image}
            sizes="(max-width: 532px) 90vw, 380px"
            placeholder={sub.imageBlurDataUrl ? 'blur' : 'empty'}
            blurDataURL={sub.imageBlurDataUrl ?? undefined}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{sub.name}</h3>

        <ul className={styles.perks}>
          {sub.perks.map((perk) => (
            <li key={perk} className={styles.perk}>{perk}</li>
          ))}
        </ul>

        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatProductPrice(sub.price)}</span>
          {sub.originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(sub.originalPrice)}</span>
          )}
          <span className={styles.priceLabel}>в месяц</span>
        </div>

        <SubscriptionConnectButton
          cartId={sub.cartId}
          name={sub.name}
          price={sub.price}
          imageUrl={sub.imageUrl}
          discount={sub.discount}
        />
      </div>
    </div>
  )
}
