import type { Metadata } from 'next'
import { getStorySubmissions } from '@/api/admin/submissions'
import { SubmissionsList } from '@/components/admin/submissions'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Заявки' }

export default async function AdminSubmissionsPage() {
  const submissions = await getStorySubmissions()
  return (
    <section className={styles.page}>
      <AdminPageHeader title='Заявки на рассказы' count={`${submissions.length} файлов`} />
      <p className={styles.note}>Рукописи, загруженные через форму «Отправить рассказ». Скачайте для проверки или удалите.</p>
      <SubmissionsList submissions={submissions} />
    </section>
  )
}
