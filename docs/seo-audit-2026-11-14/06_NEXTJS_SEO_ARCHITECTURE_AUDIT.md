# Doorstep Hub — Next.js 16 SEO Architecture Audit

**Framework:** Next.js 16.4.5 (App Router)  
**React Version:** React 19.3.1  
**Runtime:** Node.js (Vercel Serverless & Edge)  

---

## 1. Next.js App Router Metadata Evaluation

Next.js 16 provides two official ways to define SEO metadata:
1. **Static `metadata` Object Export:** Exported from Server Component `layout.js` or `page.js`.
2. **Dynamic `generateMetadata({ params, searchParams })` Function:** Asynchronously resolves metadata for dynamic parameterized routes.

### 1.1 Architecture Strengths
- **Root Layout Defaults (`app/layout.js`):** Properly defines `metadataBase: new URL('https://doorstephub.com')`, preventing relative canonical URL bugs.
- **Catch-All Handler (`app/[...slug]/page.js`):** Implements `generateMetadata({ params })` and delegates to `@/lib/seo`'s `getSEOMetadata(path)`.
- **Help Center Server Components:** `app/help-center/[categorySlug]/page.jsx` and `[articleSlug]/page.jsx` are Server Components with pre-rendered server metadata.

---

## 2. Critical Next.js SEO Architectural Flaws

### 2.1 Flaw 1: Dynamic Client Components Missing `generateMetadata()`
In 28 dynamic route templates (including `app/appliances/[...slug]/page.js`, `app/appliances/listing/[slug]/page.js`, `app/pghostels/listings/[type]/page.js`), the pages are marked `'use client'`.

In Next.js App Router, **a `'use client'` component cannot export `generateMetadata()`**. Unless a sister or parent `layout.js` exports metadata, Next.js falls back to the root layout metadata:
`Doorstep Hub | One-Stop Home & Lifestyle Services in India`

### 2.2 Flaw 2: Client Component Loading Spinners Replacing SSR Markup
In `app/appliances/repair-service/[citySlug]/page.js`:
```javascript
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
        <Loader2 size={32} className="animate-spin text-[#037166]" />
      </div>
    );
  }
```
Because the component initializes with `loading = true`, the initial server-rendered HTML payload contains only the spinning SVG. The `<h1>`, category cards, and `<script type="application/ld+json">` are only mounted in the DOM after client hydration. Crawlers that do not run JavaScript or timeout during evaluation record an empty page.

### 2.3 Flaw 3: Synchronous `params.slug` in Next.js 16
In Next.js 15 and 16, route `params` is a Promise. In `app/knowledge/[slug]/page.js`:
```javascript
export default async function KnowledgeArticle({ params }) {
    // BUG: params is a Promise in Next.js 16
    const slug = params.slug; 
```
Accessing `params.slug` directly without awaiting triggers Next.js runtime warnings and can cause empty schema values.
