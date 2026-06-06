import type { Metadata } from 'next'
import { getAuditLog } from '@/api/admin/audit'
import { formatOrderDate } from '@/lib/orderDisplay'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Журнал' }

export default async function AdminAuditPage() {
  const entries = await getAuditLog(200)
  return (
    <section className={styles.page}>
      <AdminPageHeader title='Журнал действий' />
      <p className={styles.note}>Изменения заказов и удаления, выполненные через админ-панель.</p>

      {entries.length === 0 ? (
        <p className={styles.empty}>Журнал пуст.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Когда</th>
                <th>Кто</th>
                <th>Действие</th>
                <th>Объект</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className={styles.muted}>{formatOrderDate(e.createdAt)}</td>
                  <td className={styles.muted}>{e.actorEmail ?? '—'}</td>
                  <td>{e.summary}</td>
                  <td className={styles.muted}>{e.entityType} #{e.entityId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
