import Image from 'next/image'
import PartnerPlaceholder from '@/assets/about/partner-placeholder.svg'
import type { Partner } from '@/entities/partner/client'
import styles from './PartnerLogo.module.scss'

type Props = {
  partner: Partner
}

export default function PartnerLogo({ partner }: Props) {
  return (
    <div className={styles.tile} aria-label={`Партнёр: ${partner.name}`}>
      {partner.logoUrl ? (
        <Image
          src={partner.logoUrl}
          alt={partner.name}
          width={200}
          height={200}
          className={styles.logo}
          sizes='200px'
          unoptimized
        />
      ) : (
        <>
          <PartnerPlaceholder className={styles.logo} aria-hidden='true' />
          <span className={styles.label}>{partner.name}</span>
        </>
      )}
    </div>
  )
}
