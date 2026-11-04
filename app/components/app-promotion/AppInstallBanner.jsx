'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Download, Smartphone, QrCode } from 'lucide-react';
import { getAppPromotionForRoute, resolveDeepLinkUrls } from '@/config/appPromotionConfig';
import { trackAppPromotionEvent, PROMOTION_EVENTS } from '@/services/appPromotionAnalytics';

/**
 * Clean QR Code representation pointing to the app's smart link
 */
function SimpleQrCode({ value, size = 140 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=1`;

  return (
    <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
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

export function AppInstallBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [deviceOS, setDeviceOS] = useState('other');
  const [isDesktop, setIsDesktop] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Resolve promotion configuration based on route
  const promotion = useMemo(() => getAppPromotionForRoute(pathname), [pathname]);

  // 2. Detect OS & check dismissal preferences on mount
  useEffect(() => {
    setMounted(true);
    if (!promotion) {
      setIsVisible(false);
      return;
    }

    const ua = navigator.userAgent || '';
    let os = 'other';
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios';
    else if (/Android/i.test(ua)) os = 'android';
    setDeviceOS(os);

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth <= 1024;
    setIsDesktop(!isMobile);

    // Check dismissal status in localStorage (7 days expiry)
    try {
      const dismissData = localStorage.getItem(promotion.dismissKey);
      if (dismissData) {
        const parsed = JSON.parse(dismissData);
        const daysPassed = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
        if (daysPassed < promotion.dismissDays) {
          setIsVisible(false);
          return;
        }
      }
    } catch (e) {
      // LocalStorage access restricted in private mode
    }

    // Delayed presentation (1.5 seconds) to prioritize core page content
    const timer = setTimeout(() => {
      setIsVisible(true);
      trackAppPromotionEvent(PROMOTION_EVENTS.IMPRESSION, {
        appType: promotion.id,
        pagePath: pathname,
        placement: isMobile ? 'mobile_bottom_banner' : 'desktop_bottom_banner',
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname, promotion]);

  if (!mounted || !promotion || !isVisible) return null;

  const deepLinks = resolveDeepLinkUrls(promotion, pathname);
  const qrTargetUrl = `https://${promotion.universalHost}/app?type=${promotion.id}`;

  // 3. User actions
  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);

    try {
      localStorage.setItem(
        promotion.dismissKey,
        JSON.stringify({ timestamp: Date.now(), dismissed: true })
      );
    } catch (err) {}

    trackAppPromotionEvent(PROMOTION_EVENTS.DISMISS, {
      appType: promotion.id,
      pagePath: pathname,
      placement: isDesktop ? 'desktop_bottom_banner' : 'mobile_bottom_banner',
    });
  };

  const handleGetApp = () => {
    if (isDesktop) {
      setShowQrModal(true);
      trackAppPromotionEvent(PROMOTION_EVENTS.QR_CLICK, {
        appType: promotion.id,
        pagePath: pathname,
        placement: 'desktop_bottom_banner',
      });
      return;
    }

    const targetUrl = deviceOS === 'ios' ? deepLinks.iosAppStore : deepLinks.androidPlayStore;

    trackAppPromotionEvent(PROMOTION_EVENTS.STORE_CLICK, {
      appType: promotion.id,
      pagePath: pathname,
      placement: 'mobile_bottom_banner',
      storeType: deviceOS,
    });

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenApp = () => {
    if (isDesktop) {
      setShowQrModal(true);
      return;
    }

    trackAppPromotionEvent(PROMOTION_EVENTS.OPEN_CLICK, {
      appType: promotion.id,
      pagePath: pathname,
      placement: 'mobile_bottom_banner',
    });

    // Attempt universal link / custom scheme navigation with graceful store fallback
    const fallbackStore = deviceOS === 'ios' ? deepLinks.iosAppStore : deepLinks.androidPlayStore;
    const start = Date.now();

    window.location.href = deepLinks.schemeUrl;

    setTimeout(() => {
      // If the browser did not redirect into native app within 1.8s, fallback to store
      if (Date.now() - start < 2200) {
        window.location.href = fallbackStore;
      }
    }, 1800);
  };

  return (
    <>
      <AnimatePresence>
        <motion.aside
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3EEEB] shadow-[0_-8px_24px_rgba(0,115,103,0.12)] p-2.5 sm:p-3"
          aria-label="App promotion banner"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
            {/* App Icon + Title */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#007367]/10 to-[#037166]/20 border border-[#007367]/20 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src={promotion.icon}
                  alt={promotion.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Smartphone className="w-5 h-5 text-[#007367] hidden" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {promotion.name}
                  </span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-md bg-[#EAFBF7] text-[#007367] border border-[#007367]/20">
                    {promotion.id === 'partner' ? 'Partner App' : 'Free App'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-1 leading-tight mt-0.5">
                  {promotion.id === 'partner'
                    ? 'Manage leads, orders & grow your business'
                    : 'Faster booking & exclusive in-app offers'}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop Direct Store Shortcuts */}
              {isDesktop && (
                <div className="hidden lg:flex items-center gap-2 mr-1">
                  {promotion.android.available && (
                    <a
                      href={promotion.android.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold transition-all"
                    >
                      <img src="/googleplay.png" alt="Google Play" className="w-3.5 h-3.5 object-contain" />
                      <span>Google Play</span>
                    </a>
                  )}
                  {promotion.ios.available && (
                    <a
                      href={promotion.ios.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold transition-all"
                    >
                      <img src="/ios.jpg" alt="App Store" className="w-3.5 h-3.5 object-contain rounded-xs" />
                      <span>App Store</span>
                    </a>
                  )}
                </div>
              )}

              {/* Mobile "Open" in App if installed */}
              {!isDesktop && (
                <button
                  type="button"
                  onClick={handleOpenApp}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#007367] bg-[#EAFBF7] hover:bg-[#d8f5ef] border border-[#007367]/30 transition-all cursor-pointer"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3 text-[#007367]" />
                </button>
              )}

              {/* Main CTA: QR Modal trigger on Desktop, Store Link on Mobile */}
              <button
                type="button"
                onClick={handleGetApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#007367] hover:bg-[#005f55] text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {isDesktop ? (
                  <>
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan to Install</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Get App</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close app install prompt"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Desktop-Friendly Scan to Download QR Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-[#E3EEEB] flex flex-col items-center text-center"
            >
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close QR Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007367]/10 to-[#037166]/20 border border-[#007367]/20 flex items-center justify-center mb-3 shadow-xs">
                <img src={promotion.icon} alt={promotion.name} className="w-8 h-8 object-contain" />
              </div>

              <h3 className="text-lg font-black text-gray-900 leading-snug">
                {promotion.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-4 max-w-xs leading-relaxed">
                Scan the QR code with your smartphone camera to download & open directly on your mobile device.
              </p>

              <SimpleQrCode value={qrTargetUrl} size={150} />

              <div className="flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-gray-500">
                <QrCode className="w-3.5 h-3.5 text-[#007367]" />
                <span>Point your phone camera to scan</span>
              </div>

              <div className="w-full h-px bg-gray-100 my-4" />

              {/* Direct Store Links */}
              <div className="flex items-center justify-center gap-2.5 w-full">
                {promotion.android.available && (
                  <a
                    href={promotion.android.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-[11px] font-bold transition-all shadow-xs"
                  >
                    <img src="/googleplay.png" alt="Google Play" className="w-3.5 h-3.5 object-contain" />
                    <span>Google Play</span>
                  </a>
                )}
                {promotion.ios.available && (
                  <a
                    href={promotion.ios.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-[11px] font-bold transition-all shadow-xs"
                  >
                    <img src="/ios.jpg" alt="App Store" className="w-3.5 h-3.5 object-contain rounded-xs" />
                    <span>App Store</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
