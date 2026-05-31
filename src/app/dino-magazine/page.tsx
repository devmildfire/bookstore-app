import type { Metadata } from 'next'
import DinoMagazineHero from '@/components/articles/DinoMagazineHero'
import ArticlesFeed from '@/components/articles/ArticlesFeed'
import { getArticlesPage } from '@/api/articles/getArticlesPage'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Литжурнал Русского Динозавра',
  description: 'Рассказы, эссе и литература современных авторов Чтива.',
  openGraph: {
    title: 'Литжурнал Русского Динозавра',
    description: 'Рассказы, эссе и литература современных авторов Чтива.',
  },
}

export default async function DinoMagazinePage() {
  const initialPage = await getArticlesPage(null)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <DinoMagazineHero />
        <ArticlesFeed initialPage={initialPage} />
      </div>
    </div>
  )
}
