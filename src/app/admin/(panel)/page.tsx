import type { Metadata } from 'next'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Сводка',
}

// Dashboard. Counts are wired to real data in a later phase (see tracker
// Phase 8); for now it's the landing surface confirming admin access.
export default function AdminDashboardPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Сводка</h1>
      <p className={styles.lede}>
        Добро пожаловать в админ-панель Чтива. Выберите раздел слева.
      </p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Заказы к отправке</span>
          <span className={styles.cardValue}>—</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Черновики книг</span>
          <span className={styles.cardValue}>—</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Новые заявки</span>
          <span className={styles.cardValue}>—</span>
        </div>
      </div>
    </section>
  )
}
