# Doorstep Hub — Structured Data & Schema.org Implementation Report

**Date:** November 14, 2026  
**Format:** JSON-LD (`<script type="application/ld+json">`)  

---

## 1. Implemented Schema Entities

### 1.1 Organization & WebSite (`app/(landing)/page.jsx`)
- **`@type: "Organization"`**
  - Name: Doorstep Hub
  - URL: `https://doorstephub.com`
  - Logo: `https://doorstephub.com/d-hub-logo.png`
  - Telephone: `+91 8886688666`
  - Area Served: `IN`
  - Languages: `["en", "te", "hi"]`
- **`@type: "WebSite"`**
  - SearchAction query input pointing to `https://doorstephub.com/results?search={search_term_string}`

### 1.2 City Appliance Service Hub (`app/appliances/repair-service/[citySlug]/page.js`)
- **`@type: "Service"`**
  - Name: Appliance Repair Service Center in {City}
  - AreaServed: `{"@type": "City", "name": "{City}"}`
  - Provider: Doorstep Hub
  - **`hasOfferCatalog` Correction:** Corrected `itemListElement` URLs from legacy `/appliances/repair-service/{city}/{cat}` to canonical flat public URLs (`buildApplianceCategoryCityPublicPath(cat.slug, citySlug)`).

### 1.3 Knowledge Base Articles (`app/knowledge/[slug]/page.js`)
- **`@type: "Article"`**
  - Headline, Image, DatePublished, DateModified
  - Publisher & Author: Doorstep Hub
  - `mainEntityOfPage`: `https://doorstephub.com/knowledge/{slug}` (Fixed Next.js 16 Promise resolution)
