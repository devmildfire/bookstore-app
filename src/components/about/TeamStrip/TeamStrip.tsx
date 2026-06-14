import Marquee from '@/components/about/Marquee'
import TeamMemberCard from './TeamMemberCard'
import type { TeamMember } from '@/entities/worker'
import styles from './TeamStrip.module.scss'

type Props = {
  team: TeamMember[]
}

export default function TeamStrip({ team }: Props) {
  if (team.length === 0) return null

  return (
    <section className={styles.wrapper} aria-labelledby='team-heading'>
      <h2 id='team-heading' className={styles.heading}>
        Мы
      </h2>
      <Marquee speed={70} ariaLabel='Команда Чтива' className={styles.marquee} itemClassName={styles.row}>
        {team.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </Marquee>
    </section>
  )
}
