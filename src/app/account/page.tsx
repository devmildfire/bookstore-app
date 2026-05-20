import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Button from '@/components/common/Button'
import OrdersList from '@/components/account/OrdersList'
import AnonRecoveryBanner from '@/components/account/AnonRecoveryBanner'
import AccountPostCheckoutModal from './AccountPostCheckoutModal'
import { logoutAction } from '@/lib/auth/actions'
import styles from './page.module.scss'

type Props = {
  searchParams: Promise<{ from?: string; order?: string }>
}

export default async function AccountPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  // Edge case: visitor has no Supabase session at all (anon signin hasn't
  // completed yet, or cookies were cleared). Send them to login so they
  // can either sign in or fall back to the guest flow — but if they
  // arrived here straight from checkout, the redirect would lose the
  // order context, so we just bail to /books in that case.
  if (!user) {
    if (params.from === 'checkout') redirect('/books')
    redirect('/auth/login?returnTo=/account')
  }

  const isAnon = user.is_anonymous === true
  const fromCheckout = params.from === 'checkout'
  const highlightOrderId = params.order ? Number(params.order) : undefined
  const showRecoveryModal = isAnon && fromCheckout

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{isAnon ? 'Ваши покупки' : 'Аккаунт'}</h1>

      {isAnon && <AnonRecoveryBanner />}

      {!isAnon && (
        <div className={styles.section}>
          <h2>Профиль</h2>
          <p className={styles.email}>{user.email}</p>
        </div>
      )}

      <div className={styles.section}>
        <h2>История заказов</h2>
        <OrdersList highlightOrderId={highlightOrderId} />
      </div>

      {!isAnon && (
        <form action={logoutAction}>
          <Button variant='secondary' type='submit'>
            Выйти
          </Button>
        </form>
      )}

      {showRecoveryModal && <AccountPostCheckoutModal />}
    </div>
  )
}
