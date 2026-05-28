import Image from 'next/image'
import OutlinedButton from '@/components/common/OutlinedButton'
import journalCollage from '@/assets/about/journal-collage.jpg'
import JournalLeaf from '@/assets/about/journal-leaf.svg'
import styles from './JournalSection.module.scss'

export default function JournalSection() {
  return (
    <section className={styles.wrapper} aria-labelledby='journal-heading'>
      <div className={styles.backdrop} aria-hidden='true'>
        <Image
          src={journalCollage}
          alt=''
          className={styles.collage}
          sizes='100vw'
          placeholder='blur'
        />
        <div className={styles.gradientTop} />
        <div className={styles.gradientBottom} />
      </div>

      <div className={styles.card}>
        <JournalLeaf className={styles.leaf} aria-hidden='true' />

        <h2 id='journal-heading' className={styles.heading}>
          <span className={styles.headingLine}>Литжурнал</span>
          <span className={styles.headingLine}>Русского Динозавра</span>
        </h2>

        <p className={styles.body}>
          Мы редактируем, иллюстрируем и публикуем лучшие рассказы современников в литературном журнале
          арт-конгрегации Русский Динозавр — нашего творческого объединения мастеров арт-контента.
        </p>

        <p className={styles.bodySecondary}>
          Лучшие рассказы года попадают в ежегодник «Могучий Русский Динозавр».
        </p>

        <OutlinedButton href='/dino-magazine' className={styles.cta} fitContainer>
          <span className={styles.ctaDesktop}>Литжурнал Русского Динозавра</span>
          <span className={styles.ctaCompact}>Журнал Русского Динозавра</span>
        </OutlinedButton>
      </div>
    </section>
  )
}
