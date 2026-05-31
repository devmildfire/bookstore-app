import MrdIcon from '@/assets/icons/mrd.svg'
import styles from './DinoMagazineHero.module.scss'

export default function DinoMagazineHero() {
  return (
    <header className={styles.hero}>
      <MrdIcon className={styles.icon} aria-hidden />
      <h1 className={styles.title}>Литжурнал Русского Динозавра</h1>
    </header>
  )
}
