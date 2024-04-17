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
        permanent: true,
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
    ],
  },
output: 'standalone',
};

module.exports = options;
