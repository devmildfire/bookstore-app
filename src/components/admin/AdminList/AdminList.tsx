import Link from 'next/link'
import Image from 'next/image'
import { ChevronRightIcon } from '@/components/admin/icons'
import styles from './AdminList.module.scss'

// The one canonical admin list, per the design handoff (`admin.css` .rows/.row):
// a single bordered container with hairline dividers between rows — NO gaps,
// no per-row borders. Used by every list section so they stay uniform.
export function AdminList({ children }: { children: React.ReactNode }) {
  return <ul className={styles.rows}>{children}</ul>
}

type AdminRowProps = {
  href: string
  /** When provided, renders the 44×62 jacket cover (or a placeholder for null). */
  coverUrl?: string | null
  coverAlt?: string
  name: React.ReactNode
  sub?: React.ReactNode
  /** Trailing emphasised value (e.g. a price), shown before the badges. */
  value?: React.ReactNode
  badges?: React.ReactNode
  chevron?: boolean
}

export function AdminRow({
  href,
  coverUrl,
  coverAlt = '',
  name,
  sub,
  value,
  badges,
  chevron = true,
}: AdminRowProps) {
  return (
    <li className={styles.item}>
      <Link href={href} className={styles.row}>
        {coverUrl !== undefined && (
          <span className={styles.cover}>
            {coverUrl ? (
              <Image src={coverUrl} alt={coverAlt} fill sizes='44px' className={styles.coverImg} unoptimized />
            ) : (
              <span className={styles.coverPlaceholder} aria-hidden />
            )}
          </span>
        )}
        <span className={styles.info}>
          <span className={styles.name}>{name}</span>
          {sub != null && <span className={styles.sub}>{sub}</span>}
        </span>
        {value != null && <span className={styles.value}>{value}</span>}
        {badges != null && <span className={styles.badges}>{badges}</span>}
        {chevron && <ChevronRightIcon className={styles.chev} />}
      </Link>
    </li>
  )
}
