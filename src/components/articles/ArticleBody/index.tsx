import Image from 'next/image'
import type { ContentBlock } from '@/entities/article/client'
import styles from './ArticleBody.module.scss'

type Props = {
  blocks: ContentBlock[]
}

export default function ArticleBody({ blocks }: Props) {
  return (
    <div className={styles.body}>
      {blocks.map((block, index) => {
        if (block.kind === 'paragraph') {
          return (
            <p key={index} className={styles.paragraph}>
              {block.text}
            </p>
          )
        }
        if (block.kind === 'image' && block.imageUrl) {
          return (
            <figure key={index} className={styles.figure}>
              <div className={styles.imageWrap}>
                <Image
                  src={block.imageUrl}
                  alt={block.caption ?? ''}
                  width={1200}
                  height={800}
                  className={styles.image}
                  sizes='(max-width: 1199px) 100vw, 1200px'
                />
                {block.caption && (
                  <figcaption className={styles.caption}>{block.caption}</figcaption>
                )}
              </div>
            </figure>
          )
        }
        return null
      })}
    </div>
  )
}
