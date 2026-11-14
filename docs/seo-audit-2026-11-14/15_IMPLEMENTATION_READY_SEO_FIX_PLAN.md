# Doorstep Hub — Implementation-Ready Technical SEO Fix Plan

**Auditor:** Technical SEO Architect & Full-Stack Next.js Specialist  
**Safety Protocol:** Strict Read-Only Audit (Implementation to be executed ONLY upon explicit user approval).  

---

## 1. High-Priority Engineering Fixes

### Fix 1: Consolidate `/appliance-repair-services` into `/appliances`
- **File:** `Doorstep-Hub-Website/next.config.js`
- **Action:** Add permanent redirect in `redirects()`:
  ```javascript
  {
    source: '/appliance-repair-services',
    destination: '/appliances',
    permanent: true,
  }
  ```

### Fix 2: Convert Client Redirects to Server 308 Redirects
- **File:** `Doorstep-Hub-Website/next.config.js`
- **Action:**
  ```javascript
  {
    source: '/pg-hostel',
    destination: '/pghostels',
    permanent: true,
  },
  {
    source: '/religious',
    destination: '/religious-services',
    permanent: true,
  }
  ```

### Fix 3: Remove Viewport Pinch-to-Zoom Restriction
- **File:** `Doorstep-Hub-Website/app/layout.js`
- **Action:** Update viewport export:
  ```javascript
  export const viewport = {
    width: 'device-width',
    initialScale: 1,
  };
  ```

### Fix 4: Correct Spelling Errors in Root Metadata
- **File:** `Doorstep-Hub-Website/app/layout.js`
- **Action:** Replace typos in `metadata.description`:
  - *"Spa & Saloon"* -> *"Spa & Salon"*
  - *"Booking Sytem"* -> *"Booking System"*

### Fix 5: Align XML Sitemap Cross-Canonical Mismatch
- **File:** `Doorstep-Hub-Website/app/lib/seo/sitemapManager.js`
- **Action:** Remove `/blog` entry from `STATIC_ROUTES` or redirect `/blog` permanently to `/knowledge`.

### Fix 6: Server Pre-rendering for City Landing Pages
- **File:** `Doorstep-Hub-Website/app/appliances/repair-service/[citySlug]/page.js`
- **Action:** Refactor page from client component with `Loader2` to Server Component with `generateMetadata()` and Streaming Suspense.
