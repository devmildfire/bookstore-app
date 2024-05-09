/** @type {import('next').NextConfig} */
const options = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/books',
        permanent: false,
      },
    ];
  },
  devIndicators: {
    buildActivity: false,
  },
  i18n: {
    locales: ['ru'],
    defaultLocale: 'ru',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chtivo.spb.ru',
      },
      {
        protocol: 'https',
        hostname: 'www.rsl.ru',
      },
      {
        protocol: 'https',
        hostname: 'api.chtivo.duckdns.org',
      },
    ],
  },
  output: 'standalone',
};

module.exports = options;
