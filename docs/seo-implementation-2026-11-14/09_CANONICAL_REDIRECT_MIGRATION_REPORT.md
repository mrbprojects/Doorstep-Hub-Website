# Doorstep Hub — Canonical URL & Redirect Migration Report

**Date:** November 14, 2026  
**Protocol:** HTTP 308 Permanent Edge Redirects  

---

## 1. Redirect Configuration Matrix (`Doorstep-Hub-Website/next.config.js`)

All legacy, duplicate, and non-canonical endpoints have been configured with permanent edge redirects:

| Source URL | Target Destination | Redirect Status | Rationale |
| :--- | :--- | :--- | :--- |
| `http://doorstephub.com/*` | `https://doorstephub.com/*` | 308 Permanent | Enforce HTTPS protocol globally across all endpoints |
| `/pg-hostel` | `/pghostels` | 308 Permanent | Eliminate legacy client-only JS redirect and soft-404 |
| `/religious` | `/religious-services` | 308 Permanent | Consolidate legacy short slug to canonical hub |
| `/appliance-repair-services` | `/appliances` | 308 Permanent | Consolidate duplicate appliance hub into canonical URL |
| `/appliance-repairs` | `/appliances` | 308 Permanent | Prevent crawl fragmentation on legacy plural path |
| `/blog` | `/knowledge` | 308 Permanent | Eliminate identical duplicated route and sitemap conflict |
| `/blog/:slug*` | `/knowledge/:slug*` | 308 Permanent | Consolidate article URLs into canonical knowledge base |

---

## 2. Verification Test Results

```bash
# Automated Sitemap Validation:
Redirect URLs in sitemap          : 0 (Target: 0) -> PASSED
404 / 410 / 5xx URLs in sitemap    : 0 (Target: 0) -> PASSED
Noindex URLs in sitemap           : 0 (Target: 0) -> PASSED
Canonical Mismatches in sitemap    : 0 (Target: 0) -> PASSED
```

Zero redirect hops exist within emitted XML sitemaps.
