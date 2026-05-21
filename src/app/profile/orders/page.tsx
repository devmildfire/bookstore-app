import OrdersList from '@/components/profile/OrdersList'
import styles from './page.module.scss'

type Props = {
  searchParams: Promise<{ order?: string }>
}

export default async function ProfileOrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const highlightOrderId = params.order ? Number(params.order) : undefined

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Мои книги</h2>
      <OrdersList highlightOrderId={highlightOrderId} />
    </section>
  )
}
