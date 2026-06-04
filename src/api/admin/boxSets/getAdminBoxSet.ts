import { createAdminClient } from '@/lib/supabase/server'

export type AdminBoxSetBook = {
  linkId: number
  titleId: number
  titleName: string
  productId: string | null
  position: number
}

export type AdminBoxSet = {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  discount: number | null
  image: string | null
  isPublished: boolean
  isActive: boolean
  books: AdminBoxSetBook[]
}

export async function getAdminBoxSet(id: number): Promise<AdminBoxSet | null> {
  const admin = createAdminClient()

  const { data: bs, error } = await admin.from('BoxSets').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить бокс-сет: ${error.message}`)
  if (!bs) return null

  const { data: bookRows } = await admin
    .from('BoxSetBooks')
    .select('id, title_id, product_id, position, Titles(name)')
    .eq('box_set_id', id)
    .order('position', { ascending: true })

  const books: AdminBoxSetBook[] = (bookRows ?? []).map((r) => {
    const title = r.Titles as { name: string } | null
    return {
      linkId: r.id,
      titleId: r.title_id,
      titleName: title?.name ?? `#${r.title_id}`,
      productId: r.product_id,
      position: r.position,
    }
  })

  return {
    id: bs.id,
    name: bs.name,
    slug: bs.slug,
    description: bs.description,
    price: bs.price,
    discount: bs.discount,
    image: bs.image,
    isPublished: bs.is_published,
    isActive: bs.is_active,
    books,
  }
}
