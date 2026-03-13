export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/cart/',
        '/checkout/',
        '/booking/',
        '/thank-you/',
        '/payment-failed/',
      ],
    },
    sitemap: 'https://doorstephub.com/sitemap.xml',
  };
}
