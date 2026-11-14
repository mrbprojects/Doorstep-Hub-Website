export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/admin/',
      ],
    },
    sitemap: 'https://doorstephub.com/sitemap.xml',
  };
}

