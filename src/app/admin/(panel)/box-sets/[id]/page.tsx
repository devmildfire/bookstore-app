import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminBoxSet, getTitleOptions } from '@/api/admin/boxSets'
import { BoxSetEditForm, BoxSetBooksManager } from '@/components/admin/boxSets'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Бокс-сет' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminBoxSetEditPage({ params }: Props) {
  const { id } = await params
  const boxSetId = Number(id)
  if (!Number.isInteger(boxSetId) || boxSetId <= 0) notFound()

  const [boxSet, titleOptions] = await Promise.all([getAdminBoxSet(boxSetId), getTitleOptions()])
  if (!boxSet) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/box-sets'>← Все бокс-сеты</Link>
      </div>

      <h1 className={styles.title}>{boxSet.name}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Бокс-сет</h2>
        <BoxSetEditForm boxSet={boxSet} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Состав</h2>
        <p className={styles.sectionNote}>Книги, входящие в набор. product_id указывайте, чтобы привязать конкретный продукт книги.</p>
        <BoxSetBooksManager boxSetId={boxSet.id} books={boxSet.books} titleOptions={titleOptions} />
      </section>
    </section>
  )
}
