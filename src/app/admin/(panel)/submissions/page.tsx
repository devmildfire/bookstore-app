import type { Metadata } from 'next'
import { getStorySubmissions } from '@/api/admin/submissions'
import { SubmissionsList } from '@/components/admin/submissions'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Заявки' }

export default async function AdminSubmissionsPage() {
  const submissions = await getStorySubmissions()
  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Заявки на рассказы</h1>
        <span className={styles.count}>{submissions.length} файлов</span>
      </header>
      <p className={styles.note}>Рукописи, загруженные через форму «Отправить рассказ». Скачайте для проверки или удалите.</p>
      <SubmissionsList submissions={submissions} />
    </section>
  )
}
