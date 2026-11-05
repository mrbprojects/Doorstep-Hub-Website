'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getAppPromotionForRoute } from '@/config/appPromotionConfig';

/**
 * SmartAppBannerMeta
 * Dynamically injects or updates Apple's native Smart App Banner meta tag
 * ensuring strictly that:
 * - Partner App (id=6504071357) is shown ONLY on /service-partner routes
 * - Customer App (id=6475340236) is shown on customer-facing routes
 * - Excluded routes have the tag removed
 */
export function SmartAppBannerMeta() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const promotion = getAppPromotionForRoute(pathname);
    let metaTag = document.querySelector('meta[name="apple-itunes-app"]');

    if (!promotion || !promotion.ios?.appStoreId) {
      // Safely disable the banner without detaching the DOM node.
      // Calling metaTag.remove() detaches the element from document.head,
      // breaking React's HostSingleton fiber tree and causing:
      // "TypeError: Cannot read properties of null (reading 'removeChild')"
      // during route transitions away from excluded pages (e.g. /services/payment-failed).
      if (metaTag) {
        metaTag.removeAttribute('content');
      }
      return;
    }

    const appStoreId = promotion.ios.appStoreId;
    const universalUrl = `https://doorstephub.com${pathname || '/'}`;
    const content = `app-id=${appStoreId}, app-argument=${universalUrl}`;

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'apple-itunes-app';
      document.head.appendChild(metaTag);
    }

    metaTag.content = content;
  }, [pathname]);

  return null;
}

