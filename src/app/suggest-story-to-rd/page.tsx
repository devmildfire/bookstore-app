import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AuthorsSidebar from '@/components/authors/AuthorsSidebar'
import StorySubmitButton from '@/components/authors/StorySubmit'
import DinoBook from '@/assets/icons/dino-book.svg'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Отправить рассказ',
  description:
    'Отправьте свой рассказ для публикации в литературном журнале арт-конгрегации «Русский Динозавр».',
}

export default async function SuggestStoryPage() {
  // Resolve auth server-side (tokens-only cookie encoding hides it from the
  // browser client) so the form can tailor its feedback-channel prompt.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAnon = !user || user.is_anonymous === true
  const userEmail = (!isAnon && user?.email) || null

  return (
    <div className={styles.page}>
      <AuthorsSidebar active='story' />

      <div className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.textCol}>
            <h1 className={styles.title}>Отправить рассказ</h1>

            <p className={styles.intro}>
              Мы редактируем, иллюстрируем и публикуем ваши рассказы в литературном
              журнале арт-конгрегации Русский Динозавр — нашего творческого объединения
              мастеров арт-контента. Публикации тиражируются в соцсетях и на партнёрских
              инфоресурсах. Двенадцать избранных рассказов года попадают в ежегодник
              «Могучий Русский Динозавр».
            </p>

            <StorySubmitButton className={styles.cta} isAnon={isAnon} userEmail={userEmail} />
          </div>

          <span className={styles.illustration} aria-hidden>
            <DinoBook />
          </span>
        </div>
      </div>
    </div>
  )
}
