'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { QrCode, Smartphone, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { getAppPromotionForRoute } from '@/config/appPromotionConfig';
import { trackAppPromotionEvent, PROMOTION_EVENTS } from '@/services/appPromotionAnalytics';

/**
 * Generates an SVG QR Code representation pointing to the target URL
 */
function SimpleQrCode({ value, size = 120 }) {
  // Uses authoritative Google Charts API / quickchart for clean reliable QR rendering
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=1`;

  return (
    <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center">
      <img
        src={qrUrl}
        alt="Scan to Download App"
        width={size}
        height={size}
        className="rounded-lg"
        loading="lazy"
      />
    </div>
  );
}

export function DesktopAppDownloadCard({ forcedAppType = null, className = '' }) {
  const pathname = usePathname();
  const promotion = forcedAppType
    ? (forcedAppType === 'partner' ? getAppPromotionForRoute('/service-partner') : getAppPromotionForRoute('/'))
    : getAppPromotionForRoute(pathname);

  if (!promotion) return null;

  const qrTargetUrl = `https://${promotion.universalHost}/app?type=${promotion.id}`;

  const handleStoreClick = (storeType, url) => {
    trackAppPromotionEvent(PROMOTION_EVENTS.STORE_CLICK, {
      appType: promotion.id,
      pagePath: pathname,
      placement: 'desktop_card',
      storeType,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQrClick = () => {
    trackAppPromotionEvent(PROMOTION_EVENTS.QR_CLICK, {
      appType: promotion.id,
      pagePath: pathname,
      placement: 'desktop_card',
    });
  };

  return (
    <div className={`bg-gradient-to-br from-[#F5FFFC] via-[#EAFBF7] to-[#FFFFFF] rounded-3xl border border-[#007367]/20 p-6 sm:p-8 shadow-sm ${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Info Column */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#007367]/20 text-[#007367] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{promotion.id === 'partner' ? 'Service Partner Mobile App' : 'Official Customer App'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug mb-2">
            {promotion.heading}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {promotion.description}
          </p>

          {/* Store Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            {promotion.android.available && (
              <button
                type="button"
                onClick={() => handleStoreClick('android', promotion.android.playStoreUrl)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <img src="/googleplay.png" alt="Google Play" className="w-4 h-4 object-contain" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400">GET IT ON</span>
                  <span className="text-xs font-bold leading-none">Google Play</span>
                </div>
              </button>
            )}

            {promotion.ios.available && (
              <button
                type="button"
                onClick={() => handleStoreClick('ios', promotion.ios.appStoreUrl)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <img src="/ios.jpg" alt="Apple App Store" className="w-4 h-4 object-contain rounded-xs" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400">Download on the</span>
                  <span className="text-xs font-bold leading-none">App Store</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* QR Code Column */}
        <div className="shrink-0 flex flex-col items-center gap-2" onClick={handleQrClick}>
          <SimpleQrCode value={qrTargetUrl} size={110} />
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-[#007367]" />
            Scan to install {promotion.id === 'partner' ? 'Partner App' : 'App'}
          </span>
        </div>
      </div>
    </div>
  );
}
