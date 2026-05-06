import Link from 'next/link'
import MrdIcon from '@/assets/icons/mrd.svg'
import styles from './Footer.module.scss'

// ── Contact icons ──────────────────────────────────────────────────────────

function PhoneIcon() {
  return (
    <svg className={styles.contactIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="29"/>
      <path d="M23 23a2 2 0 012-2h3l3 5.5-3 2a12 12 0 005.5 5.5l2-3 5.5 2.5v3a2 2 0 01-2 2C25 38 23 31 23 23z"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg className={styles.contactIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="29"/>
      <rect x="15" y="24" width="34" height="22" rx="2.5"/>
      <polyline points="15,26 32,37 49,26"/>
    </svg>
  )
}

// ── Social icons ───────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="29"/>
      <rect x="21" y="21" width="22" height="22" rx="5.5"/>
      <circle cx="32" cy="32" r="5"/>
      <circle cx="38.5" cy="25.5" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="29"/>
      <path d="M44 19L20 31l10 2.5-1.5 11 5.5-6.5 8.5 5L44 19z"/>
      <line x1="30" y1="33.5" x2="44" y2="19"/>
    </svg>
  )
}

function VkIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="29" strokeWidth="2"/>
      {/* V — two diagonals meeting at bottom */}
      <polyline points="12,21 23,44 34,21" strokeWidth="3.5"/>
      {/* K — vertical bar */}
      <line x1="38" y1="21" x2="38" y2="44" strokeWidth="3.5"/>
      {/* K — upper arm */}
      <line x1="38" y1="31" x2="51" y2="21" strokeWidth="3.5"/>
      {/* K — lower arm (offset start, characteristic of VK logo) */}
      <line x1="42" y1="34" x2="51" y2="44" strokeWidth="3.5"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="29"/>
      <path d="M35 22c-4.5 0-7 2.5-7 7.5v3h-3.5v5H28v12h5V37.5h4.5l.5-5H33v-2.5c0-1.5.5-2.5 2.5-2.5H38v-5c-1-.3-2-.5-3-.5z"/>
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="29"/>
      <path d="M44 23a9 9 0 01-3 1.5 5 5 0 00-8.5 4.5v1.5a14.5 14.5 0 01-12-6.5s-4 9 5 13.5a15 15 0 01-7 1.5c8.5 5.5 20 .5 20.5-14v-1A9 9 0 0042 21"/>
    </svg>
  )
}

// ── Footer ──────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.cols}>
          <div className={styles.contacts}>
            <a href="tel:+78129158367" className={styles.contactRow}>
              <PhoneIcon />
              <span>(812) 915-83-67</span>
            </a>
            <a href="mailto:info@chtivo.spb.ru" className={styles.contactRow}>
              <EmailIcon />
              <span>info@chtivo.spb.ru</span>
            </a>
          </div>

          <Link href="/" aria-label="Чтиво — на главную" className={styles.wordmark}>
            <span className={styles.wordmarkAccent}>Чти</span>ВО
          </Link>

          <div className={styles.socials}>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Telegram">
              <TelegramIcon />
            </a>
            <a href="#" className={styles.socialLink} aria-label="ВКонтакте">
              <VkIcon />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <TwitterIcon />
            </a>
          </div>

          <div className={styles.credit}>
            <MrdIcon className={styles.mrdIcon} />
            <span className={styles.creditText}>made by<br/>Russkiy<br/>Dinozavr</span>
          </div>
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
