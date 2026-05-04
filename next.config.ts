import type { NextConfig } from 'next'

const isProduction = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'standalone',
  ...(isProduction && {
    basePath: '/bookstore-app',
    assetPrefix: '/bookstore-app',
  }),
  images: {
    dangerouslyAllowLocalIP: true,
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
      // For example, if your Supabase API is at https://api.example.com:
      // { protocol: 'https', hostname: 'api.example.com', pathname: '/storage/v1/object/public/**' },
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
