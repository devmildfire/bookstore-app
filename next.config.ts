import type { NextConfig } from 'next'
import path from 'node:path'
import bundleAnalyzer from '@next/bundle-analyzer'

// Gated on ANALYZE=true so it has zero effect on normal builds. Writes static
// treemap reports to .next/analyze/ (client.html = the browser bundle).
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ship browser source maps in production so chunk bytes can be attributed to their
  // source modules (Lighthouse script-treemap, DevTools). Source maps are separate
  // .map files fetched only by devtools — they do not add to the page's JS payload.
  productionBrowserSourceMaps: true,
  experimental: {
    // cssChunking: false REMOVED (Next 16.3+ errors: "only supported with webpack"). The prod build
    // is Turbopack, which never honoured it, so dropping it is a no-op for the shipped bundle. The
    // per-route CSS measurement it was based on: docs/perf/home-lcp-trace-findings.md.
    // inlineCss MEASURED AND REJECTED (2026-06-18, second attempt). Even with the above-fold set
    // shrunk to ~14 KB (box-set SVGs now WebP; deferred-section CSS no longer leaking), enabling
    // it inflated the home document 22→65 KB gz (inlined CSS + RSC-flight duplication). On Slow-4G
    // the document IS the critical path, so that bloat pushed FCP 1.4→2.7 s and LCP ~2→~5 s across
    // 3 runs each — strictly worse. External CSS (parallel, HTTP/3-multiplexed, cacheable) wins
    // here; PSI's "~750 ms render-blocking" estimate does not account for the doc-size cost.
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
    // Add a 320 candidate between the default 256 and 384. The book-card covers display at 174 px
    // on phones → at DPR 1.75 they need ~305 px, and without 320 the browser jumps to 384 (PSI's
    // "improve image delivery" flag). 320 (≥305, still crisp) is served instead, ~25% smaller.
    // Add a 448 candidate above 384: the HOME HERO cover displays at 230 px → at DPR 1.75 it needs
    // ~402 px, and without 448 the browser jumps to deviceSizes' 640 (the LCP image, ~55% heavier).
    // 448 (≥402, crisp at the emulated DPR) is served instead — the single biggest LCP lever.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384, 448],
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
    // No remotePatterns: all storage image srcs are now same-origin RELATIVE
    // paths under /sb (the middleware proxies them to Supabase — see src/proxy.ts
    // + docs/plans/cicd-single-image-and-edge-tests.md), which next/image treats
    // as local images. No Supabase host is referenced from the browser, so no
    // host allowlist is needed.
  },
  // PRODUCTION BUILD runs on Turbopack (`next build`, no `--webpack`) — it natively
  // keeps dev-only code (next-devtools overlay, HMR/hot-reloader) out of the prod
  // bundle, which the webpack builder leaked (see docs/perf/bundle-analysis.md).
  // DEV stays on `next dev --webpack` (the webpack block below): the storefront E2E
  // (Playwright) is reliable against the webpack dev server but flaky against
  // Turbopack dev (anon-session/hydration timing on add-to-cart). Both blocks
  // coexist; each builder reads its own.
  turbopack: {
    rules: {
      // @svgr for `import Icon from './x.svg'`. Preserve viewBox (removeViewBox:false)
      // so icons scale — matches the prior webpack svgo config.
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
    // supabase-js `export *`s realtime-js (websocket/presence + core-js polyfills) but we
    // use realtime 0×; alias it to a no-op stub to keep it out of the client bundle.
    resolveAlias: {
      '@supabase/realtime-js': './src/lib/supabase/realtime-stub.js',
    },
  },
  // Used only by `next dev --webpack` (the dev script). The Turbopack build ignores
  // this and reads the `turbopack` block above.
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
            },
          },
        },
      ],
    })
    config.resolve.alias = {
      ...config.resolve.alias,
      '@supabase/realtime-js$': path.resolve('src/lib/supabase/realtime-stub.js'),
      'next/dist/compiled/next-devtools': path.resolve('src/lib/next-devtools-stub.js'),
    }
    return config
  },
}

export default withBundleAnalyzer(nextConfig)
