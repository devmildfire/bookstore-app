'use client'

import Image from 'next/image'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { $isImageNode } from './ImageNode'
import { getArticleImageUrl } from '@/lib/storage'
import styles from './ArticleImageView.module.scss'

type Props = { path: string; caption: string | null; nodeKey: string }

export default function ArticleImageView({ path, caption, nodeKey }: Props) {
  const [editor] = useLexicalComposerContext()
  const url = getArticleImageUrl(path)

  function remove() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) node.remove()
    })
  }

  function onCaption(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) node.setCaption(value.trim() ? value : null)
    })
  }

  return (
    <div className={styles.wrap} contentEditable={false}>
      <div className={styles.imageBox}>
        {url ? (
          <Image src={url} alt={caption ?? ''} fill sizes='320px' className={styles.img} unoptimized />
        ) : (
          <span className={styles.placeholder} aria-hidden />
        )}
        <button type='button' className={styles.remove} onClick={remove} aria-label='Убрать картинку'>
          ✕
        </button>
      </div>
      <input
        className={styles.caption}
        defaultValue={caption ?? ''}
        onChange={onCaption}
        placeholder='Подпись к картинке'
      />
    </div>
  )
}
