'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Download, Smartphone } from 'lucide-react';
import { getAppPromotionForRoute, resolveDeepLinkUrls } from '@/config/appPromotionConfig';
import { trackAppPromotionEvent, PROMOTION_EVENTS } from '@/services/appPromotionAnalytics';

export function AppInstallBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [deviceOS, setDeviceOS] = useState('other');
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

    // Only show custom floating banner on mobile or tablet browsers
    const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth <= 1024;
    if (!isMobileDevice) {
      setIsVisible(false);
      return;
    }

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
        placement: 'mobile_bottom_banner',
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname, promotion]);

  if (!mounted || !promotion || !isVisible) return null;

  const deepLinks = resolveDeepLinkUrls(promotion, pathname);

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
      placement: 'mobile_bottom_banner',
    });
  };

  const handleGetApp = () => {
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
                  ? 'Manage leads, orders & grow business'
                  : 'Faster booking & exclusive in-app offers'}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenApp}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#007367] bg-[#EAFBF7] hover:bg-[#d8f5ef] border border-[#007367]/30 transition-all cursor-pointer"
            >
              <span>Open</span>
              <ExternalLink className="w-3 h-3 text-[#007367]" />
            </button>

            <button
              type="button"
              onClick={handleGetApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#007367] hover:bg-[#005f55] text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get App</span>
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
  );
}
