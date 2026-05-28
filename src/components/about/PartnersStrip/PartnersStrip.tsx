import Marquee from '@/components/about/Marquee'
import PartnerLogo from './PartnerLogo'
import type { Partner } from '@/entities/partner/client'
import styles from './PartnersStrip.module.scss'

type Props = {
  partners: Partner[]
}

export default function PartnersStrip({ partners }: Props) {
  if (partners.length === 0) return null

  return (
    <section className={styles.wrapper} aria-labelledby='partners-heading'>
      <h2 id='partners-heading' className={styles.heading}>
        Наши партнёры
      </h2>
      <Marquee speed={80} reverse ariaLabel='Партнёры Чтива' className={styles.marquee} itemClassName={styles.row}>
        {partners.map((partner) => (
          <PartnerLogo key={partner.id} partner={partner} />
        ))}
      </Marquee>
    </section>
  )
}
