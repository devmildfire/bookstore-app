import styles from './ArticleHeader.module.scss'

type Props = {
  title: string
  authorName: string
}

export default function ArticleHeader({ title, authorName }: Props) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.author}>{authorName}</p>
    </header>
  )
}
