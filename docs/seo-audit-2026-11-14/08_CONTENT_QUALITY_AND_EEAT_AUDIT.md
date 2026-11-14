# Doorstep Hub — Content Quality & E-E-A-T Audit

**Evaluation Standard:** Google Search Quality Rater Guidelines (E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness)  
**Target Market:** India Home & Lifestyle Services  

---

## 1. E-E-A-T Assessment Matrix

| Pillar | Current Score (0–100) | Current Evidence | Gaps Identified | Priority Fix |
|---|---|---|---|---|
| **Experience** | 68 / 100 | Step-by-step repair guides, real technician tools mentioned | Lacks technician case studies, before/after photos | Add verified technician job logs and customer photos |
| **Expertise** | 72 / 100 | 24 detailed appliance care guides, troubleshooting workflows | Anonymous author ("Doorstep Hub"), no technician bios | Introduce bylines by certified master technicians |
| **Authoritativeness** | 64 / 100 | Clear brand identity, official app on Google Play & App Store | Limited third-party editorial citations or press mentions | Publish industry surveys & manufacturer certifications |
| **Trustworthiness** | 82 / 100 | Transparent corporate contact, GST details, verified reviews | Thin content on 962 programmatic city-brand pages | Add brand warranty policies and verified spares guarantee |

---

## 2. Content Thinness & Programmatic SEO Risk

### 2.1 The 962 City-Brand Matrix Risk
In `app/lib/seo/sitemapInventory.js`, the sitemap engine multiplies 26 cities by 37 appliance brands:
$26 \times 37 = 962 \text{ URLs}$

If a brand (e.g. `Acer`, `Apple`, or `Kelvinator`) does not have active technicians in a tier-2 city (e.g. `Khammam`, `Eluru`, or `Kadapa`), the page renders empty listings or generic placeholders.
- **Google Algorithm Penalty:** Google's Helpful Content System penalizes sites generating mass programmatic landing pages without unique, differentiated value.
- **Correction:** Implement a database check before generating city-brand URLs. If a brand has zero verified providers in a given city, exclude the URL from sitemaps and return HTTP 404.

---

## 3. High-Value Content Recommendations

1. **Detailed Pricing Tables:** Add standardized diagnostic charges, spare part ranges, and labor warranty terms to every category page.
2. **Technician Verification Badges:** Highlight Police Background Check verification, Aadhaar verification, and technical trade certification on all service and city landing pages.
3. **Genuine Spare Parts Guarantee:** Emphasize 90-day replacement warranty on parts to boost booking conversion rates.
