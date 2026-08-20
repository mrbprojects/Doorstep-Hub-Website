'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ADSENSE_CONFIG, isAdSenseEligiblePath, isValidSlot } from '@/config/adsense';

/**
 * Reusable Google AdSense Unit for Public Sell & Buy Pages
 * 
 * Features:
 * - Validates route eligibility and numeric slot ID before mounting
 * - Collapses cleanly to null if ad slot ID or client ID is missing/invalid
 * - Safe single-push execution to prevent duplicate push errors
 * - Completely unmounts from DOM (returns null) when any modal is open
 */
export function AdSenseUnit({
  slotId,
  format = 'auto',
  responsive = 'true',
  layout = '',
  layoutKey = '',
  className = '',
  showLabel = true,
}) {
  const pathname = usePathname();
  const adRef = useRef(null);
  const isPushed = useRef(false);
  const [isModalActive, setIsModalActive] = useState(false);

  const isEligible = isAdSenseEligiblePath(pathname);
  const clientId = ADSENSE_CONFIG.clientId;
  const validSlot = isValidSlot(slotId) ? slotId.trim() : '';

  // Listen for global modal open events to completely unmount ads from DOM
  useEffect(() => {
    const handleModalChange = (e) => {
      setIsModalActive(Boolean(e.detail?.isOpen));
    };

    window.addEventListener('dhub-modal-state', handleModalChange);
    return () => {
      window.removeEventListener('dhub-modal-state', handleModalChange);
    };
  }, []);

  // Initialize adsbygoogle once per mounted element in browser
  useEffect(() => {
    if (!isEligible || !clientId || !validSlot || isModalActive || isPushed.current) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      }
    } catch (err) {
      // Catch duplicate push in strict/dev mode
    }
  }, [isEligible, clientId, validSlot, isModalActive]);

  // If page is not eligible, no client/slot ID, or modal is open: remove from DOM completely
  if (!isEligible || !clientId || !validSlot || isModalActive) {
    return null;
  }

  return (
    <div
      className={`w-full my-6 flex flex-col items-center justify-center ${className}`}
    >
      {showLabel && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 select-none">
          Advertisement
        </span>
      )}
      <div className="w-full max-w-full overflow-hidden flex items-center justify-center min-h-[90px] bg-slate-50/50 rounded-2xl border border-slate-100/80 p-2">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full text-center"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={validSlot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
          {...(layout ? { 'data-ad-layout': layout } : {})}
          {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        />
      </div>
    </div>
  );
}

export default AdSenseUnit;
