'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ADSENSE_CONFIG, isAdSenseEligiblePath } from '@/config/adsense';

/**
 * Body-Level AdSense Script Loader
 * Mounts the official Google AdSense loader script exactly once on eligible public Sell & Buy routes.
 */
export function AdSenseScriptLoader() {
  const pathname = usePathname();
  const isEligible = isAdSenseEligiblePath(pathname);

  React.useEffect(() => {
    if (!isEligible || !ADSENSE_CONFIG.clientId) return;
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    const target = document.body || document.head;
    target.appendChild(script);
  }, [isEligible]);

  return null;
}

export default AdSenseScriptLoader;
