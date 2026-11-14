# Doorstep Hub — Canonical Conflict Resolution Plan & Implementation Architecture

**Project:** Doorstep Hub Private Limited  
**Website:** https://doorstephub.com  
**SEO Release Branch:** `release/seo-implementation-2026-11`  
**Date:** November 15, 2026

---

## 1. Problem Definition: The 90 Conflicts & 220 Missing Canonicals

Google Search Console flagged two interrelated canonical issues:
1. **Google chose different canonical than user (90 pages):** Google detected two or more URLs with identical or near-duplicate content, where Google disagreed with the page's declared canonical and substituted another URL.
2. **Duplicate without user-selected canonical (220 pages):** Google discovered duplicate URLs (parameter variations, trailing slash permutations, or legacy URLs) lacking explicit `<link rel="canonical">` tags.

---

## 2. Definitive Canonical Hierarchy: `/appliances` vs `/appliance-repair-services`

### 2.1 The Conflict
Historically, Doorstep Hub maintained both:
- `https://doorstephub.com/appliances` (The architectural App Router root)
- `https://doorstephub.com/appliance-repair-services` (A legacy marketing path)

Both routes mounted `<ApplianceHomePage />` producing identical HTML output. In past configurations, `/appliance-repair-services` was linked from promotional banners, while `/appliances` was submitted to XML sitemaps. When Google crawled both, Google overrode `/appliance-repair-services` and indexed `/appliances`.

### 2.2 The Architectural Decision
`/appliances` is established as the **sole, definitive canonical destination**:
1. It is the root directory (`app/appliances/`) for all 14 nested sub-route directories.
2. It is registered in `STATIC_ROUTES` in `sitemapManager.js`.
3. It has the cleanest, shortest semantic structure for user navigation and search results.

---

## 3. Implementation of Edge 308 Permanent Redirects

To eliminate canonical ambiguity, 308 Permanent Redirects were implemented at the Next.js edge level in `next.config.js`:

```javascript
// next.config.js
async redirects() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
      destination: 'https://doorstephub.com/:path*',
      permanent: true,
    },
    {
      source: '/appliance-repair-services',
      destination: '/appliances',
      permanent: true,
    },
    {
      source: '/appliance-repairs',
      destination: '/appliances',
      permanent: true,
    },
    {
      source: '/pg-hostel',
      destination: '/pghostels',
      permanent: true,
    },
    {
      source: '/religious',
      destination: '/religious-services',
      permanent: true,
    },
    {
      source: '/blog',
      destination: '/knowledge',
      permanent: true,
    },
    {
      source: '/blog/:slug*',
      destination: '/knowledge/:slug*',
      permanent: true,
    },
  ];
}
```

### Verification Proof via Runtime Testing:
```bash
curl -I https://doorstephub.com/appliance-repair-services
HTTP/2 308 Permanent Redirect
location: /appliances
```
When Googlebot crawls `/appliance-repair-services`, it receives an immediate 308 response and transfers all historical link equity directly to `/appliances`.

---

## 4. Elimination of Internal Redirect Chaining

To prevent crawl budget dissipation and internal redirect hops, all internal links pointing to `/appliance-repair-services` were systematically updated to `/appliances` across:
- `app/components/layout/Header.jsx`
- `app/components/landing/HeroSection.jsx`
- `app/components/landing/BookingServices.jsx`
- `app/components/ui/FloatingActionButtons.jsx`
- `app/components/appliances/ServiceCentersListingPage.jsx`
- `app/components/appliances/ApplianceHomePage.jsx`

---

## 5. Layout-Level Canonical Governance (`app/lib/seo/canonicalManager.js`)

To resolve the 220 "Duplicate without user-selected canonical" pages, every layout now exports explicit canonical tags derived from a single canonical generator:

```javascript
// app/appliances/layout.js
export const metadata = {
  metadataBase: new URL('https://doorstephub.com'),
  title: 'Home Appliance Repair & Maintenance Services in India',
  description: 'Doorstep Hub offers professional home appliance repair services...',
  alternates: {
    canonical: 'https://doorstephub.com/appliances',
  },
};
```

Identical canonical layouts were established for:
- `app/pghostels/layout.js` (`https://doorstephub.com/pghostels`)
- `app/religious-services/layout.js` (`https://doorstephub.com/religious-services`)
- `app/spa-salon/layout.js` (`https://doorstephub.com/spa-salon`)
- `app/services/layout.js` (`https://doorstephub.com/services`)
- Dynamic service templates (`app/appliances/repair-service/[citySlug]/page.js`) generating dynamic canonicals formatted as `https://doorstephub.com/appliances-repair-service-center-${citySlug}`.

---

## 6. Expected Google Search Console Status Transition

| Issue | Before Fix Status | Release State | Expected GSC Resolution Post-Deploy |
| :--- | :---: | :---: | :--- |
| **90 Canonical Conflicts** | Action Needed | 308 Permanent Edge Redirects | Google consolidates signals to canonical; drops conflict status |
| **220 Missing Canonicals** | Action Needed | Explicit Layout Canonicals | Google identifies declared canonicals; transitions to Indexed |
| **59 Canonical Alternatives** | Normal Exclusion | Validated | Maintained; normal consolidation confirmed |
