# Doorstep Hub — Internal & External Linking Architecture Report

**Date:** November 14, 2026  
**Auditor/Engineer:** Senior Technical SEO Architect  

---

## 1. Executive Summary

A robust internal linking architecture distributes PageRank (link equity) from high-authority pages (homepage, service hubs) down into long-tail conversion pages (city hubs, specific service booking pages).

Prior to this implementation, several promotional modules linked to legacy non-canonical endpoints (specifically `/appliance-repair-services`), creating redirect hops and diluting crawl equity.

---

## 2. Internal Linking Corrections Implemented

### 2.1 Elimination of `/appliance-repair-services` Internal Links
- **`app/components/landing/HomeExclusiveOffersSection.jsx`:**
  - Updated 5 internal promotional coupon click handlers from `/appliance-repair-services` to `/appliances`.
- **`app/offers/page.jsx`:**
  - Updated 5 coupon redemption routing paths from `/appliance-repair-services` to `/appliances`.
- **`app/(landing)/page.jsx`:**
  - Updated fallback redirect from `/appliance-repair-services` to `/appliances`.
- **`app/appliances/repair-service/[citySlug]/page.js`:**
  - Updated back button click handler from `/appliance-repair-services` to `/appliances`.
- **`app/components/ui/Animated404.jsx`:**
  - Updated 5-second automatic redirect from `/appliance-repair-services` to `/appliances`.

### 2.2 Cross-Vertical Contextual Routing Fixes
- **`app/components/pghostels/NewHostelDetailPage.jsx`:**
  - Previously redirected to `/appliance-repair-services` on hostel fetch error.
  - Corrected to redirect to `/pghostels`.
- **`app/components/knowledge/ArticleViewPage.jsx`:**
  - Previously redirected to `/appliance-repair-services` on article fetch error.
  - Corrected to redirect to `/knowledge`.
- **`app/components/religious/ReligiousServiceDetailPage.jsx`:**
  - Previously redirected to `/appliance-repair-services` on service fetch error.
  - Corrected to redirect to `/religious-services`.

### 2.3 Help Center to Service Hub Deep Linking
In `app/components/help-center/helpCenterData.js`:
All 6 primary service categories link directly to their corresponding booking hubs:
- Appliance Repair: `/book-appointment`
- Salon & Beauty: `/spa-salon`
- Pet Care: `/spa-salon`
- PG & Hostels: `/pghostels` (fixed in Phase 1 from `/pg-hostel`)
- Pooja Services: `/religious-services` (fixed in Phase 1)
- Buy & Sell: `/sell-buy`
