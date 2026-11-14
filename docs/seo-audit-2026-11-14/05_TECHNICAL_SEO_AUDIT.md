# Doorstep Hub — Comprehensive Technical SEO Audit

**Audit Date:** November 14, 2026  
**Status:** READ-ONLY COMPREHENSIVE TECHNICAL AUDIT  
**Analyzed Host:** `https://doorstephub.com`  

---

## 1. Technical Health Summary

| Category | Status | Health Score | Critical Issues Found |
|---|---|---|---|
| **Crawlability & Robots.txt** | Verified Healthy | 98 / 100 | 0 active crawl blockers |
| **XML Sitemaps** | Moderate Issues | 78 / 100 | Cross-canonical submission, static omissions |
| **Canonical URL Governance** | High Risk | 68 / 100 | Competing canonicals on duplicate routes |
| **Rendering & Hydration** | High Risk | 62 / 100 | Dynamic city pages load via CSR with spinner |
| **Mobile Accessibility** | Critical Issue | 60 / 100 | Pinch-to-zoom disabled in viewport metadata |
| **Metadata Integrity** | Moderate Issues | 72 / 100 | Spelling errors in root layout, missing SSR meta |
| **Structured Data** | Moderate Issues | 74 / 100 | Nested URLs in OfferCatalog, missing LocalBusiness |

---

## 2. Robots.txt Specification Audit

### 2.1 Live Production Configuration
The live production `robots.txt` at `https://doorstephub.com/robots.txt` was verified:
```text
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://doorstephub.com/sitemap.xml
```

### 2.2 Compliance Verification
- **RFC 9309 Compliance:** Verified. Valid syntax, correct MIME type `text/plain; charset=utf-8`.
- **Render Resource Accessibility:** Verified. `/_next/` is NOT blocked. Googlebot can crawl CSS, JS, fonts, and WebP images.
- **Private Route Protection:** Verified. Sensitive backend `/api/` and internal `/admin/` paths are blocked from crawling.
- **Noindex Discovery:** Public transactional routes (`/appliances/checkout`, `/account/*`) are crawlable, allowing Googlebot to discover the `<meta name="robots" content="noindex, nofollow" />` tag.

---

## 3. XML Sitemap Infrastructure

### 3.1 Architecture
The website generates dynamic chunked sitemaps via `app/sitemap.xml/route.js` and `app/sitemaps/[group]/route.js`.

### 3.2 Key Deficiencies
1. **Cross-Canonical Conflict:** `https://doorstephub.com/blog` is submitted in `sitemap.xml`, but its HTML tag points to `https://doorstephub.com/knowledge`.
2. **Missing Static Routes:** Public landing pages `/appliance-repair-services`, `/service-partner`, and `/offers` are not present in `sitemapManager.js`.
3. **Volatile `<lastmod>`:** `sitemapInventory.js` falls back to `new Date()` when entity `updatedAt` is null, generating false modification signals on every serverless execution.

---

## 4. Mobile Usability & Core Web Vitals (CWV)

### 4.1 Critical Mobile Usability Defect
In `app/layout.js`:
```javascript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```
Setting `userScalable: false` and `maximumScale: 1` explicitly violates Google Search Console mobile usability benchmarks and WCAG 1.4.4 (Resize text). Users cannot pinch-to-zoom on mobile devices.

---

## 5. Summary of All 20 Identified Technical Issues

The complete matrix of 20 technical issues, affected URL counts, root causes, and recommended engineering fixes is documented in `05_TECHNICAL_ISSUES.csv`.
