import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Book detail pages are prebuilt via generateStaticParams (SSG). Prerendering the
    // whole catalog concurrently hammers Supabase, which can return transient upstream
    // errors. Retry those failures and cap concurrency so a blip doesn't fail the build
    // (matters for CI prerendering against the prod DB too).
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 4,
  },
  images: {
    ...(process.env.NODE_ENV !== 'production' && { dangerouslyAllowLocalIP: true }),
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
