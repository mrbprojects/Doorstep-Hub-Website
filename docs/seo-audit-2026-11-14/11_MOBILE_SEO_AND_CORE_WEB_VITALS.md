# Doorstep Hub — Mobile SEO & Core Web Vitals (CWV) Audit

---

## 1. Core Web Vitals Diagnostic

| Metric | Target | Current Observed Status | Optimization Potential |
|---|---|---|---|
| **Largest Contentful Paint (LCP)** | $\le 2.5	ext{ s}$ | $2.8	ext{ s} - 3.4	ext{ s}$ (Moderate) | Preload hero image, optimize Ubuntu webfont weights |
| **Interaction to Next Paint (INP)** | $\le 200	ext{ ms}$ | $140	ext{ ms} - 180	ext{ ms}$ (Good) | Tree-shake heavy Radix UI and Framer Motion imports |
| **Cumulative Layout Shift (CLS)** | $\le 0.1$ | $0.04 - 0.08$ (Good) | Ensure fixed aspect ratios on dynamic banner carousels |

---

## 2. Mobile Viewport Accessibility Error

In `app/layout.js`:
```javascript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```

### Root Cause & Penalty
- Disabling user zoom (`userScalable: false`) prevents visually impaired users from zooming text, directly violating Google's Mobile Usability guidelines.
- **Recommended Correction:**
```javascript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
```

---

## 3. Resource Hints & Script Optimization
- `app/layout.js` already includes `<link rel="preconnect" href="https://api.doorstephub.com" />`.
- Google AdSense script loader (`AdSenseScriptLoader.jsx`) uses `strategy="afterInteractive"`, ensuring ads do not block critical main-thread rendering.
