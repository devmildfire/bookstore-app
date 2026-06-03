import type { Metadata } from 'next'
import FeatherIcon from '@/assets/icons/feather.svg'
import PageHero from '@/components/common/PageHero'
import {
  PhoneIcon,
  EmailIcon,
  TelegramIcon,
  InstagramIcon,
  VkIcon,
  FacebookIcon,
} from '@/components/common/BrandIcons'
import NewsletterForm from './NewsletterForm'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Контакты',
  description:
    'Свяжитесь с издательством и магазином «Чтиво»: телефон, почта, адрес в Санкт-Петербурге, соцсети и подписка на рассылку «Письма от Динозавра».',
}

const SOCIALS = [
  { Icon: TelegramIcon, name: 'Telegram', handle: '@ichtivo', href: 'https://t.me/ichtivo' },
  { Icon: InstagramIcon, name: 'Instagram', handle: '@ichtivo', href: 'https://www.instagram.com/ichtivo' },
  { Icon: VkIcon, name: 'ВКонтакте', handle: 'vk.com/ichtivo', href: 'https://vk.com/ichtivo' },
  { Icon: FacebookIcon, name: 'Facebook', handle: '@ichtivo', href: 'https://www.facebook.com/ichtivo' },
] as const

export default function ContactsPage() {
  return (
    <div className={styles.page}>
      <PageHero
        eyebrow='Связаться с нами'
        title='Контакты'
        lead={
          <>
            Пишите, звоните, заходите в гости. Мы всегда рады поговорить о книгах —{' '}
            <em>и о том, как менять реальность вместе</em>.
          </>
        }
      />

      {/* ── Body ── */}
      <section className={styles.body}>
        <div className={styles.col}>
          <p className={styles.kicker}>Прямая связь</p>
          <div className={styles.direct}>
            <a className={styles.directCell} href='tel:+78129158367' aria-label='Позвонить'>
              <PhoneIcon className={styles.directIcon} />
              <span className={styles.meta}>
                <small>Телефон</small>
                <span>(812)&nbsp;915-83-67</span>
              </span>
            </a>
            <a className={styles.directCell} href='mailto:info@chtivo.spb.ru' aria-label='Написать на почту'>
              <EmailIcon className={styles.directIcon} />
              <span className={styles.meta}>
                <small>Почта</small>
                <span>info@chtivo.spb.ru</span>
              </span>
            </a>
          </div>
          <p className={styles.addr}>
            <b>Издательство и магазин «Чтиво»</b>
            <br />
            197198, Санкт-Петербург, Большой проспект П. С., 29А.
            <br />
            Ежедневно с 11:00 до 21:00.
          </p>

          <p className={styles.kicker}>Мы в соцсетях</p>
          <div className={styles.socials}>
            {SOCIALS.map(({ Icon, name, handle, href }) => (
              <a
                key={name}
                className={styles.socialCard}
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={name}
              >
                <Icon className={styles.socialIcon} />
                <span className={styles.socialText}>
                  <b>{name}</b>
                  <span>{handle}</span>
                </span>
              </a>
            ))}
          </div>

          <div className={styles.pull}>
            <FeatherIcon className={styles.feather} aria-hidden />
            <p className={styles.quote}>
              Напишите нам — мы отвечаем каждому, кто пишет от души.
            </p>
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className={styles.news}>
        <div className={styles.newsIn}>
          <div className={styles.newsCopy}>
            <h2 className={styles.newsTitle}>
              Письма
              <br />
              от Динозавра
            </h2>
            <p className={styles.newsSub}>
              Раз в две недели — новинки всех четырёх изданий, заметки редакции и истории
              из «Журнала Русского Динозавра». Без спама.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
