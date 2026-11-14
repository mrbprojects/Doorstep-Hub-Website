# ADSENSE_LOW_VALUE_CONTENT_REPORT.md
# Google AdSense Phase 2: Root-Cause Investigation of "Low Value Content"

**Project**: Doorstep Hub Private Limited  
**Target Domain**: https://doorstephub.com  
**Audit Date**: November 2026  
**Auditor**: Antigravity Quality & Compliance Automation  

---

## 1. Context & Google Policy Standards

Google AdSense rejects websites under the "Low value content" violation when an automated reviewer or human auditor observes:
1. **Thin, Templated, or Placeholder Pages**: Pages with minimal original prose, incomplete tables, or placeholder data.
2. **Empty or Wall-Gated States Indexed by Crawlers**: Transactional pages (empty shopping carts, login-redirected accounts, post-booking confirmations) indexed without `noindex` metadata.
3. **Internal Data Inconsistencies**: Conflicting counts or broken filters that suggest stale, uncurated, or broken site navigation.
4. **Lack of Original Information**: Aggregated links or copied category listings without unique diagnostic troubleshooting, procedures, safety instructions, or localized context.
5. **Missing Ad Serving Signals**: An ads.txt file without corresponding `<head>` verification scripts on canonical public entry points.

---

## 2. Identified Root Causes for Doorstep Hub

### Root Cause 1: Crawling of Empty / Auth-Walled Transactional Routes
- **Finding**: Routes including `/account`, `/account/bookings`, `/account/wallet`, `/appliances/cart`, `/appliances/checkout`, `/services/cart`, `/partner/dashboard`, and `/sell-buy/dashboard` inherited `robots: { index: true, follow: true }` from the root layout.
- **Impact**: Googlebot crawled these URLs without user session cookies. The crawler received redirect triggers or client-rendered empty states ("Your cart is empty", "Please login to view account"). AdSense algorithms evaluate these responses as thin, zero-value pages.
- **Remediation**: Implemented 22 Next.js server layouts exporting `robots: { index: false, follow: false }` and updated `app/robots.js` with comprehensive disallow rules.

### Root Cause 2: Help Center Article Discrepancy (30 vs 24)
- **Finding**: In `app/help-center/[categorySlug]/page.jsx`, an ad-hoc keyword matching fallback loop placed 6 articles into `appliance-repair`:
  1. *"How Do I Contact a PG or Hostel Owner?"*
  2. *"What Facilities Should I Look for in a Hostel?"*
  3. *"How Do I Contact the Pandit About Ceremony Requirements?"*
  4. *"How Do I Contact a Salon Provider About My Booking?"*
  5. *"How Can Buyers and Sellers Avoid Online Marketplace Scams?"*
  6. *"How Can I Contact a Seller Safely?"*
- **Impact**: When Googlebot or an AdSense reviewer visited `/help-center/appliance-repair`, the left navigation bar announced **30 articles**, but only **24** articles were actually listed. Meanwhile, the root `/help-center` accurately stated **24 articles**. This discrepancy triggered Google's automated quality filter for inconsistent content indexing.
- **Remediation**: Replaced the ad-hoc fallback with canonical `art.categorySlug` resolved by `normalizeArticle()`. All help center routes now strictly reflect the true 24, 12, 10, 8, 11, and 9 counts across all views.

### Root Cause 3: High-Value Content Sections Omitted from XML Sitemaps
- **Finding**: Central `sitemapManager.js` omitted `/help-center`, its 6 vertical subcategories, and `/sell-buy`, while including internal duplicate paths.
- **Impact**: Googlebot discovered pages via crawling rather than authoritative sitemap indexation, causing crawler discovery lag on original editorial guides.
- **Remediation**: Added all 7 Help Center hubs and Sell & Buy hubs to `STATIC_ROUTES`. Verified with `npm run seo:validate-sitemaps` (58 unique canonical URLs, 0 errors).

### Root Cause 4: AdSense Script Missing from Root SSR `<head>`
- **Finding**: `app/layout.js` did not inject the official Google AdSense script tag into `<head>`. The script was loaded only via a client-side `useEffect` in `AdSenseScriptLoader.jsx` within specific Sell & Buy sub-components.
- **Impact**: When Google’s review robot visited the homepage, it failed to detect the AdSense script tag in the SSR response, conflicting with the site's `ads.txt` record.
- **Remediation**: Embedded the official async AdSense script `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9096117264343047" crossorigin="anonymous"></script>` directly in `app/layout.js` `<head>`.

---

## 3. Verticals Content Originality Review

| Business Vertical | Originality Assessment | Value Signals Present |
|---|---|---|
| **Appliance Repair** | **High** | In-depth troubleshooting steps, safety precautions, spare part replacement guidelines, brand-specific diagnostic symptom charts (AC, Refrigerator, Washing Machine, LED TV, Microwave, Geyser, Water Purifier). |
| **Salon & Beauty** | **High** | Hygiene protocols, single-use kit assurances, patch testing advisories, transparent beautician qualifications. |
| **Pet Care** | **High** | Stress-free grooming handling, pet vaccination prerequisites, breed-specific coat maintenance tips. |
| **PG & Hostels** | **High** | Deposit terms, room-sharing options, food menu disclosures, CCTV and warden security, curfew rules. |
| **Religious Services** | **High** | Authentic Vedic samagri lists, ritual steps, pandit language options, auspicious day requirements. |
| **Buy & Sell Old Things** | **High** | Community safety guidelines, anti-fraud warnings, phone OTP verification for sellers, fair-pricing estimations. |
