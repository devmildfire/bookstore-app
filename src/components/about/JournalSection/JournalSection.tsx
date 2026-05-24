import Image from 'next/image'
import Link from 'next/link'
import journalCollage from '@/assets/about/journal-collage.jpg'
import styles from './JournalSection.module.scss'

export default function JournalSection() {
  return (
    <section className={styles.wrapper} aria-labelledby='journal-heading'>
      <div className={styles.backdrop}>
        <Image
          src={journalCollage}
          alt=''
          aria-hidden='true'
          className={styles.collage}
          sizes='100vw'
          placeholder='blur'
        />
        <div className={styles.gradientTop} aria-hidden='true' />
        <div className={styles.gradientBottom} aria-hidden='true' />
      </div>

      <div className={styles.card}>
        <span className={styles.quote} aria-hidden='true'>
          “
        </span>
        <h2 id='journal-heading' className={styles.heading}>
          Литжурнал Русского Динозавра
        </h2>
        <p className={styles.body}>
          Мы редактируем, иллюстрируем и публикуем лучшие рассказы современников в литературном журнале
          арт-конгрегации Русский Динозавр — нашего творческого объединения мастеров арт-контента.
        </p>
        <p className={styles.bodySmall}>
          Лучшие рассказы года попадают в ежегодник «Могучий Русский Динозавр».
        </p>
        <Link href='/dino-magazine' className={styles.cta}>
          Читать журнал
        </Link>
      </div>
    </section>
  )
}
