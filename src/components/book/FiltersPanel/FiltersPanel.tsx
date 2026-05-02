'use client'

import type { FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import type { BookFilters } from '@/entities/book/client'
import { getProductCategoryLabel } from '@/entities/book/labels'
import type { ProductCategory } from '@/types/database'
import styles from './FiltersPanel.module.scss'

type Props = {
  filters: BookFilters
  categories: ProductCategory[]
  authors: string[]
}

export default function FiltersPanel({ filters, categories, authors }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' || value === '') {
      params.delete(name)
    } else {
      params.set(name, value)
    }

    params.delete('page')
    const serialized = params.toString()
    router.push(`${pathname}${serialized ? `?${serialized}` : ''}`)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const params = new URLSearchParams(searchParams.toString())

    setOptionalParam(params, 'priceFrom', String(formData.get('priceFrom') ?? '').trim())
    setOptionalParam(params, 'priceTo', String(formData.get('priceTo') ?? '').trim())
    params.delete('page')

    const serialized = params.toString()
    router.push(`${pathname}${serialized ? `?${serialized}` : ''}`)
  }

  return (
    <aside className={styles.panel} aria-label='Фильтры каталога'>
      <div className={styles.header}>
        <h2>Фильтры</h2>
        <Link href='/books' className={styles.resetLink}>
          Сбросить
        </Link>
      </div>

      <Select
        label='Категория'
        value={filters.category}
        onValueChange={(value) => updateParam('category', value)}
        options={[
          { value: 'all', label: 'Все категории' },
          ...categories.map((category) => ({
            value: category,
            label: getProductCategoryLabel(category),
          })),
        ]}
      />

      <Select
        label='Автор'
        value={filters.author || 'all'}
        onValueChange={(value) => updateParam('author', value)}
        options={[
          { value: 'all', label: 'Все авторы' },
          ...authors.map((author) => ({
            value: author,
            label: author,
          })),
        ]}
      />

      <form className={styles.priceForm} onSubmit={handleSubmit}>
        <Input
          name='priceFrom'
          type='number'
          min={0}
          step={1}
          label='Цена от'
          defaultValue={filters.priceFrom ?? ''}
        />
        <Input
          name='priceTo'
          type='number'
          min={0}
          step={1}
          label='Цена до'
          defaultValue={filters.priceTo ?? ''}
        />
        <Button type='submit' variant='secondary'>
          Применить
        </Button>
      </form>
    </aside>
  )
}

function setOptionalParam(params: URLSearchParams, name: string, value: string) {
  if (value) {
    params.set(name, value)
  } else {
    params.delete(name)
  }
}
