import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleHeader from '@/components/articles/ArticleHeader'
import ArticleBody from '@/components/articles/ArticleBody'
import ArticleAuthorCard from '@/components/articles/ArticleAuthorCard'
import ArticleCarousel from '@/components/articles/ArticleCarousel'
import AuthorBooksRow from '@/components/articles/AuthorBooksRow'
import { getArticleBySlug } from '@/api/articles/getArticleBySlug'
import { getAuthorBooks } from '@/api/articles/getAuthorBooks'
import { getMoreArticlesForAuthor } from '@/api/articles/getMoreArticlesForAuthor'
import styles from './page.module.scss'
import { getAbsoluteSiteUrl, socialMeta } from '@/lib/socialCards/cardTypes'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Статья не найдена' }
  return {
    title: `${article.title} | ${article.author.name}`,
    description: article.excerpt ?? undefined,
    ...socialMeta({
      kind: 'article',
      target: article.slug,
      type: 'article',
      url: getAbsoluteSiteUrl(`/dino-magazine/${article.slug}`),
      title: article.title,
      description: article.excerpt ?? undefined,
      imageAlt: `${article.title} — ${article.author.name}`,
    }),
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const [moreArticles, authorBooks] = await Promise.all([
    getMoreArticlesForAuthor(article.author.id, article.id),
    getAuthorBooks(article.author.id),
  ])

  return (
    <article className={styles.page}>
      <ArticleHeader title={article.title} authorName={article.author.name} />
      <ArticleBody blocks={article.contentBlocks} />
      <ArticleAuthorCard author={article.author} />
      <ArticleCarousel items={moreArticles} />
      <AuthorBooksRow books={authorBooks} />
    </article>
  )
}
