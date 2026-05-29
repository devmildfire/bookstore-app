import GiftCardTierCard from '@/components/giftCards/GiftCardTierCard'
import type { GiftCardProduct } from '@/entities/giftCardProduct/client'
import styles from './GiftCardStorefront.module.scss'

type Props = {
  products: GiftCardProduct[]
}

export default function GiftCardStorefront({ products }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Карты даров</h1>
        <div className={styles.intro}>
          <p>Подарите себе и ближнему лучшую современную литературу. Получите безграничное признание сообщества инди-книгоиздания.</p>
          <p>Виртуальные карты, которые позволят вашему другу в любое время заказать любое издание Чтива.  Номинал не сгорает, пока мы работаем, подводных камней вообще никаких, даже объяснять нечего — идеальные дары и всё тут.</p>
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <GiftCardTierCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
