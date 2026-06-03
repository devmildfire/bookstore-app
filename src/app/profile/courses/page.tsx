import type { Metadata } from 'next'
import MyCoursesList from '@/components/profile/MyCoursesList'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Мои курсы',
  description: 'Курсы, которыми вы владеете, в личном кабинете Чтива.',
}

export default function ProfileCoursesPage() {
  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Мои курсы</h2>
      <MyCoursesList />
    </section>
  )
}
