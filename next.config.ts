import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Inline CSS into the <head> so there are ZERO render-blocking stylesheet *requests* — the
    // only built-in way to eliminate render-blocking CSS in the App Router (CSS <link>s block
    // first paint even when split/streamed per component). First attempt was reverted because the
    // home doc was then ~2.7 MB (box-set SVGs inlined per card); that bloat is now fixed (doc is
    // ~0.21 MB), so inlining the ~25 KB-gz CSS into the head stream removes the CSS round-trip
    // (~0.5-1s of FCP on Slow 4G) instead of adding to a monster. (Critters/optimizeCss, the
    // critical-only alternative, is Pages-Router-only — unavailable here.)
    inlineCss: true,
    // Book detail pages are prebuilt via generateStaticParams (SSG). Prerendering the
    // whole catalog concurrently hammers Supabase, which can return transient upstream
    // errors. Retry those failures and cap concurrency so a blip doesn't fail the build
    // (matters for CI prerendering against the prod DB too).
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 4,
    // Tree-shake barrel imports so only the used members ship to the client bundle.
    optimizePackageImports: [
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@tanstack/react-query',
    ],
  },
  images: {
    ...(process.env.NODE_ENV !== 'production' && { dangerouslyAllowLocalIP: true }),
    // The Supabase storage upstream serves covers with a 4 h max-age — PSI flags that as a
    // short cache lifetime. Raise the optimized-image cache floor to 7 days (covers rarely
    // change). With `must-revalidate`, a cover replaced under the same filename refreshes via
    // a conditional request after the window — so worst-case staleness is bounded, not permanent.
    minimumCacheTTL: 604800,
    // WebP-only (not AVIF). On Cloudflare's free plan we can't add `Accept` to the cache key
    // (Enterprise-only), so to edge-cache /_next/image safely there must be effectively ONE
    // negotiated format. WebP (~97% browser support since ~2020) is the safe single format to
    // serve from a shared edge cache; AVIF (~93%) would break more old browsers when one cached
    // variant is served to all. Edge-caching the LCP cover beats AVIF's ~few-KB size win.
    formats: ['image/webp'],
    remotePatterns: [
      // Supabase Cloud — matches any project subdomain
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Local development — matches Docker Supabase on default ports
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      // Self-hosted Supabase on the same VPS — add your production hostname here.
      {
        protocol: 'https',
        hostname: 'api.mildfire.dev',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    })
    // Exclude the unused Supabase Realtime client from the bundle (see realtime-stub.js):
    // supabase-js hard-instantiates RealtimeClient + `export *`s realtime-js, dragging the
    // websocket/presence bundle + its inlined core-js polyfills into the client chunk. We use
    // realtime 0×, so alias it to a no-op. Exact match ($) so only the bare import is replaced.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@supabase/realtime-js$': path.resolve('src/lib/supabase/realtime-stub.js'),
    }
    return config
  },
}

export default nextConfig
