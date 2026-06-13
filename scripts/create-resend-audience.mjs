// Create the Resend Audience for the mailing list (T2). Prints the id to put in
// RESEND_AUDIENCE_ID. Run once:
//   node --env-file=.env scripts/create-resend-audience.mjs "Chtivo Newsletter"
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set (use --env-file=.env)')
  process.exit(1)
}
const name = process.argv[2] || 'Chtivo Newsletter'
const resend = new Resend(process.env.RESEND_API_KEY)

const { data, error } = await resend.audiences.create({ name })
if (error) {
  console.error('Create failed:', error)
  process.exit(1)
}
console.log('Audience created.')
console.log('  name:', name)
console.log('  id  :', data?.id)
console.log('\nSet RESEND_AUDIENCE_ID=' + data?.id)
