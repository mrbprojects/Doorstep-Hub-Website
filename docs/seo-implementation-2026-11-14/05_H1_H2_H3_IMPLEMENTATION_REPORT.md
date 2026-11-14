# Doorstep Hub — Heading Hierarchy & Content Semantics Report (H1 / H2 / H3)

**Date:** November 14, 2026  
**Auditor/Engineer:** Senior Technical SEO Architect  

---

## 1. Hierarchy Principles & Standards Applied

In compliance with Google Search Essentials and modern HTML5 accessibility guidelines:
1. **Single Primary H1:** Exactly one semantic `<h1>` tag rendered per indexable webpage representing the primary topical subject.
2. **Logical Heading Descent:** Subsections descending sequentially from `<h1>` to `<h2>` (major modules/features) to `<h3>` (cards, benefits, FAQ questions) without skipping levels.
3. **Server-Side Renderability:** All critical headings are rendered in the initial server HTML payload to guarantee detection by bots that limit or timeout client JS execution.

---

## 2. Key Heading Fixes Implemented

### 2.1 City Appliance Repair Pages (`app/appliances/repair-service/[citySlug]/page.js`)
- **Previous State:** The component initialized with `loading = true`, rendering only `<Loader2 />` during SSR. The `<h1>` tag was only inserted into the DOM after client hydration.
- **Implemented Fix:** Initialized `selectedCity` with `{ name: slugToTitle(citySlug), slug: citySlug }` and removed early spinner return.
- **Rendered H1:**
  ```html
  <h1 class="px-2 text-center text-lg font-black tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
    Appliance Repair Service Center in Hyderabad
  </h1>
  ```
- **Associated H2s:**
  - `Frequently Asked Questions`
  - `How It Works`
  - `Why Choose Doorstep Hub`

### 2.2 Knowledge Base Article SSR (`app/knowledge/[slug]/page.js`)
- **Previous State:** Accessed `params.slug` synchronously in Next.js 16 causing runtime warnings and empty schema IDs.
- **Implemented Fix:** Resolved Promise `const resolvedParams = await params` and rendered server-side JSON-LD and clean `<h1>{article.title}</h1>`.

### 2.3 App Download Hub (`app/app/page.js`)
- **Rendered H1:** `Everything in Your Pocket — Download Doorstep Hub App`
- **Rendered H2s:**
  - `Customer App Features`
  - `How It Works (Four Simple Steps)`
  - `Service Partner App Features & Earnings`
