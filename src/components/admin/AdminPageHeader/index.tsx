import Link from 'next/link'
import { PlusIcon } from '@/components/common/icons'
import styles from './AdminPageHeader.module.scss'

// The one page header for every admin section, per the handoff `.page-head`:
// uppercase Cheque title + muted count, with an optional create action pushed
// right by a spacer. On mobile the row wraps and the create button drops to its
// own full-width line (the per-page headers used to squish here).
type Props = {
  title: string
  count?: React.ReactNode
  createHref?: string
  createLabel?: string
}

export default function AdminPageHeader({ title, count, createHref, createLabel }: Props) {
  return (
    <header className={styles.head}>
      <h1 className={styles.title}>{title}</h1>
      {count != null && <span className={styles.count}>{count}</span>}
      {createHref && (
        <>
          <span className={styles.spacer} />
          <Link href={createHref} className={styles.create}>
            <PlusIcon />
            {createLabel}
          </Link>
        </>
      )}
    </header>
  )
}
