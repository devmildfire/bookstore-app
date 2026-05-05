import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Button from '@/components/common/Button'
import { logoutAction } from '@/lib/auth/actions'
import styles from './page.module.scss'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    redirect('/auth/login')
  }

  return (
    <div className={styles.page}>
      <h1>Аккаунт</h1>

      <div className={styles.section}>
        <h2>Профиль</h2>
        <p className={styles.email}>{user.email}</p>
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
