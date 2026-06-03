import type { ReactNode } from 'react'
import DinoBook from '@/assets/icons/dino-book.svg'
import styles from './PageHero.module.scss'

// The Чтиво diamond mark, tinted red, used in the hero eyebrow.
function DiamondMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 119 26' fill='none' aria-hidden>
      <path d='M47 18.5L35.5 12.5L24 18.5L24 6.5L35.5 1e-6L47 6.5L47 18.5Z' fill='#930000' />
      <path d='M95 18.5L83.5 12.5L72 18.5L72 6.5L83.5 1e-6L95 6.5L95 18.5Z' fill='#A10202' />
      <path d='M48 7L59.5 13L71 7V19L59.5 25.5L48 19V7Z' fill='#930000' />
      <path d='M96 7L107.5 13L119 7V19L107.5 25.5L96 19V7Z' fill='#A10202' />
      <path d='M0 7L11.5 13L23 7V19L11.5 25.5L0 19V7Z' fill='#930000' />
    </svg>
  )
}

type PageHeroProps = {
  /** Small uppercase line above the title, next to the diamond mark. */
  eyebrow: string
  /** The H1 — accepts line breaks / markup. */
  title: ReactNode
  /** The lead paragraph — accepts `<em>` etc. */
  lead: ReactNode
}

/**
 * The shared editorial page hero: a two-column grid with an eyebrow + display
 * H1 + lead on the left and the Русский Динозавр mascot (white line art over a
 * red glow) on the right. Collapses to a single column (illustration first)
 * ≤920px. Used by the Investors and Contacts pages. Side gutters come from the
 * `--gx` fluid-gutter variable, which the page root sets.
 */
export default function PageHero({ eyebrow, title, lead }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroIn}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>
            <DiamondMark className={styles.diamond} />
            {eyebrow}
          </span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{lead}</p>
        </div>

        <div className={styles.heroArt}>
          <span className={styles.glow} aria-hidden />
          <span className={styles.dino} aria-hidden>
            <DinoBook />
          </span>
        </div>
      </div>
    </section>
  )
}
