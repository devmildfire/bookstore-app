import Link from 'next/link'
import type { Periodical } from '@/api/periodicals/getPeriodical'
import BookEditionTabs from './BookEditionTabs'
import Numero from './Numero'
import PeriodicalIssueMain from './PeriodicalIssueMain'
import styles from './PeriodicalView.module.scss'

const pluralAuthors = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'автор' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'автора' : 'авторов')
const pluralStories = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'рассказ' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'рассказа' : 'рассказов')

// A periodical page: the series lede once at the top, then every issue as its
// own anchored section — numero masthead, cover + contents, and edition tabs.
export default function PeriodicalView({ periodical }: { periodical: Periodical }) {
  return (
    <article className={styles.page}>
      <nav className={styles.crumbs} aria-label='Breadcrumb'>
        <Link href='/'>Каталог</Link>
        <span className={styles.sep} aria-hidden='true'>/</span>
        <span aria-current='page'>{periodical.name}</span>
      </nav>

      <header className={styles.intro}>
        <p className={styles.kicker}>Периодика</p>
        <h1 className={styles.title}>{periodical.name}</h1>
        {periodical.thesis && <p className={styles.thesis}>«{periodical.thesis}»</p>}
        {periodical.description && <p className={styles.desc}>{periodical.description}</p>}
      </header>

      {periodical.issues.map((issue) => {
        const authorCount = issue.book.authors.length
        const storyCount = issue.stories.length
        return (
          <section key={issue.book.titleId} id={`vol-${issue.volumeNumber}`} className={styles.issue}>
            <div className={styles.volHead}>
              <Numero n={issue.volumeNumber} className={styles.volBignum} />
              <div className={styles.volMeta}>
                {issue.volumeYear && <span className={styles.volYear}>{issue.volumeYear}</span>}
                {(storyCount > 0 || authorCount > 0) && (
                  <span className={styles.volSub}>
                    {storyCount > 0 && `${storyCount} ${pluralStories(storyCount)}`}
                    {storyCount > 0 && authorCount > 0 && ' · '}
                    {authorCount > 0 && `${authorCount} ${pluralAuthors(authorCount)}`}
                  </span>
                )}
              </div>
            </div>

            <PeriodicalIssueMain issue={issue} />

            <BookEditionTabs books={issue.editions} editionPhotos={issue.editionPhotos} bookName={issue.book.name} />
          </section>
        )
      })}
    </article>
  )
}
