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
      //  Редиректы изменены для показа премиуму страниц Инвесторам и Авторам
      // {
      //   source: '/',
      //   destination: '/books',
      //   permanent: true,
      // },
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
    ];
  },
  devIndicators: {
    buildActivity: false,
  },
  i18n: {
    locales: ['ru'],
    defaultLocale: 'ru',
  },
};

module.exports = options;
