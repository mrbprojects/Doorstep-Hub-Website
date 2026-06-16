/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_BUILD_DIR || '.next',

  // ─── HTTP → HTTPS permanent redirect ─────────────────────────────────────────
  // Eliminates the 1.5 s redirect latency seen in GTMetrix critical-chain report.
  // The browser will permanently cache this redirect (308) so repeat visits skip it.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://doorstephub.com/:path*',
        permanent: true,
      },
    ];
  },

  // ─── Security & performance headers ──────────────────────────────────────────
  async headers() {
    const headersList = [
      {
        source: '/:path*',
        headers: [
          // HSTS: after first visit the browser uses HTTPS directly — no round-trip
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Clickjacking protection
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Limit referrer info sent cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy — disable unused browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];

    // Only apply aggressive caching in production to prevent caching stale JS/CSS in development
    if (process.env.NODE_ENV === 'production') {
      headersList.push(
        // Long-lived cache for static Next.js assets (JS, CSS, fonts, images)
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        // Cache public assets (images, icons) for 7 days
        {
          source: '/(.*)\\.(png|jpg|jpeg|gif|ico|svg|webp)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=604800, stale-while-revalidate=86400',
            },
          ],
        },
        // ─── Edge / CDN cache for rendered HTML pages ──────────────────────────
        // s-maxage: CDN serves cached HTML for 1 h; stale-while-revalidate: CDN
        // may serve stale HTML for up to 24 h while regenerating in background.
        {
          source: '/((?!_next|api|.*\\.[^/]+$).*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          ],
        },
      );
    }

    return headersList;
  },

  // Tree-shake heavy packages — only imported symbols get bundled.
  // This directly reduces the large chunk sizes seen in Lighthouse.
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'lucide-react',
      'framer-motion',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
  },

  basePath: '',
  images: {
    // ─── CDN / format configuration ──────────────────────────────────────
    // Serve AVIF first (50-60% smaller than JPEG), fall back to WebP.
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images on disk / CDN for 24 h (default is 60 s).
    minimumCacheTTL: 86400,
    // Responsive breakpoints matching Tailwind's default screens.
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1440, 1920],
    // Explicit image sizes used by next/image with a fixed width.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

