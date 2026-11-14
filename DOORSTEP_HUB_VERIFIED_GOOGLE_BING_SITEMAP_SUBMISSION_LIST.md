# DOORSTEP HUB — VERIFIED GOOGLE & BING SITEMAP SUBMISSION LIST

**Project:** Doorstep Hub Private Limited  
**Domain:** https://doorstephub.com  
**Primary Index:** `https://doorstephub.com/sitemap.xml`  
**Architecture:** Next.js Dynamic XML Sitemap Index with 17 Modular Sub-Sitemaps  
**Date:** November 14, 2026  
**Status:** **READY FOR SUBMISSION UPON PRODUCTION DEPLOYMENT**

---

> [!CAUTION]
> **CRITICAL RELEASE INSTRUCTION: DO NOT SUBMIT BEFORE PRODUCTION DEPLOYMENT**  
> Do not submit these sitemap URLs to Google Search Console or Bing Webmaster Tools until the verified codebase (including new dynamic layouts, edge 308 redirects, and pre-rendered server components) is **merged and deployed to the Vercel production environment**.  
> Submitting sitemaps while production runs legacy code will trigger crawl errors, canonical mismatch warnings, and unnecessary crawl budget wastage.

---

## 1. Master Sitemap Submission Target

For both Google Search Console and Bing Webmaster Tools, submitting the **Primary Master Sitemap Index** is sufficient. Googlebot and Bingbot will automatically discover, fetch, and process all 17 child sitemaps listed inside the index.

```
https://doorstephub.com/sitemap.xml
```

---

## 2. Complete Inventory of All 17 Child Sitemaps

In addition to submitting the master sitemap index, webmasters may optionally submit the child sitemaps individually if granular indexation tracking per vertical is desired:

| # | Child Sitemap URL | Vertical / Scope | Expected Live Entries | Crawl Priority | Change Freq |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `https://doorstephub.com/sitemap/static-pages-1.xml` | Core static brand pages (Home, About, Contact, Privacy, Terms, Offers, Apps, etc.) | 39 | 0.8 - 1.0 | Daily / Weekly |
| **2** | `https://doorstephub.com/sitemap/services-1.xml` | Top-level appliance repair & home service hubs | 4 - 6 | 0.9 | Weekly |
| **3** | `https://doorstephub.com/sitemap/cities-1.xml` | Major city appliance repair landing hubs (`/appliances-repair-service-center-{city}`) | 26 | 0.9 | Daily |
| **4** | `https://doorstephub.com/sitemap/categories-1.xml` | Appliance category hubs (`/appliances/{catSlug}`) | 8 | 0.8 | Weekly |
| **5** | `https://doorstephub.com/sitemap/subcategories-1.xml` | Appliance sub-services and detail pages | 23 | 0.7 | Weekly |
| **6** | `https://doorstephub.com/sitemap/brands-1.xml` | Appliance brand landing pages (`/appliances/brand/{brandSlug}`) | 37 | 0.8 | Weekly |
| **7** | `https://doorstephub.com/sitemap/city-categories-1.xml` | City + Category combinations (`/{catSlug}-center-{city}`) | 208 | 0.8 | Daily |
| **8** | `https://doorstephub.com/sitemap/city-brands-1.xml` | City + Brand combinations (`/{brandSlug}-appliance-repair-services-in-{city}`) | 874 - 962 | 0.8 | Daily |
| **9** | `https://doorstephub.com/sitemap/city-services-1.xml` | Direct service + city URLs (`/nearby/{service}/{city}`) | 130 | 0.8 | Daily |
| **10** | `https://doorstephub.com/sitemap/pghostels-1.xml` | PG & Hostel marketplace listings, cities, and detail views | 58 | 0.7 | Daily |
| **11** | `https://doorstephub.com/sitemap/spa-salon-1.xml` | Spa & Salon categories, subcategories, and rate cards | 11 | 0.7 | Weekly |
| **12** | `https://doorstephub.com/sitemap/religious-1.xml` | Pooja & religious service listings, festivals, and categories | 11 | 0.7 | Weekly |
| **13** | `https://doorstephub.com/sitemap/amc-1.xml` | Annual Maintenance Contract (AMC) plans and packages | 3 | 0.6 | Monthly |
| **14** | `https://doorstephub.com/sitemap/professional-categories-1.xml` | Professional business category directory | Dynamic | 0.6 | Monthly |
| **15** | `https://doorstephub.com/sitemap/professional-subcategories-1.xml`| Professional business subcategory directory | Dynamic | 0.6 | Monthly |
| **16** | `https://doorstephub.com/sitemap/sell-buy-1.xml` | Buy & Sell classifieds marketplace categories | 2 | 0.6 | Daily |
| **17** | `https://doorstephub.com/sitemap/images-1.xml` | Google Image Sitemap for service thumbnails and infographics | 1,264+ | 0.5 | Monthly |

---

## 3. Step-by-Step Submission Instructions

### A. Google Search Console (GSC)

1. Navigate to **Google Search Console** (`https://search.google.com/search-console`).
2. Select the property: `https://doorstephub.com` (Domain or URL Prefix property).
3. In the left navigation menu under **Indexing**, click **Sitemaps**.
4. In the **Add a new sitemap** input field:
   - Enter: `sitemap.xml`
   - Click **Submit**.
5. Verify that Google acknowledges submission with status: **Success** (Green).
6. *(Optional)* Submit high-priority child sitemaps for immediate tracking:
   - `sitemap/cities-1.xml`
   - `sitemap/city-brands-1.xml`
   - `sitemap/city-categories-1.xml`

### B. Bing Webmaster Tools (BWT)

1. Navigate to **Bing Webmaster Tools** (`https://www.bing.com/webmasters`).
2. Select the `doorstephub.com` profile.
3. In the left navigation menu, expand **Sitemaps**.
4. Click the **Submit sitemap** button in the upper right.
5. In the input modal, enter:
   ```
   https://doorstephub.com/sitemap.xml
   ```
6. Click **Submit**.
7. Confirm that the status switches to **Processing** or **Success**.

---

## 4. Robots.txt Auto-Discovery Verification

The production `robots.txt` file automatically points crawlers to the verified master sitemap index:

```txt
User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /payment
Disallow: /customer/
Disallow: /service-partner/
Disallow: /admin/
Disallow: /api/

Sitemap: https://doorstephub.com/sitemap.xml
```

---

## 5. Post-Submission Monitoring Schedule

| Timeline | Action Required | Expected Status |
| :--- | :--- | :--- |
| **Hour 0 - 24** | Inspect GSC **Sitemaps** report | Status: `Success`; Discoverable URLs populated. |
| **Day 2 - 3** | Check GSC **Page indexing** report | Crawled - currently not indexed / Indexed trends. |
| **Day 7** | Review **Index Coverage** | Valid pages should increase significantly across city-brand and category URLs. |
| **Day 14** | Check GSC **Enhancements** | Schema.org `Service`, `Organization`, `FAQPage`, `BreadcrumbList` valid with 0 errors. |
| **Day 30** | Monitor **Performance (Search Results)** | Impressions, CTR, and average position tracking for city service keywords. |
