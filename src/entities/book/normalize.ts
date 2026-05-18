import type { ProductCategory } from '@/types/database'
import type {
  Author,
  AuthorContact,
  AuthorContactChannel,
  Book,
  BookAward,
  BookContext,
  BookTrailer,
  BookWorker,
} from './client'
import type { BookServerRow } from './server'
import { getAuthorPhotoUrl, getBooktrailerUrls, getCoverUrl } from '@/lib/storage'

export function normalizeBook(raw: BookServerRow): Book {
  const authorNames = (raw.author_names ?? [])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'ru'))

  const price = raw.price ?? 0
  const discount = raw.discount ?? null
  const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : null
  const details = isRecord(raw.edition_details) ? raw.edition_details : {}

  return {
    id: `${raw.product_type ?? 'Book2.0'}-${raw.id}`,
    titleId: raw.title_id,
    slug: raw.title_slug ?? String(raw.title_id),
    name: raw.title_name,
    description: raw.title_description,
    thesis: raw.title_thesis ?? null,
    coverUrl: getCoverUrl(raw.title_cover),
    authorNames,
    authorName: authorNames.length > 0 ? authorNames.join(', ') : 'Автор не указан',
    price,
    discount,
    originalPrice,
    category: (raw.product_type ?? 'Book2.0') as ProductCategory,
    inStock: raw.sold_out !== true,
    hasMultipleProducts: raw.has_multiple_products ?? false,
    publishedAt: raw.release_date ?? raw.publish_date,
    litForm: raw.title_lit_form ?? null,
    ageRestriction: raw.title_age_restriction ?? null,
    year: raw.title_first_release?.slice(0, 4) ?? null,
    awards: normalizeAwards(raw.title_awards),
    workers: normalizeWorkers(raw.edition_workers),
    format: readString(details.format),
    paper: readString(details.paper),
    pageCount: readNumber(details.page_count),
    coverMaterial: readString(details.cover_material),
    binding: readString(details.binding),
    illustrations: readString(details.illustrations),
    printingTechnique: readString(details.printing_technique),
    packaging: readString(details.packaging),
    durationSeconds: readNumber(details.duration_seconds),
    fileSizeBytes: readNumber(details.file_size_bytes),
    formats: readStringArray(details.formats),
    characterCount: readNumber(details.character_count),
    booktrailer: normalizeBooktrailer(raw.title_booktrailer, raw.title_slug ?? String(raw.title_id)),
    authors: normalizeAuthors(raw.title_authors),
    contexts: normalizeContexts(raw.title_contexts),
  }
}

function normalizeContexts(value: unknown): BookContext[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry): BookContext | null => {
      if (!isRecord(entry)) return null
      const id = readNumber(entry.id)
      const heading = readString(entry.heading)
      const body = readString(entry.body)
      if (id === null || !heading || !body) return null
      return { id, heading, body, url: readString(entry.url) }
    })
    .filter((c): c is BookContext => c !== null)
}

const ALLOWED_CHANNELS: ReadonlySet<AuthorContactChannel> = new Set([
  'telegram',
  'instagram',
  'facebook',
  'twitter',
  'email',
])

function normalizeAuthors(value: unknown): Author[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry): Author | null => {
      if (!isRecord(entry)) return null
      const id = readNumber(entry.id)
      const name = readString(entry.name)
      if (id === null || !name) return null
      return {
        id,
        name,
        photoUrl: getAuthorPhotoUrl(readString(entry.photo)),
        city: readString(entry.city),
        birthDate: readString(entry.birth_date),
        deathDate: readString(entry.death_date),
        phrase: readString(entry.phrase),
        bio: readString(entry.bio),
        contacts: normalizeContacts(entry.contacts),
      }
    })
    .filter((a): a is Author => a !== null)
}

function normalizeContacts(value: unknown): AuthorContact[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry): AuthorContact | null => {
      if (!isRecord(entry)) return null
      const channel = readString(entry.channel)
      const url = readString(entry.url)
      if (!channel || !url || !ALLOWED_CHANNELS.has(channel as AuthorContactChannel)) return null
      return { channel: channel as AuthorContactChannel, url }
    })
    .filter((c): c is AuthorContact => c !== null)
}

function normalizeBooktrailer(value: unknown, slug: string): BookTrailer | null {
  if (!isRecord(value)) return null
  const hasPoster = value.has_poster === true
  const urls = getBooktrailerUrls(slug, hasPoster)
  if (!urls) return null
  return { mp4Url: urls.mp4, webmUrl: urls.webm, posterUrl: urls.poster }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const out = value.filter((v): v is string => typeof v === 'string' && v.length > 0)
  return out.length > 0 ? out : null
}

function normalizeWorkers(value: unknown): BookWorker[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry): BookWorker | null => {
      if (!isRecord(entry)) return null
      const name = readString(entry.name)
      const job = readString(entry.job)
      if (!name || !job) return null
      return { name, job }
    })
    .filter((w): w is BookWorker => w !== null)
}

function normalizeAwards(value: unknown): BookAward[] {
  if (!Array.isArray(value)) return []

  return value
    .map((award): BookAward | null => {
      if (!isAwardRecord(award)) return null

      return {
        id: award.id,
        title: award.title,
        image: award.image,
      }
    })
    .filter((award): award is BookAward => award !== null)
}

function isAwardRecord(value: unknown): value is BookAward {
  if (typeof value !== 'object' || value === null) return false

  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'number' &&
    typeof record.title === 'string' &&
    (typeof record.image === 'string' || record.image === null)
  )
}
