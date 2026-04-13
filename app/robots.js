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
        '/pghostels/results/',
        '/pghostels/cart/',
        '/pghostels/booking/',
        '/religious-services/cart/',
        '/religious-services/booking/',
        '/services/cart/',
        '/services/checkout/',
        '/services/payment-failed/',
        '/services/thank-you/',
        '/partner/',
        '/service-partner/',
        '/logo-test/',
        '/subcategory/',
      ],
    },
    sitemap: 'https://doorstephub.com/sitemap.xml',
  };
}

