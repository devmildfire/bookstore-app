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
const pubJwk = { ...publicKey.export({ format: 'jwk' }), kid, alg: 'ES256', use: 'sig' }
const privJwk = { ...privateKey.export({ format: 'jwk' }), kid, alg: 'ES256', use: 'sig' }

// 2. Legacy HS256 `oct` key (keeps existing HS256 tokens valid)
const octJwk = { kty: 'oct', k: b64url(legacySecret), alg: 'HS256', use: 'sig', kid: 'legacy-hs256' }

// 3. Keysets
const privateKeyset = { keys: [privJwk, octJwk] }
const publicKeyset = { keys: [pubJwk, octJwk] }
writeFileSync(`${outDir}/signing_keys.json`, JSON.stringify(privateKeyset, null, 2))
writeFileSync(`${outDir}/jwks.public.json`, JSON.stringify(publicKeyset, null, 2))

// 4. Self-test — prove the artifacts are sound before they touch any service.
const data = Buffer.from('header.payload')
const sig = createSign('SHA256').update(data).end().sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
const esOk = createVerify('SHA256').update(data).end().verify({ key: publicKey, dsaEncoding: 'ieee-p1363' }, sig)
const hsLegacy = createHmac('sha256', legacySecret).update(data).digest('hex')
const hsFromJwk = createHmac('sha256', Buffer.from(octJwk.k, 'base64url')).update(data).digest('hex')

console.log(`ES256 kid: ${kid}`)
console.log(`ES256 sign/verify roundtrip: ${esOk ? 'OK' : 'FAIL'}`)
console.log(`HS256 oct key == legacy secret: ${hsLegacy === hsFromJwk ? 'OK' : 'FAIL'}`)
console.log(`wrote ${outDir}/signing_keys.json (PRIVATE keyset) + ${outDir}/jwks.public.json (public keyset)`)
if (!esOk || hsLegacy !== hsFromJwk) process.exit(1)
