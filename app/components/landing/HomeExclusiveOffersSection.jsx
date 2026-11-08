'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, ArrowRight, Copy, Check, Info, X, ShieldCheck } from 'lucide-react';
import { API_BASE_URL, IMAGE_BASE_URL, getImageUrl } from '@/config/env';

/**
 * Authoritative Service IDs mapped directly to live website routes
 */
export const SERVICE_ID_ROUTES = {
  '683daaa8f261c1548bdf7442': { name: 'Appliance Service', path: '/appliance-repair-services' },
  '695250aa57bb211ca094e5fd': { name: 'Religious Services', path: '/religious-services' },
  '69524fb157bb211ca094e5ee': { name: 'PG & Hostels', path: '/pghostels' },
  '69524f4a57bb211ca094e5e6': { name: 'Unisex & Pet Saloons', path: '/spa-salon' },
  '6a7db000a9d92694336007a0': { name: 'Sell & Buy', path: '/sell-buy' },
};

/**
 * Resolves destination solely based on authoritative database fields (targetUrl, serviceId, serviceName).
 * DOES NOT parse or infer category from arbitrary title or description text.
 */
export function getServiceDestination(offer) {
  // 1. Explicit admin target URL
  if (offer?.targetUrl && typeof offer.targetUrl === 'string' && offer.targetUrl.startsWith('/')) {
    return offer.targetUrl;
  }

  // 2. Authoritative MongoDB serviceId mapping
  const rawServiceIds = Array.isArray(offer?.serviceId)
    ? offer.serviceId
    : offer?.serviceId
    ? [offer.serviceId]
    : [];

  for (const sId of rawServiceIds) {
    const sIdStr = String(sId || '');
    if (SERVICE_ID_ROUTES[sIdStr]) {
      return SERVICE_ID_ROUTES[sIdStr].path;
    }
  }

  // 3. Authoritative serviceName field mapping (from serviceModel lookup)
  const rawServiceNames = Array.isArray(offer?.serviceName)
    ? offer.serviceName
    : offer?.serviceName
    ? [offer.serviceName]
    : [];

  for (const sName of rawServiceNames) {
    const cleanName = String(sName || '').toLowerCase().trim();
    if (cleanName.includes('appliance') || cleanName.includes('repair')) {
      return '/appliance-repair-services';
    }
    if (cleanName.includes('religious') || cleanName.includes('pooja') || cleanName.includes('pandit')) {
      return '/religious-services';
    }
    if (cleanName.includes('pg') || cleanName.includes('hostel')) {
      return '/pghostels';
    }
    if (cleanName.includes('spa') || cleanName.includes('salon') || cleanName.includes('saloon') || cleanName.includes('pet')) {
      return '/spa-salon';
    }
    if (cleanName.includes('sell') || cleanName.includes('buy')) {
      return '/sell-buy';
    }
  }

  // Fallback to primary services portal
  return '/appliance-repair-services';
}

/**
 * Returns all eligible destinations when a coupon applies to multiple business verticals
 */
export function getEligibleDestinations(offer) {
  const destinations = [];
  const rawServiceIds = Array.isArray(offer?.serviceId) ? offer.serviceId : offer?.serviceId ? [offer.serviceId] : [];

  for (const sId of rawServiceIds) {
    const sIdStr = String(sId || '');
    if (SERVICE_ID_ROUTES[sIdStr]) {
      destinations.push(SERVICE_ID_ROUTES[sIdStr]);
    }
  }

  if (destinations.length > 0) return destinations;

  const rawServiceNames = Array.isArray(offer?.serviceName) ? offer.serviceName : offer?.serviceName ? [offer.serviceName] : [];
  for (const sName of rawServiceNames) {
    const cleanName = String(sName || '').toLowerCase().trim();
    if (cleanName.includes('appliance')) destinations.push({ name: 'Appliance Service', path: '/appliance-repair-services' });
    else if (cleanName.includes('religious')) destinations.push({ name: 'Religious Services', path: '/religious-services' });
    else if (cleanName.includes('pg') || cleanName.includes('hostel')) destinations.push({ name: 'PG & Hostels', path: '/pghostels' });
    else if (cleanName.includes('spa') || cleanName.includes('salon') || cleanName.includes('pet')) destinations.push({ name: 'Spa & Salon', path: '/spa-salon' });
    else if (cleanName.includes('sell') || cleanName.includes('buy')) destinations.push({ name: 'Sell & Buy', path: '/sell-buy' });
  }

  return destinations.length > 0 ? destinations : [{ name: 'Appliance Service', path: '/appliance-repair-services' }];
}

/**
 * Formats date into readable string (e.g. 15 Nov 2026)
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function HomeExclusiveOffersSection() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedOfferModal, setSelectedOfferModal] = useState(null);
  const [multiCategoryOffer, setMultiCategoryOffer] = useState(null);

  // Close modals on Escape key & manage body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedOfferModal(null);
        setMultiCategoryOffer(null);
      }
    };

    if (selectedOfferModal || multiCategoryOffer) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedOfferModal, multiCategoryOffer]);

  useEffect(() => {
    let isMounted = true;

    async function loadOffers() {
      // Fetch active offers directly from authoritative endpoint
      try {
        const res = await fetch(`${API_BASE_URL}/app/products/getactiveoffers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          cache: 'no-store',
        });

        if (res.ok) {
          const json = await res.json();
          const groups = json?.data?.generalOffers || json?.data || [];
          const flattened = [];
          const now = new Date();

          if (Array.isArray(groups)) {
            groups.forEach((group) => {
              const svcName = group.serviceName || 'Home Services';
              const svcId = group.serviceId;
              if (Array.isArray(group.offers)) {
                group.offers.forEach((sub) => {
                  const isStartDateValid = !sub.startDate || new Date(sub.startDate) <= now;
                  const isEndDateValid = !sub.endDate || new Date(sub.endDate) >= now;
                  if (isStartDateValid && isEndDateValid) {
                    flattened.push({
                      ...sub,
                      serviceName: [svcName],
                      serviceId: svcId ? [svcId] : [],
                    });
                  }
                });
              } else if (group._id && (group.title || group.couponCode)) {
                const isStartDateValid = !group.startDate || new Date(group.startDate) <= now;
                const isEndDateValid = !group.endDate || new Date(group.endDate) >= now;
                if (isStartDateValid && isEndDateValid) {
                  flattened.push(group);
                }
              }
            });
          }

          if (isMounted) {
            setOffers(flattened);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Error fetching active offers:', err);
      }

      // Safe fallback: never show fabricated or hardcoded offers
      if (isMounted) {
        setOffers([]);
        setLoading(false);
      }
    }

    loadOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyCode = (e, code) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!code) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const executeRedeem = (offer, destinationPath) => {
    // 1. Copy coupon code for user convenience
    if (offer?.couponCode && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(offer.couponCode);
      setCopiedCode(offer.couponCode);
    }

    // 2. Persist cleanly in localStorage, overwriting any previous pending coupon
    try {
      if (typeof window !== 'undefined') {
        const couponPayload = {
          couponCode: offer.couponCode,
          discountValue: offer.discountValue,
          discountType: offer.discountType,
          minOrderAmount: offer.minOrderAmount || 0,
          maxDiscountAmount: offer.maxDiscountAmount || null,
          serviceId: Array.isArray(offer.serviceId) ? offer.serviceId : offer.serviceId ? [offer.serviceId] : [],
          serviceName: Array.isArray(offer.serviceName) ? offer.serviceName : offer.serviceName ? [offer.serviceName] : [],
          startDate: offer.startDate || null,
          endDate: offer.endDate || null,
          title: offer.title || '',
          targetRoute: destinationPath,
          appliedAt: new Date().toISOString(),
        };
        localStorage.setItem('appliedCoupon', JSON.stringify(couponPayload));
      }
    } catch {
      // Storage access fallback
    }

    // 3. Close open modals
    if (selectedOfferModal) setSelectedOfferModal(null);
    if (multiCategoryOffer) setMultiCategoryOffer(null);

    // 4. Route directly to target vertical
    router.push(destinationPath);
  };

  const handleRedeemOffer = (e, offer) => {
    e?.preventDefault();
    e?.stopPropagation();

    const eligibleRoutes = getEligibleDestinations(offer);

    // If coupon applies to multiple categories, prompt selection
    if (eligibleRoutes.length > 1) {
      setMultiCategoryOffer({ offer, routes: eligibleRoutes });
      return;
    }

    const destination = eligibleRoutes[0]?.path || getServiceDestination(offer);
    executeRedeem(offer, destination);
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5FFFC] via-[#EAFBF7] to-[#FFFFFF] py-8 sm:py-10 lg:py-12 border-t border-[#E3EEEB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div className="space-y-3">
              <div className="h-6 w-36 bg-gray-200/70 rounded-full animate-pulse" />
              <div className="h-9 w-72 bg-gray-200/70 rounded-lg animate-pulse" />
              <div className="h-4 w-96 max-w-full bg-gray-200/70 rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-gray-200/70 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xs animate-pulse space-y-3">
                <div className="aspect-[16/9] w-full rounded-xl bg-gray-200" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) {
    return null;
  }

  // Display top 4 active coupons on the homepage (4 cards per row on desktop)
  const displayOffers = offers.slice(0, 4);

  return (
    <section
      id="exclusive-offers"
      className="relative overflow-hidden bg-gradient-to-b from-[#F5FFFC] via-[#EAFBF7] to-[#FFFFFF] py-8 sm:py-10 lg:py-12 border-t border-[#E3EEEB]/60 scroll-mt-24"
    >
      {/* Decorative Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00796F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-[#EAFBF7] rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="max-w-2xl">
            {/* Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFBF7] border border-[#00796F]/25 text-[#00796F] text-xs font-black uppercase tracking-wider mb-2.5 shadow-2xs"
            >
              <Ticket className="w-3.5 h-3.5 text-[#00796F]" />
              <span>EXCLUSIVE OFFERS</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#102033] tracking-tight leading-tight mb-2"
            >
              Exclusive Offers, Extra Savings
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-[#64748B] text-sm sm:text-base leading-relaxed"
            >
              Explore the latest offers across Doorstep Hub services. View coupon details, check eligibility and
              discover available savings on your next booking.
            </motion.p>
          </div>

          {/* View All Offers Action */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="shrink-0"
          >
            <Link
              href="/offers"
              style={{ color: '#ffffff' }}
              className="btn-view-all-offers inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-[#00796F] hover:bg-[#00695C] !text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span style={{ color: '#ffffff' }} className="!text-white">View All Offers</span>
              <ArrowRight className="w-4 h-4 !text-white" stroke="#ffffff" color="#ffffff" style={{ stroke: '#ffffff', color: '#ffffff' }} />
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Promotional Coupon Cards Grid - 4 cards per row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 xl:gap-4.5">
          {displayOffers.map((offer, idx) => {
            const serviceName = Array.isArray(offer.serviceName)
              ? offer.serviceName[0]
              : offer.serviceName || 'Home Services';

            const discountTag =
              offer.discountType === 'percentage' && offer.discountValue
                ? `${offer.discountValue}% OFF`
                : offer.discountValue
                ? `₹${offer.discountValue} OFF`
                : 'SPECIAL OFFER';

            const imgSrc = getImageUrl(offer.image);
            const isCopied = copiedCode === offer.couponCode;

            return (
              <motion.div
                key={offer._id || offer.couponCode || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#E3EEEB] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* 1. Real Promotional Banner Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                  <Image
                    src={imgSrc}
                    alt={offer.title || 'Promotional Offer'}
                    unoptimized
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = `${IMAGE_BASE_URL}/uploads/thumbn_ph_image/default_image.jpg`;
                    }}
                   width={500} height={300} />

                  {/* Service Badge Overlaid */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-xs text-[#00796F] border border-[#00796F]/20 shadow-xs">
                    {serviceName}
                  </div>

                  {/* Discount Badge Overlaid */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E65100] text-white shadow-xs">
                    {discountTag}
                  </div>
                </div>

                {/* 2. Coupon Card Content */}
                <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Offer Title */}
                    <h3 className="font-black text-[#102033] text-sm sm:text-base leading-snug line-clamp-1 mb-1">
                      {offer.title || 'Exclusive Doorstep Hub Offer'}
                    </h3>

                    {/* Minimum Booking / Meta */}
                    <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-2.5">
                      {offer.minOrderAmount ? (
                        <span>Min: ₹{offer.minOrderAmount}</span>
                      ) : (
                        <span>Valid on all bookings</span>
                      )}
                      {offer.endDate && (
                        <>
                          <span>•</span>
                          <span>Till {formatDate(offer.endDate)}</span>
                        </>
                      )}
                    </div>

                    {/* Coupon Code Strip with 1-Click Copy */}
                    {offer.couponCode && (
                      <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-[#F0FAF7] border border-[#99F6E4]/60 mb-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">Coupon</span>
                          <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-[#00796F]">
                            {offer.couponCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(e, offer.couponCode)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[#00796F] bg-white border border-[#99F6E4] hover:bg-[#EAFBF7] active:scale-95 transition-all cursor-pointer shadow-2xs"
                          title="Click to copy coupon code"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3. Action Buttons: "Redeem Offer" and "View Details" */}
                  <div className="pt-2 border-t border-[#F0F5F4] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleRedeemOffer(e, offer)}
                      style={{ color: '#ffffff' }}
                      className="btn-redeem-offer flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#00796F] hover:bg-[#00695C] !text-white font-bold text-xs tracking-wide shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span style={{ color: '#ffffff' }} className="!text-white font-bold">Redeem Offer</span>
                      <ArrowRight className="w-3.5 h-3.5 !text-white" stroke="#ffffff" color="#ffffff" style={{ stroke: '#ffffff', color: '#ffffff' }} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOfferModal(offer)}
                      className="inline-flex items-center justify-center p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475569] hover:text-[#102033] text-xs font-bold transition-all cursor-pointer"
                      title="View full coupon details & eligibility rules"
                      aria-label="View coupon details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Multi-Category Selection Modal (When coupon is eligible across multiple verticals) */}
      <AnimatePresence>
        {multiCategoryOffer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setMultiCategoryOffer(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E3EEEB] relative"
            >
              <button
                type="button"
                onClick={() => setMultiCategoryOffer(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-5 h-5 text-[#00796F]" />
                <h3 className="text-lg font-black text-[#102033]">Select Eligible Category</h3>
              </div>

              <p className="text-xs text-[#64748B] mb-4">
                This coupon is eligible across multiple service categories. Choose where you would like to apply your savings:
              </p>

              <div className="space-y-2 mb-4">
                {multiCategoryOffer.routes.map((dest) => (
                  <button
                    key={dest.path}
                    type="button"
                    onClick={() => executeRedeem(multiCategoryOffer.offer, dest.path)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#E3EEEB] hover:border-[#00796F] hover:bg-[#EAFBF7]/50 active:scale-[0.99] transition-all text-left cursor-pointer group"
                  >
                    <span className="font-bold text-sm text-[#102033] group-hover:text-[#00796F]">
                      {dest.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#00796F] transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Coupon Details Modal */}
      <AnimatePresence>
        {selectedOfferModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedOfferModal(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E3EEEB] relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedOfferModal(null)}
                className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 shadow-md transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Banner Graphic */}
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden shrink-0">
                <Image
                  src={getImageUrl(selectedOfferModal.image)}
                  alt={selectedOfferModal.title}
                  unoptimized
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = `${IMAGE_BASE_URL}/uploads/thumbn_ph_image/default_image.jpg`;
                  }}
                 width={500} height={300} />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-[#00796F] shadow-xs">
                  {Array.isArray(selectedOfferModal.serviceName)
                    ? selectedOfferModal.serviceName[0]
                    : selectedOfferModal.serviceName || 'Home Services'}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#102033] leading-snug">
                    {selectedOfferModal.title}
                  </h3>
                  {selectedOfferModal.description && (
                    <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                      {selectedOfferModal.description}
                    </p>
                  )}
                </div>

                {/* Coupon Code Box */}
                {selectedOfferModal.couponCode && (
                  <div className="p-3.5 rounded-2xl bg-[#F0FAF7] border border-[#99F6E4] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                        Promo Code
                      </span>
                      <span className="font-mono font-black text-lg text-[#00796F]">
                        {selectedOfferModal.couponCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, selectedOfferModal.couponCode)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#00796F] border border-[#99F6E4] text-xs font-black hover:bg-[#EAFBF7] active:scale-95 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedCode === selectedOfferModal.couponCode ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Offer Terms Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-500 block mb-0.5 font-medium">Discount Value</span>
                    <span className="font-bold text-gray-900">
                      {selectedOfferModal.discountType === 'percentage'
                        ? `${selectedOfferModal.discountValue}%`
                        : `₹${selectedOfferModal.discountValue}`}
                      {selectedOfferModal.maxDiscountAmount && ` (Up to ₹${selectedOfferModal.maxDiscountAmount})`}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-500 block mb-0.5 font-medium">Minimum Order</span>
                    <span className="font-bold text-gray-900">
                      {selectedOfferModal.minOrderAmount ? `₹${selectedOfferModal.minOrderAmount}` : 'No minimum'}
                    </span>
                  </div>

                  {selectedOfferModal.startDate && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-500 block mb-0.5 font-medium">Valid From</span>
                      <span className="font-bold text-gray-900">{formatDate(selectedOfferModal.startDate)}</span>
                    </div>
                  )}

                  {selectedOfferModal.endDate && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-500 block mb-0.5 font-medium">Valid Till</span>
                      <span className="font-bold text-gray-900">{formatDate(selectedOfferModal.endDate)}</span>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                {selectedOfferModal.termsAndConditions && (
                  <div className="pt-2 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00796F]" />
                      <span>Terms & Conditions</span>
                    </h4>
                    <p className="text-[11px] text-[#64748B] leading-relaxed whitespace-pre-line">
                      {selectedOfferModal.termsAndConditions}
                    </p>
                  </div>
                )}

                {/* Modal Redeem CTA Button */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={(e) => handleRedeemOffer(e, selectedOfferModal)}
                    style={{ color: '#ffffff' }}
                    className="btn-redeem-offer w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#00796F] hover:bg-[#00695C] !text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span style={{ color: '#ffffff' }} className="!text-white font-bold">Redeem Offer Now</span>
                    <ArrowRight className="w-4 h-4 !text-white" stroke="#ffffff" color="#ffffff" style={{ stroke: '#ffffff', color: '#ffffff' }} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default HomeExclusiveOffersSection;
