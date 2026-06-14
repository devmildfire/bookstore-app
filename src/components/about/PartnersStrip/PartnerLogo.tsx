import Image from 'next/image'
import cn from 'classnames'
import PartnerPlaceholder from '@/assets/about/partner-placeholder.svg'
import type { Partner } from '@/entities/partner'
import styles from './PartnerLogo.module.scss'

type Props = {
  partner: Partner
}

export default function PartnerLogo({ partner }: Props) {
  // Wordmark logos carry their own name; mark-only logos get the supplied
  // caption rendered beneath (the logo shrinks to make room).
  const caption = partner.caption?.trim()

  const inner = partner.logoUrl ? (
    <>
      <Image
        src={partner.logoUrl}
        alt={partner.name}
        width={250}
        height={250}
        className={cn(styles.logoFill, caption && styles.logoCaptioned)}
        sizes='250px'
        unoptimized
      />
      {caption && <span className={styles.caption}>{caption}</span>}
    </>
  ) : (
    <>
      <PartnerPlaceholder className={styles.logoPlaceholder} aria-hidden='true' />
      <span className={styles.label}>{partner.name}</span>
    </>
  )

  if (partner.websiteUrl) {
    return (
      <a
        className={cn(styles.tile, styles.tileLink)}
        href={partner.websiteUrl}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={`Партнёр: ${partner.name}`}
      >
        {inner}
      </a>
    )
  }

  return (
    <div className={styles.tile} aria-label={`Партнёр: ${partner.name}`}>
      {inner}
    </div>
  )
}
