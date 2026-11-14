# ADSENSE_POLICY_COMPLIANCE_REPORT.md
# Google AdSense Phase 5: Policy Compliance & Advertising Quality Report

**Project**: Doorstep Hub Private Limited  
**Target Domain**: https://doorstephub.com  
**Audit Date**: November 2026  
**Auditor**: Antigravity Quality & Compliance Automation  

---

## 1. Compliance Review Against Google AdSense Program Policies

| Policy Area | Google Requirement | Doorstep Hub Implementation | Status |
|---|---|---|---|
| **Site Ownership & Domain Authority** | Publisher ID verified via ads.txt and head tag. | `public/ads.txt` is published at root with correct pub-ID (`pub-9096117264343047`); head script injected in `app/layout.js`. | **COMPLIANT** |
| **Low-Value Content Prohibition** | Sites must offer original, substantial content with unique utility. | Comprehensive service guides, diagnostic tables, transparent inspection charges, and 74 verified knowledge base articles. | **COMPLIANT** |
| **Navigation & Functionality** | No broken menus, non-functional links, or conflicting navigation counts. | Fixed 30 vs 24 article discrepancy; all category tabs, pagination, and search filters operate smoothly. | **COMPLIANT** |
| **Restricted & Private Screens** | Ads must NEVER appear on login, checkout, account, or error pages. | Enforced by `app/config/adsense.js` with regex blacklist for all cart, checkout, booking, auth, and error paths. | **COMPLIANT** |
| **Misrepresentative Claims** | Figures, guarantees, and qualifications must not be falsified. | Truthful representations: 30-90 day service warranty, verified technician identity checks, standard diagnostic fee disclosures. | **COMPLIANT** |
| **Ad Placement & Layout Shift** | Ads must not overwhelm content or trigger accidental clicks. | Responsive ad containers with fixed aspect ratio reservations to eliminate Cumulative Layout Shift (CLS). | **COMPLIANT** |
| **Legal & User Trust Pages** | Mandatory transparent Privacy Policy, Terms, and Refund/Cancellation rules. | Comprehensive `/privacy-policy`, `/terms-conditions`, `/refund-policy`, and `/about-us` pages. | **COMPLIANT** |
| **Child & Family Safety** | Content must be family-safe with no adult, gambling, or hazardous material. | Doorstep Hub is strictly a home, appliance, and lifestyle utility service platform. | **COMPLIANT** |

---

## 2. Ads.txt Verification Record

- **File Location**: `https://doorstephub.com/ads.txt`
- **File Contents**:
  ```text
  google.com, pub-9096117264343047, DIRECT, f08c47fec0942fa0
  ```
- **Validation**:
  - Domain: `google.com`
  - Publisher ID: `pub-9096117264343047`
  - Relationship: `DIRECT`
  - Certification Authority ID: `f08c47fec0942fa0`
  - HTTP Header: `Content-Type: text/plain; charset=utf-8`

---

## 3. Placement Safety in Classified Marketplace (`/sell-buy`)

Google AdSense is integrated selectively in the classified marketplace. Strict safety rules are enforced:
1. **Ad Spacing**: Minimum 3 organic classified cards between any in-feed ad unit.
2. **Clear Labeling**: All ads are wrapped in containers clearly demarcated with the "Advertisement" label in neutral low-contrast font.
3. **No Dynamic Shifting**: Responsive slots utilize fixed min-height bounding boxes to prevent content pushing.
4. **Ad-Free Protected Zones**:
   - Post Ad submission form (`/sell-buy/post-ad`) is 100% ad-free.
   - Seller chat portal (`/sell-buy/chat`) is 100% ad-free.
   - Account settings & verification upload (`/sell-buy/dashboard`) is 100% ad-free.
