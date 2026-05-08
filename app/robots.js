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
        '/thank-you-cod/',
        '/payment-failed/',
        '/results/',
        '/search/',
        '/**/cart/',
        '/**/checkout/',
        '/**/booking/',
        '/**/thank-you/',
        '/**/thank-you-cod/',
        '/**/results/',
        '/**/payment-failed/',
        '/partner/',
        '/service-partner/',
        '/logo-test/',
        '/subcategory/',
      ],

    },
    sitemap: 'https://doorstephub.com/sitemap.xml',
  };
}

