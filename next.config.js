/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  basePath: "",
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com', 'api.doorstephub.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'api.doorstephub.com',
      },
    ],
  },
};

module.exports = nextConfig;
