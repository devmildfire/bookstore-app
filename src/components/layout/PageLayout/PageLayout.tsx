import type { ReactNode } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import styles from './PageLayout.module.scss'

type Props = {
  children: ReactNode
}

export default function PageLayout({ children }: Props) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  )
}
