/**
 * Centralized Google AdSense Configuration for Doorstep Hub Sell & Buy
 */

const rawClientId = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '').trim();

if (!rawClientId && process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    console.warn('[AdSense] NEXT_PUBLIC_ADSENSE_CLIENT_ID is not configured. AdSense is disabled.');
  }
}

/**
 * Validates that an ad slot ID is a valid non-empty numeric string.
 */
export function isValidSlot(slotId) {
  if (!slotId || typeof slotId !== 'string') return false;
  return /^\d+$/.test(slotId.trim());
}

function cleanSlot(slotId) {
  const trimmed = String(slotId || '').trim();
  return /^\d+$/.test(trimmed) ? trimmed : '';
}

export const ADSENSE_CONFIG = {
  // Source of truth from Environment Variable (No hardcoded fallback)
  clientId: rawClientId.startsWith('ca-pub-') ? rawClientId : (rawClientId ? `ca-pub-${rawClientId}` : ''),

  // Verified Manual Responsive Ad Slots
  slots: {
    sellBuyTop: cleanSlot(process.env.NEXT_PUBLIC_ADSENSE_SELL_BUY_TOP_SLOT),
    sellBuyFeed: cleanSlot(process.env.NEXT_PUBLIC_ADSENSE_SELL_BUY_FEED_SLOT),
    categoryTop: cleanSlot(process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_TOP_SLOT),
    categoryFeed: cleanSlot(process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_FEED_SLOT),
    listingDetail: cleanSlot(process.env.NEXT_PUBLIC_ADSENSE_LISTING_DETAIL_SLOT),
    relatedListings: cleanSlot(process.env.NEXT_PUBLIC_ADSENSE_RELATED_LISTINGS_SLOT),
  },
};

/**
 * Validates if the current pathname is an eligible public Sell & Buy page.
 * Returns false for private, dashboard, checkout, authentication, or modal routes.
 */
export function isAdSenseEligiblePath(pathname) {
  if (!pathname || typeof pathname !== 'string') return false;

  // Explicitly Excluded Routes (Dashboard, Auth, Checkout, Chat, Modals, etc.)
  const excludedPatterns = [
    /^\/sell-buy\/dashboard(\/.*)?$/,
    /^\/sell-buy\/post-ad(\/.*)?$/,
    /^\/sell-buy\/chat(\/.*)?$/,
    /^\/account(\/.*)?$/,
    /^\/login(\/.*)?$/,
    /^\/auth(\/.*)?$/,
    /^\/book-appointment(\/.*)?$/,
    /^\/book-now(\/.*)?$/,
    /^\/checkout(\/.*)?$/,
    /^\/cart(\/.*)?$/,
    /^\/api(\/.*)?$/,
  ];

  for (const pattern of excludedPatterns) {
    if (pattern.test(pathname)) {
      return false;
    }
  }

  // Eligible Public Sell & Buy Routes
  const eligiblePatterns = [
    /^\/sell-buy\/?$/,
    /^\/sell-buy\/categories\/?$/,
    /^\/sell-buy\/search\/?$/,
    /^\/sell-buy\/ad\/[^/]+$/,
    /^\/sell-buy\/[^/]+$/,
  ];

  return eligiblePatterns.some((pattern) => pattern.test(pathname));
}
