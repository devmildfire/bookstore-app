'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Select from '@/components/common/Select'
import type { BookSort } from '@/entities/book/client'
import styles from './SortingControls.module.scss'

type Props = {
  value: BookSort
}

const sortOptions = [
  { value: 'year-desc', label: 'Сначала новые' },
  { value: 'year-asc', label: 'Сначала старые' },
  { value: 'author-asc', label: 'Автор А-Я' },
  { value: 'author-desc', label: 'Автор Я-А' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
]

export default function SortingControls({ value }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateSort(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', nextValue)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={styles.wrapper}>
      <Select label='Сортировка' value={value} onValueChange={updateSort} options={sortOptions} />
    </div>
  )
}
