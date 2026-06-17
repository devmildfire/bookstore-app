import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // NOTE: experimental.inlineCss was tried and REVERTED — it inlines *all* route CSS (~170 KB)
    // into the HTML, not just the critical above-fold subset. On this content-heavy home page
    // (already a ~2.7 MB document, half of it RSC payload) that bloated the render-blocking
    // document and regressed FCP/LCP/Speed Index on real mobile PSI (78→74). External CSS loads
    // in parallel over HTTP/2; the real bottleneck is the RSC payload, not the CSS links.
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
    return config
  },
}

export default nextConfig
