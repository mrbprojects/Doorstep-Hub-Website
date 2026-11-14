export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/admin/',
        '/account/',
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
        '/sell-buy/dashboard/',
        '/sell-buy/post-ad',
        '/sell-buy/chat',
        '/logo-test/',
        '/deletion-requests',
        '/subcategory/',
      ],

    },
    sitemap: 'https://doorstephub.com/sitemap.xml',
  };
}

