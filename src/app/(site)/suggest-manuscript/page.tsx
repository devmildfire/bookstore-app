import type { Metadata } from 'next'
import AuthorsSidebar from '@/components/authors/AuthorsSidebar'
import { DigitalIcon, AudioIcon, PrintIcon } from './FormatIcons'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Отправить рукопись',
  description: 'Отправьте свою рукопись для рассмотрения Советом Чтива.',
}

export default function SuggestManuscriptPage() {
  return (
    <div className={styles.page}>
      <AuthorsSidebar active='manuscript' />

      <div className={styles.main}>
        <h1 className={styles.title}>Уважаемые авторы</h1>

        <p className={styles.intro}>
          Здесь вы можете отправить свою рукопись для рассмотрения Советом Чтива.
          <br />
          Заключаем только эксклюзивные контракты.
        </p>

        <p className={styles.royalty}>
          Мы предлагаем роялти 50% от всех чистых доходов с продаж всех изданий авторского текста:
        </p>

        <div className={styles.formats}>
          <div className={styles.format}>
            <DigitalIcon className={styles.formatIcon} />
            <span className={styles.formatLabel}>Цифровое</span>
          </div>
          <div className={styles.format}>
            <AudioIcon className={styles.formatIcon} />
            <span className={styles.formatLabel}>Аудио</span>
          </div>
          <div className={styles.format}>
            <PrintIcon className={styles.formatIcon} />
            <span className={styles.formatLabel}>Печатное</span>
          </div>
        </div>

        <h2 className={styles.sectionHeading}>Требования к рукописи:</h2>

        <ul className={styles.requirements}>
          <li className={styles.requirement}>Художественная литература</li>
          <li className={styles.requirement}>Роман/сборник произведений</li>
          <li className={styles.requirement}>Минимум 50% текста должны быть нигде не опубликованы (в том числе в интернете)</li>
          <li className={styles.requirement}>Формат doc/docx</li>
        </ul>

        <p className={styles.note}>Рукописи не рецензируются.</p>

        <p className={styles.email}>
          Отправить рукопись можно на почту{' '}
          <a href='mailto:info@chtivo.spb.ru' className={styles.emailLink}>info@chtivo.spb.ru</a>
        </p>

        <h2 className={styles.tailHeading}>Верим в вас</h2>

        <p className={styles.tail}>
          Также рассматриваем отдельные рассказы (в том числе статьи и эссе) для публикации в{' '}
          <span className={styles.tailRed}>литжурнале Русского Динозавра</span>
        </p>
      </div>
    </div>
  )
}
