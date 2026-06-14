import { createClient } from '@/lib/supabase/client'

const AVATARS_BUCKET = 'avatars'

// Uploads an avatar image to the `avatars` bucket at the given object key,
// replacing any existing object. Throws on failure. Keeps the Supabase storage
// call out of the component (all Supabase access goes through src/api/*).
export async function uploadAvatar(path: string, file: File): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
}
