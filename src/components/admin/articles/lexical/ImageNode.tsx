import { DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from 'lexical'
import type { ReactNode } from 'react'
import ArticleImageView from './ArticleImageView'

export type SerializedImageNode = Spread<{ path: string; caption: string | null }, SerializedLexicalNode>

// A block-level decorator node holding a content image (path in the `articles`
// bucket + optional caption). Serializes to the article's content_blocks shape.
export class ImageNode extends DecoratorNode<ReactNode> {
  __path: string
  __caption: string | null

  static getType(): string {
    return 'article-image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__path, node.__caption, node.__key)
  }

  constructor(path: string, caption: string | null, key?: NodeKey) {
    super(key)
    this.__path = path
    this.__caption = caption
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return $createImageNode(json.path, json.caption ?? null)
  }

  exportJSON(): SerializedImageNode {
    return { ...super.exportJSON(), type: 'article-image', version: 1, path: this.__path, caption: this.__caption }
  }

  createDOM(): HTMLElement {
    return document.createElement('div')
  }

  updateDOM(): false {
    return false
  }

  isInline(): boolean {
    return false
  }

  getPath(): string {
    return this.getLatest().__path
  }

  getCaption(): string | null {
    return this.getLatest().__caption
  }

  setCaption(caption: string | null): void {
    this.getWritable().__caption = caption
  }

  decorate(): ReactNode {
    return <ArticleImageView path={this.__path} caption={this.__caption} nodeKey={this.getKey()} />
  }
}

export function $createImageNode(path: string, caption: string | null): ImageNode {
  return new ImageNode(path, caption)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
