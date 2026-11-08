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
    const metaTag = document.querySelector('meta[name="apple-itunes-app"]');

    if (!promotion || !promotion.ios?.appStoreId) {
      // Safely clear content attribute without detaching the node from document.head
      if (metaTag && metaTag.getAttribute('content')) {
        metaTag.setAttribute('content', '');
      }
      return;
    }

    const appStoreId = promotion.ios.appStoreId;
    const universalUrl = `https://doorstephub.com${pathname || '/'}`;
    const content = `app-id=${appStoreId}, app-argument=${universalUrl}`;

    if (metaTag) {
      if (metaTag.getAttribute('content') !== content) {
        metaTag.setAttribute('content', content);
      }
    }
  }, [pathname]);

  return null;
}

