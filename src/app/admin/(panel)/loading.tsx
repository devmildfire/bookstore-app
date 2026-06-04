import styles from './loading.module.scss'

export default function AdminPanelLoading() {
  return (
    <div className={styles.wrap} role='status' aria-live='polite'>
      <span className={styles.spinner} aria-hidden />
      <span className={styles.text}>Загрузка…</span>
    </div>
  )
}
