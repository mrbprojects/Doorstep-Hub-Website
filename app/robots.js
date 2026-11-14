export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
      ],
    },
    sitemap: 'https://doorstephub.com/sitemap.xml',
  };
}

