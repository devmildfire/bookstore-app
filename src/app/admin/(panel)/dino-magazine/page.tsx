import { redirect } from 'next/navigation'

// The «Динозавр» magazine is the Articles collection — managed under /admin/articles.
export default function AdminDinoMagazineRedirect() {
  redirect('/admin/articles')
}
