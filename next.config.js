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
      {
        source: '/books',
        destination: '/books/deleted',
        permanent: false,
      },
      {
        source: '/all-books.html',
        destination: '/books',
        permanent: true,
      },
      {
        source: '/book-deleted.html',
        destination: '/books/deleted',
        permanent: true,
      },
      {
        source: '/book-craft.html',
        destination: '/books/craft',
        permanent: true,
      },
    ];
  },
  devIndicators: {
    buildActivity: false,
  },
};

module.exports = options;
