'use client'

import dynamic from 'next/dynamic'
import useInView from '@/hooks/useInView'
import type { BoxSet, BoxSetBook } from '@/entities/boxSet/client'
import styles from './BoxSetsSection.module.scss'

// ssr:false → the body's JS chunk, images and DOM are NOT in the initial document
// or the LCP window; they mount only once the section approaches the viewport.
const BoxSetsBody = dynamic(() => import('./BoxSetsBody'), { ssr: false })

type Props = {
  boxSets: BoxSet[]
  booksMap: Record<number, BoxSetBook[]>
}

export default function DeferredBoxSets({ boxSets, booksMap }: Props) {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section
      ref={ref}
      className={styles.section}
      // Reserve space until mounted so the page height (and below content) doesn't jump.
      style={inView ? undefined : { minHeight: 640 }}
    >
      {inView && <BoxSetsBody boxSets={boxSets} booksMap={booksMap} />}
    </section>
  )
}
