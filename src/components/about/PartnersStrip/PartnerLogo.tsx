import Image from 'next/image'
import PartnerPlaceholder from '@/assets/about/partner-placeholder.svg'
import type { Partner } from '@/entities/partner/client'
import styles from './PartnerLogo.module.scss'

type Props = {
  partner: Partner
}

export default function PartnerLogo({ partner }: Props) {
  if (partner.logoUrl) {
    return (
      <div className={styles.tile} aria-label={`Партнёр: ${partner.name}`}>
        <Image
          src={partner.logoUrl}
          alt={partner.name}
          width={250}
          height={250}
          className={styles.logoFill}
          sizes='250px'
          unoptimized
        />
      </div>
    )
  }

  return (
    <div className={styles.tile} aria-label={`Партнёр: ${partner.name}`}>
      <PartnerPlaceholder className={styles.logoPlaceholder} aria-hidden='true' />
      <span className={styles.label}>{partner.name}</span>
    </div>
  )
}
