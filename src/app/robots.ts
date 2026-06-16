import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Non-public / user-specific / utility paths — no SEO value, keep crawlers out.
      disallow: [
        '/admin',
        '/api',
        '/auth',
        '/profile',
        '/cart',
        '/checkout',
        '/payments',
        '/redeem',
        '/newsletter/confirm',
        '/newsletter/unsubscribe',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
