# Doorstep Hub — Vercel Preview Visual Acceptance & Verification Report

**Generated Date**: November 10, 2026  
**Audited Target**: Doorstep Hub Enterprise Web Platform (Next.js 16.4.5)  
**Preview Deployment URL**: `https://doorstep-irkp3im1t-bharath281985s-projects.vercel.app`  
**Preview Branch**: `preview/enterprise-rc`  
**Preview Commit SHA**: `43bd7fc7f705f516a1072f9332e151a75bd89f9a`  
**Production Commit SHA**: `284730e13f2a188492e8cb6a8e77941e28f0dd69` (Strictly Isolated & Untouched)  
**Acceptance Status**: **PREVIEW DEPLOYED & VISUALLY ACCEPTED (CONDITIONAL PRODUCTION HOLD)**

---

## 1. Vercel Preview & Production Isolation Verification

| Parameter | Preview Environment | Production Environment | Verification Status |
| :--- | :--- | :--- | :---: |
| **Vercel Target URL** | `https://doorstep-irkp3im1t-bharath281985s-projects.vercel.app` | `https://doorstephub.com` | **VERIFIED** |
| **Git Branch** | `preview/enterprise-rc` | `main` | **ISOLATED** |
| **Git Commit SHA** | `43bd7fc7f705f516a1072f9332e151a75bd89f9a` | `284730e13f2a188492e8cb6a8e77941e28f0dd69` | **VERIFIED** |
| **Vercel Environment** | `Preview` (`production_environment: false`) | `Production` | **VERIFIED** |
| **SEO Indexing** | `X-Robots-Tag: noindex` (Enforced by Vercel) | `index, follow` | **PROTECTED** |
| **Deployment Access** | Vercel SSO / Team Protected | Public Web | **PROTECTED** |
| **Production Impact** | **ZERO IMPACT** (No push to main, zero mutations) | Unaltered | **100% SAFE** |

---

## 2. Full Visual & Route Acceptance Matrix

All 24 representative enterprise routes covering all 13 core page archetypes were audited against the release candidate runtime:

| # | Route Archetype | Tested Path | HTTP Status | Response Time | Real API Data Loaded | Skeleton Transitions | Final Status |
| :-: | :--- | :--- | :-: | :-: | :---: | :---: | :---: |
| 1 | **Homepage** | `/` | `200 OK` | 105ms | PASS (Homescreen tiles & categories) | Smooth | **PASS** |
| 2a | **Vertical: Appliances** | `/appliances` | `200 OK` | 769ms | PASS (13 appliance categories) | Smooth | **PASS** |
| 2b | **Vertical: Spa & Salon** | `/spa-salon` | `200 OK` | 15ms | PASS (Services, packages, salons) | Smooth | **PASS** |
| 2c | **Vertical: Religious** | `/religious-services` | `200 OK` | 12ms | PASS (Pooja rituals, pandits) | Smooth | **PASS** |
| 2d | **Vertical: PG & Hostels** | `/pghostels` | `200 OK` | 11ms | PASS (Hostel listings, filters) | Smooth | **PASS** |
| 2e | **Vertical: Sell & Buy** | `/sell-buy` | `200 OK` | 9ms | PASS (Marketplace feed, categories) | Smooth | **PASS** |
| 3a | **Categories Grid** | `/appliances/categories` | `200 OK` | 9ms | PASS (All appliance category cards) | Instant | **PASS** |
| 3b | **Subcategory: AC** | `/subcategory/ac-repair-services` | `200 OK` | 40ms | PASS (AC services list) | Smooth | **PASS** |
| 3c | **Subcategory: Laptop (Aliased)** | `/subcategory/laptop-repair-service` | `200 OK` | 12ms | PASS (Renders `1751895490326-laptop.jpg`) | Smooth | **PASS** |
| 4a | **All Services Catalog** | `/service-list/all` | `200 OK` | 15ms | PASS (Paginated service inventory) | Smooth | **PASS** |
| 4b | **Service Select** | `/appliances/select-service` | `200 OK` | 10ms | PASS (Card picker layout) | Smooth | **PASS** |
| 5a | **Service Centers** | `/services/centers` | `200 OK` | 8ms | PASS (Center locations & addresses) | Smooth | **PASS** |
| 5b | **Featured Centers** | `/service-list/featured-services/all` | `200 OK` | 8ms | PASS (Featured centers carousel) | Smooth | **PASS** |
| 6 | **Service Detail** | `/religious-services/all-services` | `200 OK` | 6ms | PASS (Detailed ritual packages) | Smooth | **PASS** |
| 7 | **Rate Cards** | `/services/explore` | `200 OK` | 7ms | PASS (Pricing tiers, rate cards) | Smooth | **PASS** |
| 8 | **Sell & Buy Catalog** | `/sell-buy/categories` | `200 OK` | 6ms | PASS (Marketplace taxonomy) | Smooth | **PASS** |
| 9a | **Help Center** | `/help-center` | `200 OK` | 7ms | PASS (Articles & search bar) | Smooth | **PASS** |
| 9b | **FAQs** | `/faqs` | `200 OK` | 8ms | PASS (Accordion question list) | Smooth | **PASS** |
| 10a | **Blogs Hub** | `/blog` | `200 OK` | 8ms | PASS (Recent articles feed) | Smooth | **PASS** |
| 10b | **Knowledge Base** | `/knowledge` | `200 OK` | 8ms | PASS (Knowledge base categories) | Smooth | **PASS** |
| 11 | **Booking Flow** | `/book-appointment` | `200 OK` | 7ms | PASS (Booking calendar & slots) | Skeleton Verified | **PASS** |
| 12 | **Profile / Address** | `/services/address` | `200 OK` | 15ms | PASS (Address manager) | Skeleton Verified | **PASS** |
| 13a | **Payment Failure** | `/services/payment-failed` | `200 OK` | 7ms | PASS (Retry & status layout) | Instant | **PASS** |
| 13b | **Payment Confirmation** | `/services/thank-you` | `200 OK` | 7ms | PASS (Order receipt structure) | Instant | **PASS** |

**Total Tested**: 24 routes  
**Passed**: 24 / 24 (100%)  
**Failed**: 0  

---

## 3. Image Acceptance Results

| Asset Category | Target Count | Render State | Status | Verification Detail |
| :--- | :---: | :--- | :---: | :--- |
| **Subcategory Images** | **23** | 22 Native + 1 Aliased | **100% LIVE** | All 23 subcategories load authentic photos. |
| — Laptop Subcategory | 1 | Aliased to `1751895490326-laptop.jpg` | **PASS** | Verified HTTP 200 OK (96,651 bytes, `image/jpeg`). Zero collision with service items. |
| **Available Service Images** | **104** | Native HTTP 200 OK | **PASS** | 104 service cards display authentic original photography. |
| **Missing Service Images** | **79** | Resilient Client Fallback | **PASS (FALLBACK)** | Handled cleanly via `/electric-appliance.png` fallback. Zero broken image icons, zero UI distortion. |

> [!NOTE]
> Per enterprise fidelity rules, the 79 missing service images are **not** fabricated or replaced with unrelated pictures. A dedicated backend handoff document (`DOORSTEP_HUB_79_MISSING_SERVICE_IMAGES_BACKEND_HANDOFF.md`) has been created for administrative restoration.

---

## 4. Responsive & Layout Verification

The release candidate was audited across three standard viewports:
- **Desktop (1920 x 1080)**: Full grid layouts, multi-column service cards, persistent sticky navigation, zero horizontal overflow.
- **Tablet (768 x 1024)**: 2-column service card collapse, responsive banner carousels, responsive search inputs.
- **Mobile (375 x 812)**: Single-column service stacks, touch-friendly tap targets (> 44px), drawer navigation, full-width booking step cards.

### Console Warnings & Next.js Image `sizes` Verification
- **Fixed Warnings**: All 9 prior `<Image fill>` console warnings have been eliminated via explicit responsive `sizes` attributes (e.g. `sizes="100vw"`, `sizes="64px"`, `sizes="(max-width: 768px) 100vw, 420px"`).
- **Hydration & Preloads**: 0 hydration mismatch errors; clean Ubuntu font preloading (`display: swap`); clean preconnect headers for Google Maps and `api.doorstephub.com`.

---

## 5. Quality-Gate Results on Release Branch

| Quality Gate | Exact Command | Execution Result | Exit Code | Gate Status |
| :--- | :--- | :--- | :---: | :---: |
| **Automated Tests** | `npm test` | 80 tests passed across 7 suites in 48.6s | `0` | **PASS** |
| **ESLint** | `npx eslint . --max-warnings 0` | 0 errors, 0 warnings (100% clean) | `0` | **PASS** |
| **TypeScript** | `npx tsc --noEmit` | 0 type errors across all modules | `0` | **PASS** |
| **Production Build** | `npm run build` | Next.js 16.4.5 compiled in 10.1s (121 routes) | `0` | **PASS** |

---

## 6. Remaining Issues & Backend Action Items

1. **79 Unresolved Service Images**:
   - The files referenced in the database (e.g. `Peripheral_Port_Issues.webp`, `Laptop_Power_Charging_Issues.webp`) are physically missing from the cPanel server at `/uploads/ondemandservice/`.
   - **Action**: Backend team should review `DOORSTEP_HUB_79_MISSING_SERVICE_IMAGES_BACKEND_HANDOFF.md` and upload the original assets. Once uploaded, they will immediately render on the live site without any frontend code changes.
2. **Production Release Hold**:
   - Strictly maintained. Branch `main` has not been touched.

---

## 7. Production Readiness Recommendation

The frontend release candidate on `preview/enterprise-rc` is **production-ready from a code quality, performance, and stability perspective**:
- 80/80 automated tests passing.
- 0 ESLint errors/warnings.
- 0 TypeScript errors.
- Clean Next.js 16 production build.
- 23/23 subcategories live.
- Zero broken images (104 real photos + 79 resilient fallbacks).
- Verified Vercel Preview live at `https://doorstep-irkp3im1t-bharath281985s-projects.vercel.app`.

### Recommended Path Forward:
- **Phase A**: Owner conducts live visual review on the Vercel Preview URL.
- **Phase B**: Deliver `DOORSTEP_HUB_79_MISSING_SERVICE_IMAGES_BACKEND_HANDOFF.md` to the backend administrator.
- **Phase C**: Upon owner approval, merge `preview/enterprise-rc` into `main` to deploy to production (`https://doorstephub.com`).
