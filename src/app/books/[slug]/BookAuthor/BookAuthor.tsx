import Image from 'next/image'
import type { Author } from '@/entities/book/client'
import AuthorContactIcon from './AuthorContactIcon'
import styles from './BookAuthor.module.scss'

type Props = { author: Author }

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : dateFmt.format(d)
}

/**
 * Renders one author's profile (photo, name, city + dates, quote, bio,
 * contacts). One section is rendered per linked author of the title; the
 * parent page hides this entirely when none of the visible fields are
 * populated.
 */
export default function BookAuthor({ author }: Props) {
  const birth = formatDate(author.birthDate)
  const death = formatDate(author.deathDate)
  const dateLine =
    birth && death ? `${birth} — ${death}` : birth ? birth : null
  const cityDate = [author.city, dateLine].filter(Boolean).join(' | ')

  return (
    <section className={styles.section} aria-labelledby={`author-title-${author.id}`}>
      <h2 id={`author-title-${author.id}`} className={styles.sectionTitle}>
        Об авторе
      </h2>

      <div className={styles.content}>
        {author.photoUrl && (
          <div className={styles.photoWrap}>
            <Image
              src={author.photoUrl}
              alt={author.name}
              width={400}
              height={400}
              className={styles.photo}
              sizes="(max-width: 532px) 200px, (max-width: 767px) 240px, (max-width: 1200px) 280px, (max-width: 1439px) 300px, 400px"
              placeholder={author.photoBlurDataUrl ? 'blur' : 'empty'}
              blurDataURL={author.photoBlurDataUrl ?? undefined}
            />
          </div>
        )}

        <div className={styles.textCol}>
          <p className={styles.name}>{author.name}</p>
          {cityDate && <p className={styles.cityDate}>{cityDate}</p>}
          {author.phrase && (
            <p className={styles.phrase}>{`«${author.phrase}»`}</p>
          )}
          {author.bio && <p className={styles.bio}>{author.bio}</p>}

          {author.contacts.length > 0 && (
            <div className={styles.contactsRow}>
              <span className={styles.contactsLabel}>Контакты:</span>
              <ul className={styles.contacts}>
                {author.contacts.map((c) => (
                  <li key={c.channel}>
                    <a
                      href={c.url}
                      target={c.channel === 'email' ? undefined : '_blank'}
                      rel={c.channel === 'email' ? undefined : 'noopener noreferrer'}
                      className={styles.contactLink}
                    >
                      <AuthorContactIcon channel={c.channel} className={styles.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
