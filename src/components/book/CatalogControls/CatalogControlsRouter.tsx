'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { BookFilters, BookSort } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'
import CatalogControls, { type CatalogFilterDraft } from './CatalogControls'

type Props = {
  filters: BookFilters
  categories: ProductCategory[]
  authors: string[]
  years: string[]
  className?: string
}

export default function CatalogControlsRouter({ filters, categories, authors, years, className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function applyFilters(draft: CatalogFilterDraft) {
    const params = getWritableParams(searchParams)

    setRepeatedParam(params, 'type', draft.categories)
    params.delete('category')
    setRepeatedParam(params, 'author', draft.authors)
    setRepeatedParam(params, 'year', draft.years)
    params.delete('page')
    params.delete('limit')

    pushParams(pathname, params, router.push)
  }

  function updateSort(sort: BookSort) {
    const params = getWritableParams(searchParams)

    params.set('sort', sort)
    params.delete('page')
    params.delete('limit')

    pushParams(pathname, params, router.push)
  }

  return (
    <CatalogControls
      filters={filters}
      categories={categories}
      authors={authors}
      years={years}
      onApplyFilters={applyFilters}
      onSortChange={updateSort}
      className={className}
    />
  )
}

function getWritableParams(searchParams: ReturnType<typeof useSearchParams>): URLSearchParams {
  return new URLSearchParams(searchParams.toString())
}

function setRepeatedParam(params: URLSearchParams, name: string, values: string[]) {
  params.delete(name)
  values.forEach((value) => params.append(name, value))
}

function pushParams(pathname: string, params: URLSearchParams, push: (href: string, options?: { scroll?: boolean }) => void) {
  const serialized = params.toString()
  push(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false })
}
