'use client'

import { useRef, useState, useTransition } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { $createParagraphNode, $createTextNode, $getRoot, type EditorState } from 'lexical'
import { ImageNode, $createImageNode, $isImageNode } from './lexical/ImageNode'
import { uploadArticleContentImageAction } from '@/lib/admin/articles/actions'
import { coerceBlocks, type ContentBlock } from '@/lib/admin/articleContent'
import styles from './ArticleContentEditor.module.scss'

type Props = { articleId: number; initialContent: unknown }

// Build the initial editor state from content_blocks.
function initStateFn(blocks: ContentBlock[]) {
  return () => {
    const root = $getRoot()
    if (root.getFirstChild()) return
    for (const b of blocks) {
      if (b.kind === 'paragraph') {
        const p = $createParagraphNode()
        if (b.text) p.append($createTextNode(b.text))
        root.append(p)
      } else {
        root.append($createImageNode(b.path, b.caption))
      }
    }
    if (!root.getFirstChild()) root.append($createParagraphNode())
  }
}

// Read the editor back into content_blocks (paragraphs + images, in order).
function stateToBlocks(state: EditorState): ContentBlock[] {
  return state.read(() => {
    const out: ContentBlock[] = []
    for (const child of $getRoot().getChildren()) {
      if ($isImageNode(child)) {
        out.push({ kind: 'image', path: child.getPath(), caption: child.getCaption() })
      } else {
        const text = child.getTextContent()
        if (text.trim()) out.push({ kind: 'paragraph', text })
      }
    }
    return out
  })
}

export default function ArticleContentEditor({ articleId, initialContent }: Props) {
  const blocks = coerceBlocks(initialContent)
  const [json, setJson] = useState(() => JSON.stringify(blocks))

  return (
    <div className={styles.wrap}>
      <LexicalComposer
        initialConfig={{
          namespace: 'article-content',
          nodes: [ImageNode],
          editorState: initStateFn(blocks),
          theme: { paragraph: styles.paragraph },
          onError: (e) => console.error('[lexical]', e),
        }}
      >
        <ImageToolbar articleId={articleId} />
        <div className={styles.editorBox}>
          <RichTextPlugin
            contentEditable={<ContentEditable className={styles.editable} />}
            placeholder={<div className={styles.placeholder}>Текст статьи…</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <OnChangePlugin onChange={(state) => setJson(JSON.stringify(stateToBlocks(state)))} />
      </LexicalComposer>
      <input type='hidden' name='content' value={json} />
    </div>
  )
}

function ImageToolbar({ articleId }: { articleId: number }) {
  const [editor] = useLexicalComposerContext()
  const [busy, startUpload] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setError(null)
      startUpload(async () => {
        const fd = new FormData()
        fd.set('articleId', String(articleId))
        fd.set('file', file)
        const res = await uploadArticleContentImageAction(fd)
        if (res.status === 'error') {
          setError(res.message)
          return
        }
        editor.update(() => {
          $insertNodeToNearestRoot($createImageNode(res.path, null))
        })
      })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className={styles.toolbar}>
      <input
        ref={fileRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        onChange={handleFile}
        className={styles.fileInput}
        disabled={busy}
      />
      <button type='button' className={styles.imageButton} onClick={() => fileRef.current?.click()} disabled={busy}>
        {busy ? 'Загрузка…' : '+ Картинка'}
      </button>
      <span className={styles.toolbarHint}>Картинка вставляется в место курсора.</span>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
