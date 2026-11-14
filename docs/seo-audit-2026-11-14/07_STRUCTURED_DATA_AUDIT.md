# Doorstep Hub — Schema.org Structured Data & Rich Results Audit

**Audit Date:** November 14, 2026  
**Auditor:** Technical SEO & Schema Architect  
**Evaluation Standard:** Schema.org Core Specification & Google Search Central Structured Data Guidelines  

---

## 1. Structured Data Inventory & Coverage

Doorstep Hub implements JSON-LD structured data across several key templates:

| Schema Type | Location / Component | Current Implementation | Google Rich Result Eligibility | Audit Verdict |
|---|---|---|---|---|
| **Organization** | `app/(landing)/page.jsx` | `@type: Organization`, name, logo, contactPoint, sameAs | Knowledge Panel | Valid & Compliant |
| **WebSite** | `app/(landing)/page.jsx` | `@type: WebSite`, name, url, SearchAction | Sitelinks Search Box | Valid & Compliant |
| **Article** | `app/knowledge/[slug]/page.js`, `help-center/[...]/page.jsx` | `@type: Article`, headline, image, dates, author, publisher | Article Rich Snippet | Valid (Needs awaited params) |
| **FAQPage** | `app/help-center/[categorySlug]/page.jsx`, `app/(legal)/faqs/page.jsx` | `@type: FAQPage`, mainEntity (Question, acceptedAnswer) | FAQ Rich Results | Valid & Compliant |
| **Service** | `app/appliances/repair-service/[citySlug]/page.js` | `@type: Service`, name, areaServed, hasOfferCatalog | General Snippet | Needs Upgrade to LocalBusiness |
| **LocalBusiness** | `app/appliances/repair-service/[citySlug]/page.js` | **MISSING** | Local Business Pack / Maps | **Non-Compliant (Missing)** |
| **BreadcrumbList**| `app/components/help-center/HelpBreadcrumb.jsx` | Implemented only in Help Center | Breadcrumb Rich Snippet | **Missing on Category/City Hubs**|

---

## 2. Key Deficiencies & Implementation Errors

### 2.1 Issue 1: Missing `LocalBusiness` Schema on City Hubs
- **Current State:** City landing pages (e.g. `https://doorstephub.com/appliances-repair-service-center-hyderabad`) implement `@type: "Service"`.
- **Limitation:** Google Search uses `LocalBusiness` (or `HomeAndConstructionBusiness`) to power Google Maps integrations, phone click-to-call snippets, and local pack listings.
- **Recommended Schema Enhancement:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "Doorstep Hub Appliance Repair Service Center Hyderabad",
    "image": "https://doorstephub.com/d-hub-logo.png",
    "@id": "https://doorstephub.com/appliances-repair-service-center-hyderabad",
    "url": "https://doorstephub.com/appliances-repair-service-center-hyderabad",
    "telephone": "+918886688666",
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.3850,
      "longitude": 78.4867
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "21:00"
    }
  }
  ```

### 2.2 Issue 2: Legacy URLs Injected into `hasOfferCatalog`
- In `app/appliances/repair-service/[citySlug]/page.js`, the offer catalog injects:
  `url: https://doorstephub.com/appliances/repair-service/${citySlug}/${cat.slug}`
- These URLs are legacy routes that canonicalize to `https://doorstephub.com/${cat}-service-center-${city}`. Google expects canonical URLs in structured data.

### 2.3 Issue 3: Missing `BreadcrumbList` on Deep Category Pages
- Category, subcategory, and city pages do not render Schema.org `BreadcrumbList`. Adding breadcrumb markup allows Google to display clean navigational breadcrumb trails in mobile SERPs.
