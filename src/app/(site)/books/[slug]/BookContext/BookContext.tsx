import type { BookContext as BookContextItem } from '@/entities/book/client'
import ContextArrowIcon from './ContextArrowIcon'
import styles from './BookContext.module.scss'

type Props = { contexts: BookContextItem[] }

/**
 * "КОНТЕКСТ" — supplementary materials (interviews, articles, events, trivia)
 * tied to the book. Each item is a row with a heading + body paragraph and an
 * optional external-link icon on the right. Hovering the heading or icon
 * tints the icon red.
 */
export default function BookContext({ contexts }: Props) {
  if (contexts.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="context-title">
      <h2 id="context-title" className={styles.sectionTitle}>
        Контекст
      </h2>

      <ul className={styles.list}>
        {contexts.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.header}>
              <h3 className={styles.heading}>{item.heading}</h3>
              {item.url && (
                <a
                  className={styles.iconLink}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ContextArrowIcon className={styles.icon} />
                </a>
              )}
            </div>
            <p className={styles.body}>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
