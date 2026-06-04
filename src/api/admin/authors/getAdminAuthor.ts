import { createAdminClient } from '@/lib/supabase/server'
import { getAuthorPhotoUrl } from '@/lib/storage'
import type { AdminAuthorContact, AuthorContactChannel } from '@/lib/admin/authorContacts'

export type AdminAuthor = {
  id: number
  name: string
  photo: string | null
  photoUrl: string | null
  bio: string | null
  birthDate: string | null
  deathDate: string | null
  city: string | null
  phrase: string | null
  nonsalable: boolean
  titleCount: number
  contacts: AdminAuthorContact[]
}

export async function getAdminAuthor(id: number): Promise<AdminAuthor | null> {
  const admin = createAdminClient()

  const { data: a, error } = await admin.from('Authors').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить автора: ${error.message}`)
  if (!a) return null

  const { count: titleCount } = await admin
    .from('Titles_Authors')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', id)

  const { data: contactRows } = await admin
    .from('AuthorContacts')
    .select('id, channel, url')
    .eq('author_id', id)
    .order('sort_order', { ascending: true })
  const contacts: AdminAuthorContact[] = (contactRows ?? []).map((c) => ({
    id: c.id,
    channel: c.channel as AuthorContactChannel,
    url: c.url,
  }))

  return {
    id: a.id,
    name: a.name,
    photo: a.photo,
    photoUrl: getAuthorPhotoUrl(a.photo),
    bio: a.bio,
    birthDate: a.birth_date,
    deathDate: a.death_date,
    city: a.city,
    phrase: a.phrase,
    nonsalable: a.nonsalable,
    titleCount: titleCount ?? 0,
    contacts,
  }
}
