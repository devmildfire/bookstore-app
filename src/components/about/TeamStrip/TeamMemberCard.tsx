import Image from 'next/image'
import TeamPlaceholder from '@/assets/about/team-placeholder.svg'
import type { TeamMember } from '@/entities/worker/client'
import styles from './TeamMemberCard.module.scss'

type Props = {
  member: TeamMember
}

export default function TeamMemberCard({ member }: Props) {
  return (
    <article className={styles.card} aria-label={`${member.name}, ${member.position}`}>
      <div className={styles.avatarWrap}>
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={`Фото: ${member.name}`}
            width={220}
            height={220}
            className={styles.avatar}
            sizes='220px'
            unoptimized
          />
        ) : (
          <TeamPlaceholder className={styles.avatar} aria-hidden='true' />
        )}
      </div>
      <h3 className={styles.name}>{member.name}</h3>
      <p className={styles.position}>{member.position}</p>
      {member.city && <p className={styles.city}>{member.city}</p>}
    </article>
  )
}
