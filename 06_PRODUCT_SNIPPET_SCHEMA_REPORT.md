# Doorstep Hub — Product Snippet Structured Data Audit & Policy Compliance Report

**Project:** Doorstep Hub Private Limited  
**Website:** https://doorstephub.com  
**SEO Release Branch:** `release/seo-implementation-2026-11`  
**Date:** November 15, 2026

---

## 1. Investigation of Reported GSC Warnings

Google Search Console reported two warnings under **Product snippets**:
1. *Missing field "review"* (optional / recommended)
2. *Missing field "aggregateRating"* (optional / recommended)

---

## 2. Identification of Affected URLs & Schema Generators

An exhaustive codebase search for `@type: "Product"` across all App Router routes revealed that **only one route template generates Product markup**:

- **Affected Route Template:** `app/sell-buy/ad/[slug]/page.jsx`
- **Public URL Scope:** `https://doorstephub.com/sell-buy/ad/[slug]` (Individual classified advertisements posted by users).
- **Other Routes:** Service booking pages (`/appliances`, `/book-now/[slug]`, `/services/detail/[id]`, `/pghostels/[slug]`, `/religious-services/[slug]`) strictly implement `@type: "Service"` or `@type: "LocalBusiness"`, and do NOT emit Product markup.

### Current JSON-LD Generator Code (`app/sell-buy/ad/[slug]/page.jsx`):
```javascript
jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: listing.title,
  description: listing.description,
  image: rawImageUrl || undefined,
  category: listing.categoryId?.name,
  offers: {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: listing.price,
    itemCondition: listing.condition === 'NEW' 
      ? 'https://schema.org/NewCondition' 
      : 'https://schema.org/UsedCondition',
    availability: listing.status === 'ACTIVE' 
      ? 'https://schema.org/InStock' 
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Person',
      name: listing.sellerId?.name || 'Verified Seller'
    }
  }
};
```

---

## 3. Classification of the Entity

| Criterion | Evaluation for Doorstep Hub "Sell-Buy" Ads |
| :--- | :--- |
| **Entity Nature** | Consumer-to-Consumer (C2C) Peer-to-Peer Classified Listing |
| **Is Doorstep Hub the seller?** | **No.** Doorstep Hub provides a classifieds platform connecting buyers and sellers via WhatsApp / Phone. |
| **Transaction Model** | In-person inspection and doorstep pickup between individuals. |
| **Are genuine product reviews available?** | **No.** Individual used items (e.g., a specific pre-owned 2021 LG Washing Machine) are unique, one-off listings without recurring customer review histories. |

---

## 4. Google Search Guidelines & Policy Compliance

Google Search Central documentation on Product Structured Data states:
> *"A Product can be eligible for product snippets if it includes at least one of the following: an offer, a review, or an aggregate rating."*

Because each classified ad includes a valid `offers` object (`@type: 'Offer'`, `price`, `priceCurrency: 'INR'`, `itemCondition`, `availability`), the listing is **100% eligible for Google rich product search snippets**.

Google Search Console categorizes missing `review` and `aggregateRating` as **Recommended enhancements (Warnings)**, NOT Critical Errors.

### Strict Policy Rule: Zero Fabricated Data
Under no circumstances should automated scripts inject fake reviews, synthetic reviewer names, or artificial aggregate ratings on individual second-hand marketplace listings. Doing so would violate Google's Structured Data Spam Guidelines and risk a manual action.

---

## 5. Schema Recommendation & Enhancement

For classified listings with known brands, we pass the real brand string directly:
```javascript
if (listing.brand) {
  jsonLd.brand = {
    '@type': 'Brand',
    name: listing.brand
  };
}
```
The valid `Offer` satisfies rich snippet eligibility while preserving strict factual integrity.
