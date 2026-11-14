# ADSENSE_TECHNICAL_SEO_REPORT.md
# Google AdSense Phase 4: Technical SEO & Indexing Infrastructure Report

**Project**: Doorstep Hub Private Limited  
**Target Domain**: https://doorstephub.com  
**Audit Date**: November 2026  
**Auditor**: Antigravity Quality & Compliance Automation  

---

## 1. Technical SEO Architecture Overview

The Doorstep Hub web application runs on Next.js 16 with App Router, utilizing React Server Components (RSC) for pre-rendering authoritative meta tags, canonical links, OpenGraph cards, JSON-LD structured schemas, and modular XML sitemaps.

---

## 2. Robots.txt Configuration

The `app/robots.js` generator produces a dynamic `robots.txt` conforming to RFC 9309 and Google Search Central best practices.

```javascript
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
```

### Analysis of Directives:
1. **Zero Crawl/Index Conflicts**: In strict accordance with Google Search Central guidance, private, transactional, and auth routes are **not** blocked in `robots.txt`. This guarantees Googlebot can freely crawl the URLs and read their `<meta name="robots" content="noindex, nofollow" />` directives, permanently preventing the dreaded "Indexed, though blocked by robots.txt" warning in Google Search Console.
2. **Googlebot Full Render Access (`/_next/` Unrestricted)**: The broad `Disallow: /_next/` rule was deliberately removed in accordance with Google Webmaster and Search Central rendering specifications. This ensures Googlebot can render client-side JavaScript, fetch CSS stylesheets, fonts, and optimized images without restriction.
3. **Backend & Admin Endpoints Protected**: Pure non-HTML / backend proxy and administrative routes (`/api/`, `/admin/`) are disallowed.
4. **Public Subcategories Unblocked**: Public service subcategory routes (`/subcategory/*`) are fully accessible to search crawlers.

---

## 3. Server-Rendered Robots Meta Directives (`noindex, nofollow`)

To ensure Googlebot never indexes thin transactional pages, server layouts enforce `robots: { index: false, follow: false }`:

1. `app/account/layout.js` (protects `/account`, `/account/bookings`, `/account/wallet`, `/account/profile`, `/account/amc`, `/account/support`)
2. `app/appliances/cart/layout.js`
3. `app/appliances/checkout/layout.js`
4. `app/appliances/payment-failed/layout.js`
5. `app/appliances/thank-you/layout.js`
6. `app/appliances/thank-you-cod/layout.js`
7. `app/appliances/address/layout.js`
8. `app/appliances/booking/layout.js`
9. `app/services/cart/layout.js`
10. `app/services/checkout/layout.js`
11. `app/services/payment-failed/layout.js`
12. `app/services/thank-you/layout.js`
13. `app/services/thank-you-cod/layout.js`
14. `app/services/address/layout.js`
15. `app/services/booking/layout.js`
16. `app/spa-salon/cart/layout.js`
17. `app/spa-salon/booking/layout.js`
18. `app/spa-salon/thank-you/layout.js`
19. `app/spa-salon/thank-you-cod/layout.js`
20. `app/religious-services/booking/layout.js`
21. `app/religious-services/thank-you/layout.js`
22. `app/religious-services/thank-you-cod/layout.js`
23. `app/pghostels/booking/layout.js`
24. `app/sell-buy/dashboard/layout.js`
25. `app/sell-buy/post-ad/layout.js`
26. `app/sell-buy/chat/layout.js`
27. `app/partner/layout.js`
28. `app/logo-test/layout.js`
29. `app/deletion-requests/layout.js`

---

## 4. XML Sitemap Validation & Integrity

Runtime verification via `scripts/validate-sitemaps.js` guarantees that the XML sitemaps meet Google Webmaster guidelines:

- **Redirect URLs in Sitemap**: `0`
- **404 / 410 / 5xx URLs in Sitemap**: `0`
- **Noindex URLs in Sitemap**: `0`
- **Canonical Mismatches**: `0`
- **Duplicate URLs in Sitemap**: `0`
- **Legacy URL Formats**: `0`
- **Total Unique Canonical URLs**: `58`
- **Status**: **PASS (0 errors)**

---

## 5. JSON-LD Structured Data Implementation

Doorstep Hub implements rich Schema.org structured data across key sections:
1. **Organization Schema**: Legal name (Doorstep Hub Private Limited), registered Panjagutta address, customer care number (+91 8886688666), and corporate logo.
2. **LocalBusiness Schema**: Geocoded coordinates, service areas across Bangalore, Hyderabad, Chennai, Mumbai, Pune, Vizag, and Vijayawada.
3. **ContactPage Schema**: Integrated on `/contact-us`.
4. **Article / FAQPage Schema**: Integrated on Help Center and FAQs pages.
5. **BreadcrumbList Schema**: Active on all deep category and knowledge base guides.
