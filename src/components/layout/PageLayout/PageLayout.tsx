import type { ReactNode } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import styles from './PageLayout.module.scss'

type Props = {
  children: ReactNode
  cartItemCount?: number
}

export default function PageLayout({ children, cartItemCount }: Props) {
  return (
    <div className={styles.layout}>
      <Header cartItemCount={cartItemCount} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  )
}
