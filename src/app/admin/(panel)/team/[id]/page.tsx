import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminTeamMember } from '@/api/admin/team'
import { MemberEditForm } from '@/components/admin/team'
import ImageUploader from '@/components/admin/ImageUploader'
import { uploadTeamPhotoAction } from '@/lib/admin/team/actions'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Участник' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminTeamEditPage({ params }: Props) {
  const { id } = await params
  const memberId = Number(id)
  if (!Number.isInteger(memberId) || memberId <= 0) notFound()

  const member = await getAdminTeamMember(memberId)
  if (!member) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/team'>← Вся команда</Link>
      </div>

      <h1 className={styles.title}>{member.name}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Участник</h2>
        <MemberEditForm member={member} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Фото</h2>
        <p className={styles.sectionNote}>
          Квадратное фото в цвете. PNG, JPEG или WEBP. На странице «О Чтиве» показывается ч/б, в цвете — при наведении.
        </p>
        <ImageUploader
          initialUrl={member.photoUrl}
          action={uploadTeamPhotoAction}
          fields={{ memberId: String(member.id) }}
          aspect='square'
          accept='image/png,image/jpeg,image/webp'
        />
      </section>
    </section>
  )
}
