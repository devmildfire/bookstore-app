import type { Metadata } from 'next'
import { getTeam } from '@/api/team/getTeam'
import { getPartners } from '@/api/partners/getPartners'
import { getVideoUrl } from '@/lib/storage'
import HeroVideo from '@/components/about/HeroVideo'
import AboutManifestoSection from '@/components/about/AboutManifestoSection'
import EditionTypesSection from '@/components/about/EditionTypesSection'
import JournalSection from '@/components/about/JournalSection'
import TeamStrip from '@/components/about/TeamStrip'
import PartnersStrip from '@/components/about/PartnersStrip'
import DonateForm from '@/components/about/DonateForm'
import StayWithUsForm from '@/components/about/StayWithUsForm'
import heroPoster from '@/assets/about/hero-illustration.png'
import styles from './AboutPage.module.scss'

export const metadata: Metadata = {
  title: 'О Чтиве',
  description:
    'Независимое издательство Чтиво — дитя петербургского литандеграунда и сети интернет. Команда, партнёры, литжурнал Русского Динозавра.',
}

export default async function AboutPage() {
  const [teamRes, partnersRes] = await Promise.allSettled([getTeam(), getPartners()])
  const team = teamRes.status === 'fulfilled' ? teamRes.value : []
  const partners = partnersRes.status === 'fulfilled' ? partnersRes.value : []
  const videoUrl = getVideoUrl('about/chtivo.mp4') ?? ''

  return (
    <main className={styles.page}>
      <HeroVideo videoUrl={videoUrl} posterUrl={heroPoster.src} posterWidth={heroPoster.width} posterHeight={heroPoster.height} />

      <AboutManifestoSection />

      <EditionTypesSection />

      <JournalSection />

      <div className={styles.darkBlock}>
        <TeamStrip team={team} />
        <PartnersStrip partners={partners} />
        <DonateForm />
        <StayWithUsForm />
      </div>
    </main>
  )
}
