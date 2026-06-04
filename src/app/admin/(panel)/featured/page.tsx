import type { Metadata } from 'next'
import { getFeaturedTitles } from '@/api/admin/featured'
import { getTitleOptions } from '@/api/admin/boxSets'
import { FeaturedManager } from '@/components/admin/featured'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'На главной' }

export default async function AdminFeaturedPage() {
  const [featured, titleOptions] = await Promise.all([getFeaturedTitles(), getTitleOptions()])
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Рекомендованные книги</h1>
      <p className={styles.note}>Книги в этом списке показываются в слайдере на главной странице, в указанном порядке.</p>
      <FeaturedManager featured={featured} titleOptions={titleOptions} />
    </section>
  )
}
