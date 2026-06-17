#!/usr/bin/env node
// Generate an ES256 JWT signing key + build the JWKS keysets for the HS256 -> asymmetric
// migration (Solution B; see docs/deployment/asymmetric-jwt-migration.md). Coexistence:
// each keyset also carries the legacy HS256 `oct` key, so existing HS256 tokens (the anon
// key baked into the deployed app, plus live sessions) keep validating after the cutover.
//
// Usage:  JWT_SECRET=<legacy-hs256-secret> node scripts/gen-asymmetric-jwt-keys.mjs [outDir]
// Outputs (SECRETS — never commit; outDir defaults to the gitignored backups/):
//   signing_keys.json  -> GoTrue GOTRUE_JWT_KEYS (private; signs ES256, validates both)
//   jwks.public.json   -> verifiers' JWKS (PGRST_JWT_SECRET / JWT_JWKS; public + legacy oct)
import { generateKeyPairSync, createSign, createVerify, createHmac, randomUUID } from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'

const legacySecret = process.env.JWT_SECRET
if (!legacySecret) {
  console.error('ERROR: set JWT_SECRET to the current (legacy HS256) secret.')
  process.exit(1)
}
const outDir = process.argv[2] ?? 'backups/jwt-keys'
mkdirSync(outDir, { recursive: true })
const b64url = (buf) => Buffer.from(buf).toString('base64url')

// 1. ES256 (EC P-256) signing key
const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
const kid = randomUUID()
// Field set matches `supabase gen signing-key --algorithm ES256` exactly — GoTrue identifies
// the SIGNING key by key_ops:["sign","verify"]; without key_ops it reports "no signing key detected".
const privJwk = { kty: 'EC', kid, use: 'sig', key_ops: ['sign', 'verify'], alg: 'ES256', ext: true, ...privateKey.export({ format: 'jwk' }) }
const pubJwk = { kty: 'EC', kid, use: 'sig', key_ops: ['verify'], alg: 'ES256', ext: true, ...publicKey.export({ format: 'jwk' }) }

// 2. Legacy HS256 `oct` key — VERIFY-ONLY, so GoTrue signs new tokens with the ES256 key
// above (not this one) while still validating existing HS256 tokens (the baked anon key + sessions).
const octJwk = { kty: 'oct', kid: 'legacy-hs256', use: 'sig', key_ops: ['verify'], alg: 'HS256', ext: true, k: b64url(legacySecret) }

// 3. Keysets — exact formats per the Supabase self-hosting docs:
//    JWT_KEYS (GoTrue GOTRUE_JWT_KEYS) is a BARE ARRAY of signing JWKs (EC private + legacy oct).
//    JWT_JWKS (PostgREST/Storage verifiers) is a {"keys":[...]} object (EC public + legacy oct).
const jwtKeys = [privJwk, octJwk] // -> JWT_KEYS
const jwtJwks = { keys: [pubJwk, octJwk] } // -> JWT_JWKS
// Single-line JSON, ready to paste as .env values.
writeFileSync(`${outDir}/JWT_KEYS.json`, JSON.stringify(jwtKeys))
writeFileSync(`${outDir}/JWT_JWKS.json`, JSON.stringify(jwtJwks))
// .env-ready lines (the migration sets these two; the compose `:-` fallbacks stay HS256 until then).
writeFileSync(
  `${outDir}/jwt-keys.env`,
  `JWT_KEYS=${JSON.stringify(jwtKeys)}\nJWT_JWKS=${JSON.stringify(jwtJwks)}\n`,
)

// 4. Self-test — prove the artifacts are sound before they touch any service.
const data = Buffer.from('header.payload')
const sig = createSign('SHA256').update(data).end().sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
const esOk = createVerify('SHA256').update(data).end().verify({ key: publicKey, dsaEncoding: 'ieee-p1363' }, sig)
const hsLegacy = createHmac('sha256', legacySecret).update(data).digest('hex')
const hsFromJwk = createHmac('sha256', Buffer.from(octJwk.k, 'base64url')).update(data).digest('hex')

console.log(`ES256 kid: ${kid}`)
console.log(`ES256 sign/verify roundtrip: ${esOk ? 'OK' : 'FAIL'}`)
console.log(`HS256 oct key == legacy secret: ${hsLegacy === hsFromJwk ? 'OK' : 'FAIL'}`)
console.log(`wrote ${outDir}/jwt-keys.env (JWT_KEYS + JWT_JWKS — SECRET) + JWT_KEYS.json + JWT_JWKS.json`)
if (!esOk || hsLegacy !== hsFromJwk) process.exit(1)
