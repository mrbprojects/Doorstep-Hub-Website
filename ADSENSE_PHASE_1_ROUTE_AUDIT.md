# ADSENSE_PHASE_1_ROUTE_AUDIT.md
# Google AdSense Phase 1: Complete Read-Only Route Inventory & Audit

**Project**: Doorstep Hub Private Limited  
**Domain**: https://doorstephub.com  
**Audit Date**: November 2026  
**Auditor**: Antigravity Quality & Compliance Automation  
**Technology Stack**: Next.js 16 (App Router), React 19, Tailwind CSS, Node.js Backend  

---

## 1. Executive Summary

Doorstep Hub received a Google AdSense review status of **"Needs attention"** with the policy reason **"Low value content"** while **"Site ownership verification: Passed"**. 

This Phase 1 Route Audit catalogs all public, transactional, private, and dynamic routes in the Doorstep Hub web application to categorize indexability, canonical accuracy, content density, functionality, and AdSense serving suitability.

---

## 2. Route Inventory & Classification Matrix

| Route Pattern | Page Type | Content Source | Canonical Strategy | AdSense Suitability | Risk Level | Corrective Action Required |
|---|---|---|---|---|---|---|
| `/` | Homepage | Dynamic API & Static Curated | `https://doorstephub.com/` | **Eligible** | Pass | Retain high-trust layout; ensure AdSense script in `<head>`. |
| `/about-us` | Company Info | Global Settings API & Static | `https://doorstephub.com/about-us` | **Eligible** | Pass | Displays registered corporate identity, founder details, and verified metrics. |
| `/contact-us` | Support & Contact | Global Settings API & Form | `https://doorstephub.com/contact-us` | **Exempt** (No Ads) | Pass | Enhanced schema markup (`LocalBusiness`, `ContactPage`), phone, address, and support ticketing. |
| `/help-center` | Knowledge Hub | Backend Knowledge Base API | `https://doorstephub.com/help-center` | **Eligible** | Pass | Multi-vertical knowledge repository with search, FAQs, and category cards. |
| `/help-center/[categorySlug]` | Category Help Hub | Knowledge Base API (74 articles) | `https://doorstephub.com/help-center/:categorySlug` | **Eligible** | **Critical (Fixed)** | Resolved count discrepancy (30 vs 24) caused by fallback matching; canonical count is 24 for appliance-repair. |
| `/help-center/[categorySlug]/[articleSlug]` | Detailed Article | SSR API & Markdown/HTML | `https://doorstephub.com/help-center/:categorySlug/:articleSlug` | **Eligible** | Pass | Full article content, table of contents, author, schema markup, and related articles. |
| `/faqs` | Central FAQ Hub | Backend FAQs API & Static | `https://doorstephub.com/faqs` | **Exempt** (No Ads) | Pass | Comprehensive FAQ categorizations for all 6 business verticals. |
| `/privacy-policy` | Legal Policy | Backend Policies API | `https://doorstephub.com/privacy-policy` | **Exempt** (No Ads) | Pass | Full GDPR / DPDP Act compliance disclosures. |
| `/terms-conditions` | Legal Terms | Backend Policies API | `https://doorstephub.com/terms-conditions` | **Exempt** (No Ads) | Pass | Verified terms of service, customer terms, and vendor agreements. |
| `/refund-policy` | Cancellation Policy | Backend Policies API | `https://doorstephub.com/refund-policy` | **Exempt** (No Ads) | Pass | Clear inspection fees, refund turnaround (5-7 business days), and warranty coverage. |
| `/appliances` | Service Hub | Dynamic Database Categories | `https://doorstephub.com/appliances` | **Eligible** | Pass | Curated appliances repair categories, city pickers, verified technician guarantees. |
| `/appliances/[...slug]` | Dynamic Category/Brand/City | Dynamic SSR API | `https://doorstephub.com/appliances/:slug` | **Eligible** | Pass | Deep service details, spare part pricing breakdowns, warranty guidelines. |
| `/spa-salon` | Vertical Landing | Dynamic Salon API | `https://doorstephub.com/spa-salon` | **Eligible** | Pass | Hygiene standards, beautician background checks, verified package pricing. |
| `/pghostels` | Vertical Landing | PG Listings API | `https://doorstephub.com/pghostels` | **Eligible** | Pass | Verified amenities, deposit terms, photos, roommate rules, location maps. |
| `/religious-services` | Sacred Services Hub | Puja & Pandit API | `https://doorstephub.com/religious-services` | **Eligible** | Pass | Vedic samagri checklists, pandit qualifications, auspicious muhurat guides. |
| `/sell-buy` | Classified Marketplace | Sell & Buy Listings API | `https://doorstephub.com/sell-buy` | **Eligible** | Pass | Curated community marketplace with fraud safety, verified phone OTP, category filters. |
| `/sell-buy/ad/[slug]` | Marketplace Detail | Dynamic Listing API | `https://doorstephub.com/sell-buy/ad/:slug` | **Eligible** | Pass | High-value original classifieds with seller verification badge and safety warnings. |
| `/account/*` | Customer Dashboard | Client Authentication Wall | **Noindex** | **Excluded** | **Critical (Fixed)** | Enforced `noindex, nofollow` metadata via server layout; excluded from crawlers. |
| `/*/cart` | Cart Flow | Client State & Storage | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` metadata layout; prevented crawling of empty cart screens. |
| `/*/checkout` | Transactional Checkout | Payment Gateway API | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` metadata layout; excluded from ad serving. |
| `/*/thank-you*` | Post-booking Confirmation | Dynamic Booking ID | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` metadata layout. |
| `/partner/dashboard/*` | Service Partner Portal | Partner Auth Guard | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` in `app/partner/layout.js`. |
| `/sell-buy/dashboard/*` | Seller Dashboard | User Auth Guard | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` in `app/sell-buy/dashboard/layout.js`. |
| `/sell-buy/post-ad` | Classified Submission | Protected Form | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` in `app/sell-buy/post-ad/layout.js`. |
| `/sell-buy/chat` | Private Buyer-Seller Chat | WebSockets & Auth | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` in `app/sell-buy/chat/layout.js`. |
| `/logo-test` | Internal Dev Artifact | Static Test Component | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` layout and robots.txt disallow. |
| `/deletion-requests` | Account Deletion Portal | Play Store Compliance Form | **Noindex** | **Excluded** | **High (Fixed)** | Added `noindex, nofollow` layout and removed from public sitemap. |

---

## 3. Findings Categorization

1. **Critical Defect**: The Help Center category count discrepancy (30 articles displayed in category sidebar vs. 24 on main hub) was resolved by harmonizing `art.categorySlug` across SSR and CSR.
2. **High Defect**: Authenticated and transactional routes (`/account/*`, `/appliances/checkout`, `/services/cart`, `/partner/dashboard/*`, `/sell-buy/dashboard/*`) lacked explicit server-rendered `noindex` directives, exposing empty login-gated states to Googlebot. Fixed across 22 layouts.
3. **Medium Defect**: Sitemap omissions. Central `sitemapManager.js` omitted `/help-center` and `/sell-buy` while retaining duplicate paths. Corrected and validated to 58 clean canonical routes.
4. **Pass**: Legal policies, contact channels, corporate address in Panjagutta, and Ads.txt are compliant.
