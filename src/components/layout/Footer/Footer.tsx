import Link from 'next/link'
import MrdIcon from '@/assets/icons/mrd.svg'
import {
  PhoneIcon,
  EmailIcon,
  InstagramIcon,
  TelegramIcon,
  VkIcon,
  FacebookIcon,
  TwitterIcon,
} from '@/components/common/BrandIcons'
import styles from './Footer.module.scss'

// ── Footer ──────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.cols}>
          <div className={styles.contacts}>
            <a href="tel:+78129158367" className={styles.contactRow}>
              <PhoneIcon className={styles.contactIcon} />
              <span>(812) 915-83-67</span>
            </a>
            <a href="mailto:info@chtivo.spb.ru" className={styles.contactRow}>
              <EmailIcon className={styles.contactIcon} />
              <span>info@chtivo.spb.ru</span>
            </a>
          </div>

          <Link href="/" aria-label="Чтиво — на главную" className={styles.wordmark}>
            <span className={styles.wordmarkAccent}>Чти</span>ВО
          </Link>

          <div className={styles.socials}>
            <a href="https://www.instagram.com/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon className={styles.socialIcon} />
            </a>
            <a href="https://t.me/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <TelegramIcon className={styles.socialIcon} />
            </a>
            <a href="https://vk.com/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте">
              <VkIcon className={styles.socialIcon} />
            </a>
            <a href="https://www.facebook.com/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon className={styles.socialIcon} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <TwitterIcon className={styles.socialIcon} />
            </a>
          </div>

          <a href="https://t.me/russiandino" className={styles.credit} target="_blank" rel="noopener noreferrer" aria-label="Russkiy Dinozavr on Telegram">
            <MrdIcon className={styles.mrdIcon} />
            <span className={styles.creditText}>made by<br/>Russkiy<br/>Dinozavr</span>
          </a>
        </div>
      </div>

      <div className={styles.barWrap}>
        <div className={styles.bar}>
          <p className={styles.copy}>© 2017–{year} Чтиво. Санкт-Петербург. Все права защищены.</p>
          <p className={styles.hash}>#хбдщдбдщ</p>
        </div>
      </div>
    </footer>
  )
}
