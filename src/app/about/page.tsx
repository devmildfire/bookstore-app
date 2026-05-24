import Image from 'next/image'
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
import rorschachBg from '@/assets/about/rorschach-bg.jpg'
import styles from './AboutPage.module.scss'

export const metadata: Metadata = {
  title: 'О Чтиве',
  description:
    'Независимое издательство Чтиво — дитя петербургского литандеграунда и сети интернет. Команда, партнёры, литжурнал Русского Динозавра.',
}

export default async function AboutPage() {
  const [team, partners] = await Promise.all([getTeam(), getPartners()])
  const videoUrl = getVideoUrl('about/chtivo.mp4') ?? ''

  return (
    <main className={styles.page}>
      <HeroVideo videoUrl={videoUrl} posterUrl={heroPoster.src} />

      <AboutManifestoSection />

      <EditionTypesSection />

      <JournalSection />

      <div className={styles.darkBlock}>
        <Image
          src={rorschachBg}
          alt=''
          aria-hidden='true'
          className={styles.rorschach}
          placeholder='blur'
          sizes='100vw'
        />
        <TeamStrip team={team} />
        <PartnersStrip partners={partners} />
        <DonateForm />
        <StayWithUsForm />
      </div>
    </main>
  )
}
