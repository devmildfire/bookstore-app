'use client'

import dynamic from 'next/dynamic'
import useInView from '@/hooks/useInView'
import type { BoxSet, BoxSetBook } from '@/entities/boxSet/client'

// ssr:false → the body's JS chunk, images, DOM **and CSS** are NOT in the initial
// document or the LCP window; they mount only once the section nears the viewport.
// The placeholder deliberately imports NO SCSS module — importing the section's
// stylesheet here (even just for a class) would drag its CSS back into the eager,
// render-blocking bundle. It carries only an inline min-height to reserve space.
const BoxSetsBody = dynamic(() => import('./BoxSetsBody'), { ssr: false })

type Props = {
  boxSets: BoxSet[]
  booksMap: Record<number, BoxSetBook[]>
}

export default function DeferredBoxSets({ boxSets, booksMap }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      // width/align-self replicate the section's full-bleed so the placeholder spans full width
      // in both block (home) and flex (book detail) parents; min-height reserves space pre-mount.
      style={{ width: '100%', alignSelf: 'stretch', minHeight: inView ? undefined : 640 }}
    >
      {inView && <BoxSetsBody boxSets={boxSets} booksMap={booksMap} />}
    </div>
  )
}
