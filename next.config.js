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
    //  Редиректы изменены для показа премиуму страниц Инвесторам и Авторам
    return [
      {
        source: '/',
        destination: '/for-investors',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/for-investors',
        permanent: true,
      },
      {
        source: '/for-authors/abzac',
        destination: '/not-found',
        permanent: true,
      },
      {
        source: '/books',
        destination: '/for-investors',
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
};

module.exports = options;
