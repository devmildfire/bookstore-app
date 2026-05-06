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
    <svg className={styles.socialIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="32" cy="32" r="29" strokeWidth="2"/>
      <g transform="scale(2.6667)">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.515 16h-1.309c-.496 0-.653-.491-1.518-1.5-.75-.875-1.138-1-1.329-1C13.091 13.5 13 13.566 13 13.967v1.486C13 15.786 12.914 16 12.075 16c-1.385 0-2.95-.938-4.137-2.563C6.3 11.196 6 9.247 6 8.887 6 8.687 6.063 8.5 6.445 8.5h1.321c.331 0 .458.147.585.534C8.938 11 9.813 12.5 10.258 12.5c.165 0 .242-.08.242-.52v-1.812C10.449 9.234 10 9.154 10 8.82c0-.161.106-.32.31-.32h2.324C12.914 8.5 13 8.66 13 9.007v2.593C13 11.893 13.224 12 13.312 12c.165 0 .32.008.625-.313.94-1.108 1.756-2.787 1.756-2.787C15.783 8.7 15.935 8.5 16.266 8.5h1.309c.293 0 .417.131.425.313.003.063-.008.133-.031.208-.165.8-1.857 3.176-1.844 3.176-.072.123-.12.211-.125.304-.005.088.031.18.125.31.139.2.443.568.75.94.555.671 1 1.375 1.097 1.663.021.078.03.149.028.212C17.993 15.872 17.818 16 17.515 16z"
        />
      </g>
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
            <a href="https://www.instagram.com/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://t.me/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <TelegramIcon />
            </a>
            <a href="https://vk.com/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте">
              <VkIcon />
            </a>
            <a href="https://www.facebook.com/ichtivo" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
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
