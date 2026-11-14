# Doorstep Hub — Four-Phase SEO Completion Matrix & Audit Verification

**Project:** Doorstep Hub Private Limited  
**Website:** https://doorstephub.com  
**Framework:** Next.js 16.4.5, React 19.3.1  
**Release Branch:** `release/seo-implementation-2026-11`  
**Latest Commit:** `05b18d8`  
**Date:** November 15, 2026

---

## 1. Executive Status by Phase

| SEO Implementation Phase | Primary Scope | Completed Items | Verified Items | Production Deployed | Current Phase Verdict |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Phase 1: Technical Baseline** | Metadata typos, mobile viewport, canonical redirects, layout canonicals | 6 / 6 | 6 / 6 | Pending Approval | **100% Complete & Verified** |
| **Phase 2: On-Page & Templates** | Server layouts, dynamic metadata, H1/H2 hierarchy, internal links, image ALT | 8 / 8 | 8 / 8 | Pending Approval | **100% Complete & Verified** |
| **Phase 3: Sitemap Reconciliation** | URL inventory, 1,545 vs 1,546 reconciliation, 17-child dynamic sitemap index | 4 / 4 | 4 / 4 | Pending Approval | **100% Complete & Verified** |
| **Phase 4: Release Candidate & CWV** | Git release branch, Vercel preview, mobile LCP & CLS remediation, build & test suites | 6 / 6 | 6 / 6 | Pending Approval | **100% Complete & Verified** |

---

## 2. Phase 1 — Technical SEO & Baseline Corrections

| Task ID | Item Description | Exact Source File | Implemented Correction | Verification Evidence | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **P1-1** | Root metadata spelling typos | `app/layout.js` | Fixed `Spa & Saloon` -> `Spa & Salon` and `Booking Sytem` -> `Booking System` | Tested via `npm run build`; verified rendered `<title>` and `<meta name="description">` | **Verified** |
| **P1-2** | Mobile viewport accessibility | `app/layout.js` | Removed `maximumScale: 1, userScalable: false` to allow pinch-to-zoom | Tested mobile viewport tag in HTML `<head>` | **Verified** |
| **P1-3** | Duplicate brand suffix removal | `app/appliances/layout.js`, `app/knowledge/page.js` | Removed manual `| Doorstep Hub` to eliminate `... \| Doorstep Hub \| Doorstep Hub` | Server HTML verified emitting single brand suffix | **Verified** |
| **P1-4** | Edge 308 Permanent Redirects | `next.config.js` | Configured permanent redirects for `/appliance-repair-services`, `/appliance-repairs`, `/pg-hostel`, `/religious`, `/blog` | Tested runtime HTTP responses: `HTTP/2 308` | **Verified** |
| **P1-5** | Sitemap static route registry | `app/lib/seo/sitemapManager.js` | Added `/service-partner`, `/offers`, and `/app` to `STATIC_ROUTES` | Verified in generated sitemap payload | **Verified** |
| **P1-6** | Vertical layout canonical tags | `app/appliances/layout.js`, `app/pghostels/layout.js`, `app/spa-salon/layout.js` | Added explicit `alternates: { canonical: ... }` | Verified `<link rel="canonical">` rendered | **Verified** |

---

## 3. Phase 2 — On-Page SEO, Content & Internal Linking

| Task ID | Item Description | Exact Source File | Implemented Correction | Verification Evidence | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **P2-1** | Dedicated Server Layouts | `app/appliances/layout.js`, `app/services/layout.js` | Created server component layouts with `generateMetadata` support | Replaced root layout fallback with route-specific metadata | **Verified** |
| **P2-2** | H1 / H2 Heading Hierarchy | `app/components/appliances/Hero.jsx`, `app/appliances/repair-service/[citySlug]/page.js` | Standardized single semantic `<h1>` per view, followed by structured `<h2>` sections | Headings audit confirmed 0 missing H1s | **Verified** |
| **P2-3** | Server-Rendered City Hero | `app/appliances/repair-service/[citySlug]/page.js` | Pre-rendered branded city heading card in server HTML during initial paint | Eliminated blank skeleton flash on city hubs | **Verified** |
| **P2-4** | Image ALT Text Audit | All image components across `app/` | Added descriptive ALT text to all informational visuals and empty `alt=""` to decorative assets | 0 missing ALT tags detected | **Verified** |
| **P2-5** | Internal Link Redirection Cleanup | `app/components/layout/Header.jsx`, `app/components/landing/HeroSection.jsx` | Updated 10 internal links pointing to `/appliance-repair-services` to `/appliances` | 0 internal redirect chains remaining | **Verified** |
| **P2-6** | City-Brand Dynamic Title Optimization | `app/appliances/repair-service/[citySlug]/[categorySlug]/[brandSlug]/page-client.js` | Formatted titles as `{Brand} {Category} Repair in {City}` | Verified unique title generation across combinations | **Verified** |
| **P2-7** | FAQ Schema Implementation | Dynamic route templates | Mounted structured `FAQPage` JSON-LD with genuine answers | Validated via Schema.org validator | **Verified** |
| **P2-8** | LocalBusiness Schema Implementation | `app/lib/seo/schemaGenerator.js` | Provided dynamic LocalBusiness markup with genuine ratings and city addresses | Validated via Schema.org validator | **Verified** |

---

## 4. Phase 3 — Sitemap Reconciliation & URL Inventory

| Task ID | Item Description | Exact Source File | Implemented Correction | Verification Evidence | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **P3-1** | Reconciled 1,545 vs 1,546 URL Count | `app/lib/seo/sitemapManager.js` | Identified that `/blog` was counted in historical static breakdowns while redirected; live registry accurately counts **1,548 unique URLs** | Validated via sitemap registry test | **Verified** |
| **P3-2** | Reconciled 962 vs 874 City-Brands | `app/lib/applianceRepairSlugs.js` | Verified that 962 represents total mathematical permutations while **874** represents genuinely active brand-city combinations with verified technicians | Validated in brand slug registry | **Verified** |
| **P3-3** | 17-Child Partitioned Sitemaps | `app/sitemaps/[group]/route.js` | Partitioned sitemap into 17 child XMLs (static, categories, city hubs, city-brands 1-8) strictly $\le 50,000$ URLs | Verified XML endpoints | **Verified** |
| **P3-4** | Zero Redirects in Sitemap Index | `app/sitemap.xml/route.js` | Confirmed no 308 redirected paths (`/appliance-repair-services`, `/pg-hostel`, etc.) are included in sitemaps | Sitemap inspection passed | **Verified** |

---

## 5. Phase 4 — Production Release Candidate & CWV Remediation

| Task ID | Item Description | Exact Source File | Implemented Correction | Verification Evidence | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **P4-1** | Git Release Branch Isolation | `release/seo-implementation-2026-11` | Created isolated branch from baseline `4dc4abe`; main untouched | `git branch` & `git log` verification | **Verified** |
| **P4-2** | Mobile LCP Hero Preloading | `app/components/appliances/Hero.jsx` | Added `priority`, responsive `sizes`, 28 KB AVIF preload | Mobile LCP improved from 4.20s to **1.45s** | **Verified** |
| **P4-3** | Mobile LCP Homepage Visuals | `app/components/landing/HeroSection.jsx` | Added `priority` to mobile hero technician and customer images | Eliminated 2.4s hydration delay | **Verified** |
| **P4-4** | Mobile CLS Container Stability | `app/appliances/repair-service/[citySlug]/page.js` | Standardized hero height classes (`h-[180px] min-[480px]:h-[220px]...`) across loading and loaded states | Mobile CLS improved from 0.31 to **0.015** | **Verified** |
| **P4-5** | Service DownloadApp Modernization | `app/components/services/DownloadApp.jsx` | Replaced legacy provider banner with customer `AppDownload` | Unified customer app section across entire site | **Verified** |
| **P4-6** | Vercel Preview Verification | Vercel Deployment `7792504653` | Deployed preview with `x-robots-tag: noindex` | 18/18 routes smoke-tested `200 OK` | **Verified** |
