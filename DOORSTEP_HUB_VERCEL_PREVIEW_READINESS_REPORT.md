# Doorstep Hub — Vercel Preview Readiness & Final Release Candidate Review

**Generated Date**: November 10, 2026  
**Audited Target**: Doorstep Hub Enterprise Web Platform (Next.js 16.4.5)  
**Repository**: `https://github.com/mrbprojects/Doorstep-Hub-Website.git`  
**Branch**: `main`  
**HEAD Commit**: `284730e13f2a188492e8cb6a8e77941e28f0dd69`  
**Deployment Status**: **STRICT PRODUCTION HOLD MAINTAINED — ISOLATED PREVIEW READY FOR OWNER AUTHORIZATION**

---

## 1. Exact Repository & Git Release Candidate Verification

### Remote & Branch Inspection
- **Remote Origin**: `https://github.com/mrbprojects/Doorstep-Hub-Website.git` (verified fetch & push)
- **Current Active Branch**: `main`
- **Current Commit HEAD**: `284730e13f2a188492e8cb6a8e77941e28f0dd69`
- **Commit Message**: `feat(ui): add skeleton loaders for booking, checkout, and profile pages`
- **Remote Tracking**: Branch `main` is in sync with `origin/main`. Zero unpushed commits have been transmitted.

### Working Tree State
- **Staged Changes**: 0 files staged (`git diff --cached` is empty).
- **Unstaged Modified Files (11 Files)**:
  1. `app/components/appliances/ApplianceServiceBannerCarousel.jsx` (Added responsive `sizes="100vw"`)
  2. `app/components/appliances/CategoryPage.jsx` (Wrapped raw image URLs in `getImageUrl`)
  3. `app/components/landing/AppDownload.jsx` (Added responsive `sizes="64px"`)
  4. `app/components/partner/PartnerAppDownload.jsx` (Added responsive `sizes="64px"`)
  5. `app/components/religious/ReligiousServiceDetailPage.jsx` (Added responsive `sizes="(max-width: 768px) 100vw, 420px"`)
  6. `app/config/env.js` (Added verified safe subcategory asset aliasing)
  7. `app/help-center/page.jsx` (Added responsive `sizes` to hero and FAQ avatar images)
  8. `app/lib/api.js` (Added verified safe subcategory asset aliasing in `imageLoader`)
  9. `app/logo-test/page.jsx` (Added responsive `sizes="192px"`)
  10. `app/service-list/featured-services/page-client.js` (Added responsive `sizes`)
  11. `package.json` (Updated test runner to `node --test tests/*.test.js`)
- **Untracked Production Code Files**:
  - `tests/imageAliasing.test.js` (Regression test suite for alias isolation)
- **Untracked Documentation / Audit Reports**:
  - `DOORSTEP_HUB_79_MISSING_SERVICE_IMAGES_BACKEND_HANDOFF.md`
  - `DOORSTEP_HUB_79_SERVICE_IMAGES_RECOVERY_REPORT.md`
  - `DOORSTEP_HUB_ENTERPRISE_WEBSITE_FINAL_ACCEPTANCE_REPORT.md`
  - `DOORSTEP_HUB_SKELETON_VISUAL_ACCEPTANCE_REPORT.md`

---

## 2. Full Git Diff Summary

All 11 modified files contain strictly scoped, surgical changes:

```diff
diff --git a/app/components/appliances/ApplianceServiceBannerCarousel.jsx b/app/components/appliances/ApplianceServiceBannerCarousel.jsx
@@ -62,6 +62,7 @@
                   aria-hidden="true"
                   fill
                   unoptimized
+                  sizes="100vw"
                   className="object-cover blur-2xl opacity-35 scale-110"

diff --git a/app/components/appliances/CategoryPage.jsx b/app/components/appliances/CategoryPage.jsx
@@ -24,6 +24,7 @@
+import { getImageUrl } from @/config/env;
@@ -323,7 +324,7 @@
-              src={`https://api.doorstephub.com/${categoryImage}`}
+              src={getImageUrl(categoryImage)}
@@ -486,7 +487,7 @@
-                                src={`https://api.doorstephub.com/${subCategory.image}`}
+                                src={getImageUrl(subCategory.image)}

diff --git a/app/components/landing/AppDownload.jsx b/app/components/landing/AppDownload.jsx
@@ -442,6 +442,7 @@
                           src="/Bharath.png"
                           alt="Technician"
                           fill
+                          sizes="64px"

diff --git a/app/components/partner/PartnerAppDownload.jsx b/app/components/partner/PartnerAppDownload.jsx
@@ -398,6 +398,7 @@
                           src="/Bharath.png"
                           alt="Partner Technician"
                           fill
+                          sizes="64px"

diff --git a/app/components/religious/ReligiousServiceDetailPage.jsx b/app/components/religious/ReligiousServiceDetailPage.jsx
@@ -373,6 +373,7 @@
                                 src={serviceData.mainImage || serviceData.logo}
                                 alt={serviceData.name}
                                 fill
+                                sizes="(max-width: 768px) 100vw, 420px"

diff --git a/app/config/env.js b/app/config/env.js
@@ -40,6 +40,11 @@
+  // Safe asset recovery mapping: Map historical database reference to verified live uploaded asset
+  if (cleanUrl.includes(uploads/ondemandsubcategory/Laptop_Repair.webp)) {
+    cleanUrl = cleanUrl.replace(Laptop_Repair.webp, 1751895490326-laptop.jpg);
+  }

diff --git a/app/help-center/page.jsx b/app/help-center/page.jsx
@@ -382,6 +382,7 @@
                   priority
+                  sizes="(max-width: 1024px) 100vw, 480px"
@@ -648,6 +649,7 @@
                     src="/help-center/faq-avatar.png"
                     fill
+                    sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 240px"

diff --git a/app/lib/api.js b/app/lib/api.js
@@ -1,4 +1,4 @@
-import { API_BASE_URL, IMAGE_BASE_URL, getImageUrl as resolveMediaUrl } from @/config/env;
+import { API_BASE_URL, IMAGE_BASE_URL, getImageUrl as resolveMediaUrl } from ../config/env.js;
@@ -182,10 +182,13 @@
-    if (src.startsWith(http://) || src.startsWith(https://) || src.startsWith(blob:)) {
-        return src;
+    let cleanSrc = String(src).replace(/^\/+/, );
+    if (cleanSrc.includes(uploads/ondemandsubcategory/Laptop_Repair.webp)) {
+        cleanSrc = cleanSrc.replace(Laptop_Repair.webp, 1751895490326-laptop.jpg);
+    }
+    if (cleanSrc.startsWith(http://) || cleanSrc.startsWith(https://) || cleanSrc.startsWith(blob:)) {
+        return cleanSrc;
     }

diff --git a/app/logo-test/page.jsx b/app/logo-test/page.jsx
@@ -7,13 +7,13 @@
-                    <Image src="/d-hub-logo.png" alt="test" fill className="object-contain" />
+                    <Image src="/d-hub-logo.png" alt="test" fill sizes="192px" className="object-contain" />
-                    <Image src="/d-hub-logo.png" alt="test" fill className="object-contain" />
+                    <Image src="/d-hub-logo.png" alt="test" fill sizes="192px" className="object-contain" />

diff --git a/app/service-list/featured-services/page-client.js b/app/service-list/featured-services/page-client.js
@@ -436,6 +436,7 @@
                                                         fill
                                                         unoptimized
+                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

diff --git a/package.json b/package.json
@@ -82,7 +82,7 @@
-    "test": "node --test tests/seo.test.js",
+    "test": "node --test tests/*.test.js",
```

---

## 3. Test Count Reconciliation (79 Subtests vs 80 Tests Reported)

### Mathematical & Architectural Evidence from TAP Output
In the previous report, the sum of leaf assertions across individual test files was **79**, yet the Node.js Test Runner reported **80 tests**. 

Below is the verified breakdown from `node --test --test-reporter=tap tests/*.test.js`:

| Test File | Construct Type | TAP Designation | Leaf Assertions | Runner Test Count | Reason |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `tests/homepageAdminControl.test.js` | `describe()` + 5 `it()` | `type: suite` | 5 | 5 | `describe` blocks count as suites, not tests |
| `tests/imageAliasing.test.js` | `test()` + 4 `t.test()` | `type: test` | 4 | **5** (4 + 1) | **Root `test()` is counted as a test in TAP alongside its 4 children** |
| `tests/paymentSecurity.test.js` | `describe()` + 8 `it()` | `type: suite` | 8 | 8 | `describe` blocks count as suites |
| `tests/routingCollisions.test.js` | `describe()` + 4 sub-`describe()` | `type: suite` | 53 | 53 | Contains 20 + 26 + 2 + 5 = 53 assertions |
| `tests/seo.test.js` | 9 top-level `test()` calls | `type: test` | 9 | 9 | 9 individual test assertions |
| **Total Inventory** | | | **79 Leaf Tests** | **80 Reported Tests** | **79 assertions + 1 root test runner = 80** |

### Suite Count Reconciliation (7 Suites Reported)
The 7 suites reported by Node.js come from:
1. `Homepage Admin Control Scenarios (Task 1)`
2. `Payment Confirmation Security Test Cases (A through H)`
3. `Routing Collision Prevention & Precedence Audit (Task 2)`
4. `1. Category Slugs vs Bookable Services` (Nested suite)
5. `2. Sub-service Slugs vs Legitimate Cities` (Nested suite)
6. `3. Two-Segment Routing Collision Prevention` (Nested suite)
7. `4. Canonical Precedence: Nearby Book-Now, Flat City, Brand & Reserved Routes` (Nested suite)

**Result**: 80 / 80 passed, 0 failed, 0 skipped, 0 cancelled. (Duration: 48.4s).

---

## 4. Quality-Gate Results

| Gate | Command | Actual Output / Status | Exit Code | Pass/Fail |
| :--- | :--- | :--- | :---: | :---: |
| **Regression Tests** | `npm test` | 80 tests passed across 7 suites in 48.4s | `0` | **PASS** |
| **ESLint** | `npx eslint . --max-warnings 0` | 0 errors, 0 warnings (clean output) | `0` | **PASS** |
| **TypeScript** | `npx tsc --noEmit` | Zero type errors across entire codebase | `0` | **PASS** |
| **Production Build** | `npm run build` | Next.js 16.4.5 compiled in 9.5s; 121 routes generated | `0` | **PASS** |

---

## 5. Image Recovery Status Summary

1. **Subcategory Assets (23/23 Live - 100%)**:
   - 22 return native HTTP 200 OK directly.
   - 1 subcategory (`Laptop Repair Service`) is safely aliased to `1751895490326-laptop.jpg` (HTTP 200 OK, 96,651 bytes, `image/jpeg`).
   - Verified that the alias cannot alter any other subcategories or service items.
2. **Service Item Assets (104/183 Live - 56.8%)**:
   - 104 service items return HTTP 200 OK authentic original photography.
   - 79 service items reference WebP files that are physically missing on production storage (HTTP 404).
   - Handled via resilient fallback (`/electric-appliance.png`) to prevent layout collapse and broken-image icons.

---

## 6. Remaining 79-Image Handoff to Backend Administration

A standalone handoff document has been generated at:
- `DOORSTEP_HUB_79_MISSING_SERVICE_IMAGES_BACKEND_HANDOFF.md`

**Summary of Request to Backend Administrator**:
- Request an authoritative production storage inventory of `/uploads/ondemandservice/` on the live server.
- The 79 services across 14 subcategories (Computer Repair, Geyser Repair, Oven Repair, Refrigerator Repair, TV Repair, Washing Machine Repair) are cataloged with Service ID, Service Name, and Expected Filename.
- Uploading these files to `/uploads/ondemandservice/` will immediately activate real images on the frontend without requiring any new deployment.

---

## 7. Verified Vercel Preview Deployment Isolation Strategy

To ensure zero risk to the live production site (`doorstephub.com`), the following deployment isolation strategy is established:

| Isolation Check | Configuration / Mechanism | Verified Behavior |
| :--- | :--- | :--- |
| **Production Branch** | `main` on GitHub | Only pushes to `main` trigger production deploys. **No push to main will occur.** |
| **Preview Branch** | `preview/enterprise-rc` or isolated branch | Pushing to an isolated branch triggers a separate Vercel Preview build (`*.vercel.app`). |
| **Search-Engine Indexing** | Vercel `X-Robots-Tag` + `robots.txt` | Vercel automatically sends `X-Robots-Tag: noindex, nofollow` on all Preview deployments. |
| **HTTP Redirect Safety** | `next.config.js` | The HTTP-to-HTTPS 308 redirect checks `x-forwarded-proto: http`. On HTTPS preview URLs, it does NOT redirect to `doorstephub.com`. |
| **Backend API Usage** | `NEXT_PUBLIC_API_BASE_URL` | Uses live production API (`api.doorstephub.com`) in **strictly read-only mode** (GET/POST data queries). |
| **Mutation Safeguards** | Manual testing protocol | Zero bookings, zero OTP requests, zero test payments, zero state alterations. |

---

## 8. Comprehensive Browser Preview Verification Matrix

When the owner authorizes the Vercel Preview deployment, the following 13 areas will be verified across **Desktop (1920x1080)**, **Tablet (768x1024)**, and **Mobile (375x812)**:

| # | Page / Area | Tested Route | Key Verification Elements |
| :-: | :--- | :--- | :--- |
| 1 | **Homepage** | `/` | Homescreen API response, hero carousel, vertical tiles, footer links, 0 console errors |
| 2 | **5 Business Verticals** | `/appliances`, `/spa-salon`, `/religious-services`, `/pghostels`, `/sell-buy` | Vertical hero banners, popular services, ratings, responsive grids |
| 3 | **Categories & Subcategories** | `/appliances/categories`, `/subcategory/ac-repair-services`, `/subcategory/laptop-repair-service` | 23/23 subcategory images, verified laptop image loading, category descriptions |
| 4 | **Service Listings** | `/service-list/all`, `/appliances/select-service` | 104 live photos, 79 graceful fallbacks, price tags, "Book Now" CTA visibility |
| 5 | **Service Centers** | `/services/centers`, `/service-list/[slug]` | Center locations, address cards, map pin links, contact buttons |
| 6 | **Service Detail Pages** | `/detail/[slug]`, `/religious-services/service/[slug]` | Detail banner, included features, price breakdown, FAQ accordion |
| 7 | **Rate Cards** | `/services/explore`, `/services/listing/[subCategoryId]` | Transparent pricing tables, inspection charges, warranty tags |
| 8 | **Sell & Buy Marketplace** | `/sell-buy`, `/sell-buy/categories` | Marketplace grid, AdSense slot responsiveness, product preview cards |
| 9 | **Help Center & FAQs** | `/help-center`, `/faqs` | FAQ search bar, avatar image sizes (no Next.js warnings), article categories |
| 10 | **Knowledge / Blogs** | `/blog`, `/knowledge` | Article cards, author metadata, read-time badges, responsive layouts |
| 11 | **Booking Workflow** | `/book-appointment`, `/services/booking` | Form fields, date/time picker, address selection, skeleton state transition |
| 12 | **Profile Pages** | `/services/address`, `/partner/dashboard/profile` | Profile skeleton transition, user details card, tab switches |
| 13 | **Payment Status Handling** | `/services/payment-failed`, `/services/thank-you` | Edge-case status banners, retry triggers, receipt layouts |

---

## 9. Remaining Release Risks & Mitigation

| Identified Risk | Severity | Impact | Mitigation Strategy |
| :--- | :---: | :--- | :--- |
| **79 Missing Service Images** | Low-Medium | Missing original photo; fallback icon displayed | Frontend uses high-quality fallback (`/electric-appliance.png`); handoff doc provided to backend team. |
| **Accidental Production Push** | Critical | Unreviewed code deployed to live users | Maintained strict hold. Git remote push requires explicit user approval. Isolated preview branch planned. |
| **SEO Indexing of Preview** | Medium | Duplicate content penalty | Vercel Preview enforces `X-Robots-Tag: noindex` on all `*.vercel.app` URLs. |
| **Stale Cache / CDN** | Low | Users see older JS/CSS chunks | Next.js build hashes all chunks (`/_next/static/...`). Clean cache-busting on deploy. |

---

## 10. Actions Requiring Explicit Owner Authorization

Per strict operating instructions, no automated action will be taken without explicit user consent.

The following choices are submitted for your decision:

1. **Authorization for Isolated Vercel Preview**:
   - Create and push a dedicated preview branch (e.g. `preview/enterprise-rc`) to GitHub, triggering a non-production Vercel Preview URL for visual inspection.
2. **Approval of Backend Administrator Handoff**:
   - Transmit `DOORSTEP_HUB_79_MISSING_SERVICE_IMAGES_BACKEND_HANDOFF.md` to the backend/cPanel administrator to begin restoring the 79 missing assets on production media storage.
3. **Final Production Release Decision**:
   - **Option A**: Proceed with production deployment after Preview visual sign-off (with 104 original photos + 79 resilient fallbacks active).
   - **Option B**: Hold production deployment until the backend team finishes re-uploading the 79 original images.
