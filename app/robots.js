export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/admin/',
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
