'use client'

import type { FormEvent } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import styles from './SearchBar.module.scss'

type Props = {
  initialValue: string
}

export default function SearchBar({ initialValue }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('q') ?? '').trim()
    const params = new URLSearchParams(searchParams.toString())

    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }

    params.delete('page')
    const serialized = params.toString()
    router.push(`${pathname}${serialized ? `?${serialized}` : ''}`)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} role='search'>
      <Input
        name='q'
        type='search'
        label='Поиск'
        placeholder='Название или автор'
        defaultValue={initialValue}
        className={styles.input}
      />
      <Button type='submit' variant='primary'>
        Найти
      </Button>
    </form>
  )
}
