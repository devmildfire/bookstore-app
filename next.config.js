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
        destination: '/about',
        permanent: true,
      },
      {
        source: '/books',
        destination: '/about',
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
