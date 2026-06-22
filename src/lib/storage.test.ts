import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// storage.ts reads NEXT_PUBLIC_SUPABASE_URL once at module load, so each test
// stubs the env then re-imports the module (resetModules) to control the base.
const BASE = 'https://xyz.supabase.co'

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', BASE)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function load() {
  return import('./storage')
}

describe('publicUrl-backed builders', () => {
  it('builds a public Storage URL from a bare object key', async () => {
    const { getCoverUrl, getAvatarUrl } = await load()
    expect(getCoverUrl('murlo.jpg')).toBe(`${BASE}/storage/v1/object/public/covers/murlo.jpg`)
    expect(getAvatarUrl('user-1/avatar.jpg')).toBe(
      `${BASE}/storage/v1/object/public/avatars/user-1/avatar.jpg`,
    )
  })

  it('returns null for null/empty input', async () => {
    const { getCoverUrl, getDemoUrl } = await load()
    expect(getCoverUrl(null)).toBeNull()
    expect(getDemoUrl(null)).toBeNull()
  })

  it('passes through values that are already absolute URLs', async () => {
    const { getCoverUrl } = await load()
    expect(getCoverUrl('https://cdn.example.com/x.jpg')).toBe('https://cdn.example.com/x.jpg')
    expect(getCoverUrl('http://cdn.example.com/x.jpg')).toBe('http://cdn.example.com/x.jpg')
  })
})

describe('getAwardUrl', () => {
  it('passes through legacy root-relative /awards paths untouched', async () => {
    const { getAwardUrl } = await load()
    expect(getAwardUrl('/awards/book_of_the_year.svg')).toBe('/awards/book_of_the_year.svg')
  })

  it('builds a Storage URL from a bare filename', async () => {
    const { getAwardUrl } = await load()
    expect(getAwardUrl('best_2019.svg')).toBe(`${BASE}/storage/v1/object/public/awards/best_2019.svg`)
  })

  it('returns null for null input', async () => {
    const { getAwardUrl } = await load()
    expect(getAwardUrl(null)).toBeNull()
  })
})

describe('getBooktrailerUrls', () => {
  it('builds mp4/webm and a poster only when hasPoster', async () => {
    const { getBooktrailerUrls } = await load()
    const base = `${BASE}/storage/v1/object/public/booktrailers/my-slug`
    expect(getBooktrailerUrls('my-slug', true)).toEqual({
      mp4: `${base}/video.mp4`,
      webm: `${base}/video.webm`,
      poster: `${base}/poster.jpg`,
    })
    expect(getBooktrailerUrls('my-slug', false)?.poster).toBeNull()
  })

  it('returns null when the Supabase URL is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.resetModules()
    const { getBooktrailerUrls } = await load()
    expect(getBooktrailerUrls('my-slug', true)).toBeNull()
  })
})
