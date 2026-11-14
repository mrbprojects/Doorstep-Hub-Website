# Doorstep Hub — Google Search Console & Bing Webmaster Tools Submission Guide

**Domain:** `https://doorstephub.com`  
**Execution Phase:** Phase 9 (Post-Deployment Sitemap Submission)  

---

## 1. Verified XML Sitemap Endpoints

Doorstep Hub features an enterprise dynamically-chunked sitemap architecture that automatically scales to handle thousands of entities without breaching search engine payload limits.

### 1.1 Primary Sitemap Index Endpoint
The single main sitemap index URL to submit to search engines is:
👉 **`https://doorstephub.com/sitemap.xml`**

### 1.2 Child Sitemap Manifests Included in Index
- `https://doorstephub.com/sitemaps/static.xml` — Verified public static routes
- `https://doorstephub.com/sitemaps/city.xml` — Operational city hub landing pages
- `https://doorstephub.com/sitemaps/category.xml` — Primary service categories
- `https://doorstephub.com/sitemaps/brand.xml` — Verified appliance & tech brands
- `https://doorstephub.com/sitemaps/city_category.xml` — Localized city + category landing pages
- `https://doorstephub.com/sitemaps/city_brand.xml` — Localized city + brand repair hubs
- `https://doorstephub.com/sitemaps/city_service.xml` — Localized specific service routes
- `https://doorstephub.com/sitemaps/help_center.xml` — Help Center troubleshooting articles
- `https://doorstephub.com/sitemaps/pghostels.xml` — Verified PG & hostel accommodations
- `https://doorstephub.com/sitemaps/spa_salon.xml` — Salon & spa at home services
- `https://doorstephub.com/sitemaps/religious.xml` — Pooja & pandit rituals
- `https://doorstephub.com/sitemaps/amc.xml` — Annual maintenance contract plans
- `https://doorstephub.com/sitemaps/sell_buy.xml` — Marketplace listings

---

## 2. Step-by-Step Google Search Console Submission

1. **Log in:** Open [Google Search Console](https://search.google.com/search-console) with the verified owner account.
2. **Select Property:** Choose the Domain property `doorstephub.com` or URL prefix `https://doorstephub.com`.
3. **Navigate to Sitemaps:** In the left sidebar under *Indexing*, click **Sitemaps**.
4. **Enter Sitemap URL:**
   - Under *Add a new sitemap*, enter: `sitemap.xml`
5. **Click Submit:** Press **SUBMIT**.
6. **Verify Status:** Check that the status reads **"Success"** and shows the discovered URL count.
7. **URL Inspection & Live Test:**
   - Test key priority pages (`https://doorstephub.com`, `https://doorstephub.com/appliances`, `https://doorstephub.com/app`).
   - Click **Request Indexing** for the updated homepage to accelerate re-crawling.

---

## 3. Step-by-Step Bing Webmaster Tools Submission

1. **Log in:** Open [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. **Select Site:** Select `https://doorstephub.com`.
3. **Navigate to Sitemaps:** In the left menu under *Configure My Site*, click **Sitemaps**.
4. **Submit Sitemap URL:**
   - Click **Submit sitemap**.
   - Paste: `https://doorstephub.com/sitemap.xml`
   - Click **Submit**.
5. **Verify IndexNow Integration:** Doorstep Hub has integrated IndexNow (`app/api/seo/indexnow/route.js`). Ensure that Microsoft Bing receives real-time pings on page updates.
