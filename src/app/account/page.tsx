'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import useSupabaseUser from '@/hooks/useSupabaseUser'
import Button from '@/components/common/Button'
import { logoutAction } from '@/lib/auth/actions'
import styles from './page.module.scss'

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading, isAnonymous } = useSupabaseUser()

  useEffect(() => {
    if (!isLoading && isAnonymous) {
      router.push('/auth/login')
    }
  }, [isLoading, isAnonymous, router])

  if (isLoading || isAnonymous) {
    return (
      <div className={styles.page}>
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1>Аккаунт</h1>

      <div className={styles.section}>
        <h2>Профиль</h2>
        <p className={styles.email}>{user?.email}</p>
      </div>

      <div className={styles.section}>
        <h2>История заказов</h2>
        <p className={styles.empty}>У вас пока нет заказов.</p>
        <Link href='/books'>
          <Button variant='primary'>Перейти в каталог</Button>
        </Link>
      </div>

      <form action={logoutAction}>
        <Button variant='secondary' type='submit'>
          Выйти
        </Button>
      </form>
    </div>
  )
}
