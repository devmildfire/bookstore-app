export type ArticleAuthor = {
  id: number
  name: string
  photoUrl: string | null
  photoBlurDataUrl: string | null
  bio: string | null
  birthDate: string | null
  city: string | null
}

export type ParagraphBlock = { kind: 'paragraph'; text: string }
export type ImageBlock = {
  kind: 'image'
  path: string | null
  imageUrl: string | null
  caption: string | null
}
export type ContentBlock = ParagraphBlock | ImageBlock

export type Article = {
  id: number
  slug: string
  title: string
  coverUrl: string | null
  coverBlurDataUrl: string | null
  coverWidth: number | null
  coverHeight: number | null
  excerpt: string | null
  publishedAt: string
  author: ArticleAuthor
  contentBlocks: ContentBlock[]
}

// Slimmed shape for cards / carousel slides — drops the body and the
// full author bio. The masonry index and carousel only need this.
export type ArticleSummary = Omit<Article, 'contentBlocks' | 'author'> & {
  author: Pick<ArticleAuthor, 'id' | 'name'>
}
