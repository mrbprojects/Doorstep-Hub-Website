# DOORSTEP HUB — FINAL VERIFIED SITEMAP SUBMISSION PACKAGE

**Project:** Doorstep Hub Private Limited  
**Website:** https://doorstephub.com  
**Master Sitemap Index:** `https://doorstephub.com/sitemap.xml`  
**Architecture:** Next.js Dynamic XML Sitemap Index with 17 Modular Sub-Sitemaps  
**Current Date:** November 15, 2026  
**Status:** **READY FOR SUBMISSION — PRODUCTION VERIFICATION PENDING UNTIL DEPLOYED**

---

> [!CAUTION]
> **CRITICAL RELEASE INSTRUCTION: DO NOT SUBMIT SITEMAPS BEFORE PRODUCTION DEPLOYMENT**  
> **Production Verification Status:** **PENDING DEPLOYMENT**  
> Do not submit these sitemap URLs to Google Search Console or Bing Webmaster Tools until the approved release candidate (Commit `5fe66f7` on branch `release/seo-implementation-2026-11`) is **merged into `main` and promoted to production on Vercel**.  
> Submitting sitemaps while production runs legacy code will trigger crawl errors, canonical mismatch warnings, and crawl budget wastage.

---

## 1. Master Sitemap Submission Target

For both Google Search Console and Bing Webmaster Tools, submitting the **Primary Master Sitemap Index** is the recommended best practice. Search engine crawlers will automatically discover, fetch, and process all 17 child sitemaps listed inside the index.

```
https://doorstephub.com/sitemap.xml
```

---

## 2. Complete Inventory of All 17 Child Sitemaps

| # | Child Sitemap URL | Vertical / Entity Scope | Live DB URL Count | Change Freq | Crawl Priority | Production Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `https://doorstephub.com/sitemap/static-pages-1.xml` | Core static brand pages (Home, About, Contact, Apps, Offers) | 39 URLs | Daily / Weekly | 0.8 – 1.0 | **Pending Deployment** |
| **2** | `https://doorstephub.com/sitemap/services-1.xml` | Top-level appliance repair & home service hubs | 4–6 URLs | Weekly | 0.9 | **Pending Deployment** |
| **3** | `https://doorstephub.com/sitemap/cities-1.xml` | Major city appliance repair landing hubs (`/appliances-repair-service-center-{city}`) | 26 URLs | Daily | 0.9 | **Pending Deployment** |
| **4** | `https://doorstephub.com/sitemap/categories-1.xml` | Appliance category hubs (`/appliances/{catSlug}`) | 8 URLs | Weekly | 0.8 | **Pending Deployment** |
| **5** | `https://doorstephub.com/sitemap/subcategories-1.xml` | Appliance sub-services and detail pages | 23 URLs | Weekly | 0.7 | **Pending Deployment** |
| **6** | `https://doorstephub.com/sitemap/brands-1.xml` | Appliance brand landing pages (`/appliances/brand/{brandSlug}`) | 37 URLs | Weekly | 0.8 | **Pending Deployment** |
| **7** | `https://doorstephub.com/sitemap/city-categories-1.xml` | City + Category combinations (`/{catSlug}-center-{city}`) | 208 URLs | Daily | 0.8 | **Pending Deployment** |
| **8** | `https://doorstephub.com/sitemap/city-brands-1.xml` | City + Brand combinations (`/{brandSlug}-...-in-{city}`) | 874–962 URLs | Daily | 0.8 | **Pending Deployment** |
| **9** | `https://doorstephub.com/sitemap/city-services-1.xml` | Direct service + city URLs (`/nearby/{service}/{city}`) | 130 URLs | Daily | 0.8 | **Pending Deployment** |
| **10** | `https://doorstephub.com/sitemap/pghostels-1.xml` | PG & Hostel listings, cities, and detail views | 58 URLs | Daily | 0.7 | **Pending Deployment** |
| **11** | `https://doorstephub.com/sitemap/spa-salon-1.xml` | Spa & Salon categories, subcategories, and rate cards | 11 URLs | Weekly | 0.7 | **Pending Deployment** |
| **12** | `https://doorstephub.com/sitemap/religious-1.xml` | Pooja & religious service listings, festivals, and categories | 11 URLs | Weekly | 0.7 | **Pending Deployment** |
| **13** | `https://doorstephub.com/sitemap/amc-1.xml` | Annual Maintenance Contract (AMC) packages | 3 URLs | Monthly | 0.6 | **Pending Deployment** |
| **14** | `https://doorstephub.com/sitemap/professional-categories-1.xml` | Professional business category directory | Dynamic | Monthly | 0.6 | **Pending Deployment** |
| **15** | `https://doorstephub.com/sitemap/professional-subcategories-1.xml`| Professional business subcategory directory | Dynamic | Monthly | 0.6 | **Pending Deployment** |
| **16** | `https://doorstephub.com/sitemap/sell-buy-1.xml` | Buy & Sell classifieds marketplace categories & listings | 2–40 URLs | Daily | 0.6 | **Pending Deployment** |
| **17** | `https://doorstephub.com/sitemap/images-1.xml` | Google Image Sitemap for service thumbnails & banners | 1,264+ Images | Monthly | 0.5 | **Pending Deployment** |

---

## 3. Step-by-Step Submission Instructions

### A. Google Search Console (GSC)

1. Open **Google Search Console** (`https://search.google.com/search-console`).
2. Select property: `https://doorstephub.com`.
3. In the left navigation, click **Sitemaps** under **Indexing**.
4. In the **Add a new sitemap** input field:
   - Enter: `sitemap.xml`
   - Click **Submit**.
5. Confirm status: **Success** (Green).
6. Google will automatically discover all 17 child sub-sitemaps.

### B. Bing Webmaster Tools (BWT)

1. Open **Bing Webmaster Tools** (`https://www.bing.com/webmasters`).
2. Select property `doorstephub.com`.
3. In the left navigation menu, expand **Sitemaps**.
4. Click **Submit sitemap**.
5. Enter: `https://doorstephub.com/sitemap.xml` and click **Submit**.
6. Confirm status: **Processing / Success**.

---

## 4. Google Search Console Mobile LCP Fix Validation

After deploying the performance fixes to production:
1. Navigate to **Google Search Console** $\rightarrow$ **Core Web Vitals** $\rightarrow$ **Mobile**.
2. Click on the issue: `LCP issue: longer than 4s (mobile)`.
3. Click the blue **VALIDATE FIX** button.
4. **Monitoring Period (28 Days):** Google will monitor real-user performance data over a 28-day rolling window as Indian mobile users access the optimized sub-28KB AVIF hero images.
5. Once sufficient field measurements are recorded with LCP $\le$ 2.5s, Search Console will mark the validation as **Passed**.
