'use client';

import React from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { ADSENSE_CONFIG, isAdSenseEligiblePath } from '@/config/adsense';

/**
 * Body-Level AdSense Script Loader
 * Mounts the official Google AdSense loader script exactly once on eligible public Sell & Buy routes.
 */
export function AdSenseScriptLoader() {
  const pathname = usePathname();
  const isEligible = isAdSenseEligiblePath(pathname);

  if (!isEligible || !ADSENSE_CONFIG.clientId) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.clientId}`}
      crossOrigin="anonymous"
    />
  );
}

export default AdSenseScriptLoader;
