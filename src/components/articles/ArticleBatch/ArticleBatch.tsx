import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleSummary } from '@/entities/article/client'
import styles from './ArticleBatch.module.scss'

type Props = {
  articles: ArticleSummary[]
  // Each batch lays out its own masonry. The sentinel ref is attached
  // when this is the most recently mounted batch — observed by the
  // parent ArticlesFeed to trigger the next fetch.
  sentinelRef?: React.Ref<HTMLDivElement>
}

// CSS multi-column layout handles column distribution natively and
// responds to viewport breakpoints via media queries — no JS needed.
// Eliminates the CLS that came from JS-driven column count changes
// during hydration (SSR 3 cols → mobile 1 col = massive reflow).

export default function ArticleBatch({ articles, sentinelRef }: Props) {
  const midpoint = Math.max(0, Math.floor(articles.length / 2) - 1)

  return (
    <section className={styles.batch}>
      {articles.map((article, index) => (
        <div key={article.id} className={styles.cell}>
          <ArticleCard article={article} />
          {sentinelRef && index === midpoint && (
            <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          )}
        </div>
      ))}
    </section>
  )
}
