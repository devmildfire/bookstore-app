import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ship browser source maps in production so chunk bytes can be attributed to their
  // source modules (Lighthouse script-treemap, DevTools). Source maps are separate
  // .map files fetched only by devtools — they do not add to the page's JS payload.
  productionBrowserSourceMaps: true,
  experimental: {
    // CSS isolation per route. The default ('loose') merges CSS Modules across routes into a few
    // shared render-blocking bundles via webpack SplitChunks — so the storefront home shipped
    // admin-panel, article, gift-card and book-detail CSS it never paints (~12 KB dead weight).
    // 'strict' does NOT fix this (it only changes merge ordering, not co-location). 'false' emits
    // one stylesheet per CSS Module, included only on routes that import it: measured home
    // render-blocking CSS 30.8 KB → 18.9 KB (−39%, 9 files → 4), with the cross-route leak gone.
    // Verified no cascade regression — gift-cards/book detail pixel-identical, home diff 0.09%
    // (async cover/badge load timing only). CSS Modules are scoped, so cross-module cascade order
    // doesn't matter here. See docs/perf/home-lcp-trace-findings.md.
    cssChunking: false,
    // inlineCss REVERTED: it inlines the route CSS into the <head> AND duplicates it into the RSC
    // flight, tripling the home document (0.21 MB → 0.66 MB). On Slow-4G that big doc/head delays
    // the LCP cover's preload discovery (PSI doesn't act on the 103 Early Hints, so it only finds
    // the preload after downloading the bloated head). External CSS loads in parallel over HTTP/2
    // and keeps the document small — net better here.
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
