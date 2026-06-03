import styles from './ComingSoon.module.scss'

// Placeholder for admin sections whose phase hasn't landed yet. Keeps the
// shell fully navigable without 404s while the panel is built out.
type Props = { title: string; note?: string }

export default function ComingSoon({ title, note }: Props) {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>{note ?? 'Раздел в разработке.'}</p>
    </div>
  )
}
