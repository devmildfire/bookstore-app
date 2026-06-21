import type { Metadata } from 'next'
import Image from 'next/image'
import { getArticlesPage } from '@/api/articles/getArticlesPage'
import { getFeaturedBooks } from '@/api/books'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import {
  OPEN_GRAPH_VARIANTS,
  TWITTER_VARIANTS,
  getAbsoluteSiteUrl,
  getSocialPreviewRows,
  type SocialCardKind,
} from '@/lib/socialCards/cardTypes'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Соцкарточки' }

type PreviewTarget = {
  kind: SocialCardKind
  label: string
  pageUrl: string
  target?: string
  title: string
  description: string
}

export default async function AdminSocialCardsPage() {
  const [featuredBooks, articlesPage] = await Promise.all([getFeaturedBooks(), getArticlesPage(null, 1)])
  const firstBook = featuredBooks[0]
  const firstAuthor = firstBook?.authors[0]
  const firstArticle = articlesPage.items[0]

  const targets: PreviewTarget[] = [
    {
      kind: 'home',
      label: 'Главная',
      pageUrl: getAbsoluteSiteUrl('/'),
      title: 'Чтиво — независимое издательство',
      description: 'Книги, которые меняют взгляд на мир.',
    },
    firstBook
      ? {
          kind: 'book',
          label: 'Книга',
          pageUrl: getAbsoluteSiteUrl(`/books/${firstBook.slug}`),
          target: firstBook.slug,
          title: firstBook.name,
          description: firstBook.authorName,
        }
      : {
          kind: 'book',
          label: 'Книга — fallback',
          pageUrl: getAbsoluteSiteUrl('/books/example'),
          target: 'example',
          title: 'Книга Чтиво',
          description: 'Fallback',
        },
    firstAuthor
      ? {
          kind: 'author',
          label: 'Автор',
          pageUrl: getAbsoluteSiteUrl(`/authors/${firstAuthor.id}`),
          target: String(firstAuthor.id),
          title: `${firstAuthor.name} — автор`,
          description: firstAuthor.city ?? 'Автор Чтиво',
        }
      : {
          kind: 'author',
          label: 'Автор — fallback',
          pageUrl: getAbsoluteSiteUrl('/authors/0'),
          target: '0',
          title: 'Автор Чтиво',
          description: 'Fallback',
        },
    firstArticle
      ? {
          kind: 'article',
          label: 'Статья',
          pageUrl: getAbsoluteSiteUrl(`/dino-magazine/${firstArticle.slug}`),
          target: firstArticle.slug,
          title: firstArticle.title,
          description: firstArticle.author.name,
        }
      : {
          kind: 'article',
          label: 'Статья — fallback',
          pageUrl: getAbsoluteSiteUrl('/dino-magazine/example'),
          target: 'example',
          title: 'Статья Чтиво',
          description: 'Fallback',
        },
  ]

  return (
    <section className={styles.page}>
      <AdminPageHeader title='Соцкарточки' count={`${targets.length} страниц`} />
      <p className={styles.note}>Проверка Open Graph, X и Telegram-совместимых изображений.</p>

      {targets.map((target) => {
        return (
          <section key={`${target.kind}-${target.target ?? 'home'}`} className={styles.target}>
            <div className={styles.targetHead}>
              <div>
                <h2 className={styles.targetTitle}>{target.label}</h2>
                <a className={styles.pageLink} href={target.pageUrl} target='_blank' rel='noreferrer'>
                  {target.pageUrl}
                </a>
                <p className={styles.targetDescription}>{target.description}</p>
              </div>
              <div className={styles.metaBox}>
                <span>OG: {OPEN_GRAPH_VARIANTS.length} images</span>
                <span>X: {TWITTER_VARIANTS.length} image</span>
              </div>
            </div>

            <div className={styles.grid}>
              {getSocialPreviewRows(target.kind, target.target).map((variant) => (
                <article key={variant.id} className={styles.card}>
                  <div className={styles.cardMeta}>
                    <h3>{variant.label}</h3>
                    <span>{variant.width}x{variant.height}</span>
                  </div>
                  <Image
                    src={variant.url}
                    alt={`${target.label}: ${variant.label}`}
                    width={variant.width}
                    height={variant.height}
                    className={styles.preview}
                    unoptimized
                  />
                  <a className={styles.url} href={variant.url} target='_blank' rel='noreferrer'>
                    {variant.url}
                  </a>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </section>
  )
}
