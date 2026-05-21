import styles from './page.module.scss'

export default function ProfileFavoritesPage() {
  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Избранное</h2>
      <p className={styles.empty}>
        Пока ничего нет. Скоро здесь появятся книги, которые вам понравились.
      </p>
    </section>
  )
}
