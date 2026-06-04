import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminSubscription } from '@/api/admin/subscriptions'
import { uploadSubscriptionImageAction } from '@/lib/admin/subscriptions/actions'
import ImageUploader from '@/components/admin/ImageUploader'
import { SubscriptionEditForm } from '@/components/admin/subscriptions'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Подписка' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminSubscriptionEditPage({ params }: Props) {
  const { id } = await params
  const subId = Number(id)
  if (!Number.isInteger(subId) || subId <= 0) notFound()

  const subscription = await getAdminSubscription(subId)
  if (!subscription) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/subscriptions'>← Все подписки</Link>
      </div>
      <h1 className={styles.title}>{subscription.name}</h1>

      <div className={styles.layout}>
        <aside className={styles.side}>
          <h2 className={styles.sideTitle}>Картинка</h2>
          <ImageUploader
            initialUrl={subscription.imageUrl}
            action={uploadSubscriptionImageAction}
            fields={{ subscriptionId: String(subscription.id) }}
            aspect='square'
            label={`Подписка: ${subscription.name}`}
          />
        </aside>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Данные</h2>
            <SubscriptionEditForm subscription={subscription} />
          </section>
        </div>
      </div>
    </section>
  )
}
