import type { Metadata } from 'next'
import Link from 'next/link'
import { MemberCreateForm } from '@/components/admin/team'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новый участник' }

export default function AdminTeamCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/team'>← Вся команда</Link>
      </div>
      <h1 className={styles.title}>Новый участник</h1>
      <MemberCreateForm />
    </section>
  )
}
