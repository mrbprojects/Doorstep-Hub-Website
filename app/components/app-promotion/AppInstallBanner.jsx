'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Download, Smartphone, QrCode } from 'lucide-react';
import { getAppPromotionForRoute, resolveDeepLinkUrls } from '@/config/appPromotionConfig';
import { trackAppPromotionEvent, PROMOTION_EVENTS } from '@/services/appPromotionAnalytics';
import { GooglePlayLogo, AppleLogo } from './StoreLogos';
import { useMounted } from '@/hooks/useMounted';

/**
 * Clean QR Code representation pointing to the app's smart link
 */
function SimpleQrCode({ value, size = 140 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=1`;

  return (
    <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
      <Image
        src={qrUrl}
        alt="Scan to Download App"
        width={size}
        height={size}
        className="rounded-lg"
      />
    </div>
  );
}

export function AppInstallBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [deviceOS] = useState(() => {
    if (typeof window === 'undefined') return 'other';
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'other';
  });
  const [isDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth <= 1024;
    return !isMobile;
  });
  const [showQrModal, setShowQrModal] = useState(false);
  const mounted = useMounted();

  // 1. Resolve promotion configuration based on route
  const promotion = useMemo(() => getAppPromotionForRoute(pathname), [pathname]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (!promotion) setIsVisible(false);
  }

  // 2. Detect OS & check dismissal preferences on mount
  useEffect(() => {
    if (!promotion) {
      return;
    }

    const ua = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth <= 1024;

    // Clear any previously persisted dismissal so banner shows on every refresh and page navigation
    try {
      if (promotion.dismissKey) {
        localStorage.removeItem(promotion.dismissKey);
      }
    } catch {
      // LocalStorage access restricted in private mode
    }

    // Delayed presentation (1 second) to prioritize core page content
    const timer = setTimeout(() => {
      setIsVisible(true);
      trackAppPromotionEvent(PROMOTION_EVENTS.IMPRESSION, {
        appType: promotion.id,
        pagePath: pathname,
        placement: isMobile ? 'mobile_bottom_banner' : 'desktop_bottom_banner',
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, promotion]);

  // Synchronize banner visibility with body class and custom event for floating elements
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isVisible) {
      document.body.classList.add('has-app-install-banner');
      window.dispatchEvent(new CustomEvent('app-banner-change', { detail: { isVisible: true } }));
    } else {
      document.body.classList.remove('has-app-install-banner');
      window.dispatchEvent(new CustomEvent('app-banner-change', { detail: { isVisible: false } }));
    }
    return () => {
      document.body.classList.remove('has-app-install-banner');
      window.dispatchEvent(new CustomEvent('app-banner-change', { detail: { isVisible: false } }));
    };
  }, [isVisible]);

  if (!mounted || !promotion || !isVisible) return null;

  const deepLinks = resolveDeepLinkUrls(promotion, pathname);
  const qrTargetUrl = `https://${promotion.universalHost}/app?type=${promotion.id}`;

  // 3. User actions
  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);

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
                <Image
                  src={promotion.icon}
                  alt={promotion.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                 width={32} height={32} />
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
              {/* Desktop Direct Store Shortcuts - Prominently Highlighted */}
              {isDesktop && (
                <div className="hidden lg:flex items-center gap-2 mr-1">
                  {promotion.android.available && (
                    <a
                      href={promotion.android.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 text-slate-800 text-[11px] font-bold shadow-2xs hover:shadow-xs transition-all group"
                      title="Get Doorstep Hub on Google Play"
                    >
                      <GooglePlayLogo className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="leading-none text-slate-900 font-extrabold">Google Play</span>
                    </a>
                  )}
                  {promotion.ios.available && (
                    <a
                      href={promotion.ios.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 text-slate-800 text-[11px] font-bold shadow-2xs hover:shadow-xs transition-all group"
                      title="Download Doorstep Hub on App Store"
                    >
                      <AppleLogo className="w-4 h-4 text-slate-900 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="leading-none text-slate-900 font-extrabold">App Store</span>
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

      {/* Redesigned QR Modal with Highlighted Android & iOS Logos */}
      <AnimatePresence>
        {showQrModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border border-teal-100 flex flex-col items-center text-center overflow-hidden"
            >
              {/* Teal Top Accent Ribbon */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#004D49] via-[#007367] to-[#00B8A9]" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close QR Modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* App Icon */}
              <div className="relative mt-1 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007367]/15 to-[#00B8A9]/20 border border-[#007367]/25 flex items-center justify-center p-2.5 shadow-sm">
                  <Image src={promotion.icon} alt={promotion.name} className="w-full h-full object-contain"  width={500} height={300} />
                </div>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {promotion.name}
                </h3>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-[#EAFBF7] text-[#007367] border border-[#007367]/25">
                  {promotion.id === 'partner' ? 'Partner App' : 'Free App'}
                </span>
              </div>

              <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
                Scan the QR code with your smartphone camera to download & open directly on your mobile device.
              </p>

              {/* QR Code Container with Highlighted Border */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-teal-200/80 shadow-inner flex flex-col items-center w-full max-w-[240px]">
                <SimpleQrCode value={qrTargetUrl} size={150} />

                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold text-[#007367]">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Point your phone camera to scan</span>
                </div>
              </div>

              {/* Divider with Platform Label */}
              <div className="relative my-4 w-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  OR DOWNLOAD DIRECTLY
                </span>
              </div>

              {/* Highlighted Android & iOS Store Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
                {promotion.android.available && (
                  <a
                    href={promotion.android.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] border border-slate-800 text-white shadow-md hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                      <GooglePlayLogo className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none tracking-wider">
                        GET IT ON
                      </span>
                      <span className="block text-xs sm:text-[13px] font-black text-white leading-tight mt-0.5 truncate">
                        Google Play
                      </span>
                    </div>
                  </a>
                )}
                {promotion.ios.available && (
                  <a
                    href={promotion.ios.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] border border-slate-800 text-white shadow-md hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                      <AppleLogo className="w-5 h-5 fill-white text-white shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none tracking-wider">
                        Download on
                      </span>
                      <span className="block text-xs sm:text-[13px] font-black text-white leading-tight mt-0.5 truncate">
                        App Store
                      </span>
                    </div>
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
