'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import Button from '@/components/common/Button'
import useSupabaseUser from '@/hooks/useSupabaseUser'
import { logoutAction } from '@/lib/auth/actions'
import styles from './Header.module.scss'

type Props = {
  cartItemCount?: number
}

export default function Header({ cartItemCount = 0 }: Props) {
  const pathname = usePathname()
  const { isAnonymous, isLoading } = useSupabaseUser()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href='/books' className={styles.logo}>
          Книжный
        </Link>

        <nav className={styles.nav} aria-label='Основная навигация'>
          <Link href='/books' className={cn(styles.navLink, { [styles.active]: pathname.startsWith('/books') })}>
            Каталог
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link href='/cart' className={styles.cartLink} aria-label={`Корзина, ${cartItemCount} товаров`}>
            <svg width='22' height='22' viewBox='0 0 22 22' fill='none' aria-hidden>
              <path
                d='M1 1H3.5L5.5 13H16.5L18.5 5H5'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <circle cx='8' cy='17' r='1.5' fill='currentColor' />
              <circle cx='15' cy='17' r='1.5' fill='currentColor' />
            </svg>
            {cartItemCount > 0 && (
              <span className={styles.cartBadge} aria-hidden>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>

          {!isLoading && (
            <>
              {isAnonymous ? (
                <Link href='/auth/login' className={styles.loginLink}>
                  Войти
                </Link>
              ) : (
                <div className={styles.authGroup}>
                  <Link href='/account' className={cn(styles.navLink, { [styles.active]: pathname === '/account' })}>
                    Аккаунт
                  </Link>
                  <form action={logoutAction}>
                    <Button variant='ghost' size='sm' type='submit'>
                      Выйти
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
