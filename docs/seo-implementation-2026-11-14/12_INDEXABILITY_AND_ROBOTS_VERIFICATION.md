# Doorstep Hub — Robots.txt Directives & Indexability Verification

**Date:** November 14, 2026  
**Robots.txt Source:** `Doorstep-Hub-Website/app/robots.js`  

---

## 1. Verified Robots.txt Configuration

The current production robots.txt implementation provides:
```text
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://doorstephub.com/sitemap.xml
```

### 1.1 Critical Validation Findings
- **No Broad `/_next/` Disallow:** Googlebot, Bingbot, and other search crawlers have full access to CSS, JS, and font chunks required for full rendering.
- **Admin & Private Protection:** `/admin/` and `/api/` endpoints remain securely disallowed from indexing.
- **Transactional Noindex Headers:** Customer order details, payment confirmation, and wallet dashboards remain excluded via `robots: { index: false, follow: false }`.
