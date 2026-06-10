import { Fragment } from 'react'
import Link from 'next/link'
import type { Periodical } from '@/api/periodicals'
import BookCover from './BookCover'
import BookEditionTabs from './BookEditionTabs'
import styles from './PeriodicalView.module.scss'

// A periodical page: one shared page listing every issue as its own anchored
// section (cover, volume/year, contents, authors, print + digital editions).
export default function PeriodicalView({ periodical }: { periodical: Periodical }) {
  return (
    <article className={styles.page}>
      <section className={styles.nav}>
        <nav className={styles.breadcrumbs} aria-label='Breadcrumb'>
          <Link href='/books'>Каталог</Link>
          <span className={styles.separator} aria-hidden='true'>/</span>
          <span aria-current='page'>{periodical.name}</span>
        </nav>
      </section>

      <header className={styles.intro}>
        <h1 className={styles.title}>{periodical.name}</h1>
        {periodical.description && <p className={styles.description}>{periodical.description}</p>}
      </header>

      {periodical.issues.map((issue) => (
        <section key={issue.book.titleId} id={`vol-${issue.volumeNumber}`} className={styles.issue}>
          <div className={styles.issueMain}>
            <BookCover
              coverUrl={issue.book.coverUrl}
              coverBlurDataUrl={issue.book.coverBlurDataUrl}
              bookName={issue.book.name}
              titleId={issue.book.titleId}
            />
            <div className={styles.issueInfo}>
              <p className={styles.volume}>
                Том №{issue.volumeNumber}
                {issue.volumeYear ? ` · ${issue.volumeYear}` : ''}
              </p>
              <h2 className={styles.issueTitle}>{issue.book.name}</h2>
              {issue.book.thesis && <p className={styles.thesis}>{issue.book.thesis}</p>}
              {issue.book.description && <p className={styles.issueDescription}>{issue.book.description}</p>}
            </div>
          </div>

          <BookEditionTabs books={issue.editions} bookName={issue.book.name} />

          {issue.stories.length > 0 && (
            <section className={styles.stories}>
              <h3 className={styles.blockTitle}>Содержание</h3>
              <ol className={styles.storyList}>
                {issue.stories.map((s) => (
                  <li key={s.slug} className={styles.story}>
                    <Link href={`/dino-magazine/${s.slug}`} className={styles.storyLink}>
                      {s.title}
                    </Link>
                    {s.authorName && <span className={styles.storyAuthor}>{s.authorName}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {issue.book.authors.length > 0 && (
            <section className={styles.authors}>
              <h3 className={styles.blockTitle}>Авторы</h3>
              <p className={styles.authorNames}>
                {[...issue.book.authors]
                  .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
                  .map((author, i) => (
                    <Fragment key={author.id}>
                      {i > 0 && ', '}
                      <Link href={`/authors/${author.id}`} className={styles.authorLink}>
                        {author.name}
                      </Link>
                    </Fragment>
                  ))}
              </p>
            </section>
          )}
        </section>
      ))}
    </article>
  )
}
