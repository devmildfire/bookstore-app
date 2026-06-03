// Seed (or promote) an admin user via the Supabase Admin API.
//
//   node --env-file=.env scripts/seed-admin.mjs <email> <password>
//
// Creates the user with email confirmed and app_metadata.role='admin', or — if
// the email already exists — sets its password and grants the admin role.
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the env; no
// secrets live in this file. Point .env at the target instance before running.

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const [email, password] = process.argv.slice(2)

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
  process.exit(1)
}
if (!email || !password) {
  console.error('Usage: node --env-file=.env scripts/seed-admin.mjs <email> <password>')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const { data: list, error: listError } = await admin.auth.admin.listUsers()
if (listError) {
  console.error('Failed to list users:', listError.message)
  process.exit(1)
}

const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    app_metadata: { ...existing.app_metadata, role: 'admin' },
  })
  if (error) {
    console.error('Failed to update user:', error.message)
    process.exit(1)
  }
  console.log(`Updated existing user ${email} → role=admin (password reset).`)
} else {
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  })
  if (error) {
    console.error('Failed to create user:', error.message)
    process.exit(1)
  }
  console.log(`Created admin user ${email}.`)
}

console.log('Done. The user must sign in (or re-sign-in) for the JWT to carry the role.')
