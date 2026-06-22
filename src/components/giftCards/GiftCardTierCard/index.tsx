import Image from 'next/image'
import GiftCardBuyTrigger from './GiftCardBuyTrigger'
import { formatPrice } from '@/lib/formatPrice'
import type { GiftCardProduct } from '@/entities/giftCardProduct'
import styles from './GiftCardTierCard.module.scss'

type Props = {
  product: GiftCardProduct
}

// Server component — body (image, name, face value) renders on the server; only the
// "Купить" button + modal is a client leaf (<GiftCardBuyTrigger>).
export default function GiftCardTierCard({ product }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={styles.image}
            sizes='(max-width: 532px) 90vw, (max-width: 1200px) 33vw, 380px'
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden />
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.value}>{formatPrice(product.faceValue)}</p>
        <GiftCardBuyTrigger product={product} />
      </div>
    </article>
  )
}
