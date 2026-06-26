import { describe, it, expect } from 'vitest'
import {
  getCoverUrl,
  getAvatarUrl,
  getDemoUrl,
  getAwardUrl,
  getBooktrailerUrls,
  absoluteStorageUrl,
  toSameOriginStorageUrl,
} from './storage'

// Storage URLs are now SAME-ORIGIN RELATIVE paths under /sb (the middleware
// proxies them to Supabase) — no env-specific host is baked in. See
// src/proxy.ts + docs/plans/cicd-single-image-and-edge-tests.md.
const SB = '/sb/storage/v1/object/public'

describe('publicUrl-backed builders', () => {
  it('builds a relative /sb Storage path from a bare object key', () => {
    expect(getCoverUrl('murlo.jpg')).toBe(`${SB}/covers/murlo.jpg`)
    expect(getAvatarUrl('user-1/avatar.jpg')).toBe(`${SB}/avatars/user-1/avatar.jpg`)
  })

  it('returns null for null/empty input', () => {
    expect(getCoverUrl(null)).toBeNull()
    expect(getDemoUrl(null)).toBeNull()
  })

  it('passes through values that are already absolute URLs', () => {
    expect(getCoverUrl('https://cdn.example.com/x.jpg')).toBe('https://cdn.example.com/x.jpg')
    expect(getCoverUrl('http://cdn.example.com/x.jpg')).toBe('http://cdn.example.com/x.jpg')
  })
})

describe('getAwardUrl', () => {
  it('passes through legacy root-relative /awards paths untouched', () => {
    expect(getAwardUrl('/awards/book_of_the_year.svg')).toBe('/awards/book_of_the_year.svg')
  })

  it('builds a relative /sb path from a bare filename', () => {
    expect(getAwardUrl('best_2019.svg')).toBe(`${SB}/awards/best_2019.svg`)
  })

  it('returns null for null input', () => {
    expect(getAwardUrl(null)).toBeNull()
  })
})

describe('getBooktrailerUrls', () => {
  it('builds relative mp4/webm and a poster only when hasPoster', () => {
    const base = `${SB}/booktrailers/my-slug`
    expect(getBooktrailerUrls('my-slug', true)).toEqual({
      mp4: `${base}/video.mp4`,
      webm: `${base}/video.webm`,
      poster: `${base}/poster.jpg`,
    })
    expect(getBooktrailerUrls('my-slug', false)?.poster).toBeNull()
  })
})

describe('absoluteStorageUrl', () => {
  it('prefixes a relative /sb path with the given origin', () => {
    expect(absoluteStorageUrl('https://app.example.com', '/sb/storage/v1/object/public/covers/x.jpg')).toBe(
      'https://app.example.com/sb/storage/v1/object/public/covers/x.jpg',
    )
  })

  it('trims a trailing slash on the origin and passes through absolute URLs / null', () => {
    expect(absoluteStorageUrl('https://app.example.com/', '/sb/a.jpg')).toBe('https://app.example.com/sb/a.jpg')
    expect(absoluteStorageUrl('https://app.example.com', 'https://cdn/x.jpg')).toBe('https://cdn/x.jpg')
    expect(absoluteStorageUrl('https://app.example.com', null)).toBeNull()
  })
})

describe('toSameOriginStorageUrl', () => {
  it('maps an absolute signed URL (any host) to the same-origin /sb path, keeping the token', () => {
    expect(
      toSameOriginStorageUrl('http://kong:8000/storage/v1/object/sign/digital-files/x.epub?token=abc&download=true'),
    ).toBe('/sb/storage/v1/object/sign/digital-files/x.epub?token=abc&download=true')
  })

  it('passes through a URL with no /storage/v1/ marker unchanged', () => {
    expect(toSameOriginStorageUrl('https://elsewhere/x')).toBe('https://elsewhere/x')
  })
})
