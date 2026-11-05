'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Search, Copy, Check, ArrowRight, ShieldCheck, Info, X } from 'lucide-react';
import { API_BASE_URL, IMAGE_BASE_URL, getImageUrl } from '@/config/env';

const SERVICE_ID_ROUTES = {
  '683daaa8f261c1548bdf7442': { name: 'Appliance Service', path: '/appliance-repair-services' },
  '695250aa57bb211ca094e5fd': { name: 'Religious Services', path: '/religious-services' },
  '69524fb157bb211ca094e5ee': { name: 'PG & Hostels', path: '/pghostels' },
  '69524f4a57bb211ca094e5e6': { name: 'Unisex & Pet Saloons', path: '/spa-salon' },
  '6a7db000a9d92694336007a0': { name: 'Sell & Buy', path: '/sell-buy' },
};

function getServiceDestination(offer) {
  if (offer?.targetUrl && typeof offer.targetUrl === 'string' && offer.targetUrl.startsWith('/')) {
    return offer.targetUrl;
  }

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

  const rawServiceNames = Array.isArray(offer?.serviceName)
    ? offer.serviceName
    : offer?.serviceName
    ? [offer.serviceName]
    : [];

  for (const sName of rawServiceNames) {
    const cleanName = String(sName || '').toLowerCase().trim();
    if (cleanName.includes('appliance') || cleanName.includes('repair')) return '/appliance-repair-services';
    if (cleanName.includes('religious') || cleanName.includes('pooja') || cleanName.includes('pandit')) return '/religious-services';
    if (cleanName.includes('pg') || cleanName.includes('hostel')) return '/pghostels';
    if (cleanName.includes('spa') || cleanName.includes('salon') || cleanName.includes('saloon') || cleanName.includes('pet')) return '/spa-salon';
    if (cleanName.includes('sell') || cleanName.includes('buy')) return '/sell-buy';
  }

  return '/appliance-repair-services';
}

function getEligibleDestinations(offer) {
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

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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

    async function loadAllOffers() {
      // 1. Try website offers endpoint
      try {
        const res = await fetch(`${API_BASE_URL}/website/offers`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.data && Array.isArray(json.data) && json.data.length > 0) {
            setOffers(json.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch /website/offers, trying active offers:', err);
      }

      // 2. Fallback to active offers endpoint
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

          if (Array.isArray(groups)) {
            groups.forEach((group) => {
              const svcName = group.serviceName || 'Home Services';
              const svcId = group.serviceId;
              if (Array.isArray(group.offers)) {
                group.offers.forEach((sub) => {
                  flattened.push({
                    ...sub,
                    serviceName: [svcName],
                    serviceId: svcId ? [svcId] : [],
                  });
                });
              } else if (group._id && (group.title || group.couponCode)) {
                flattened.push(group);
              }
            });
          }

          if (isMounted && flattened.length > 0) {
            setOffers(flattened);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback error fetching active offers:', err);
      }

      // 3. Fallback mock if completely offline
      if (isMounted) {
        setOffers([
          {
            _id: 'default-1',
            title: 'Up to 5% Discount on ₹1499',
            description: 'Get flat 5% extra discount on all appliance repairs with a minimum order value of ₹1499.',
            image: 'uploads/offers/upto_5_Discount_on_1499-.webp',
            couponCode: 'WELCOME25',
            discountType: 'percentage',
            discountValue: 5,
            maxDiscountAmount: 200,
            minOrderAmount: 1499,
            serviceId: ['683daaa8f261c1548bdf7442'],
            serviceName: ['Appliance Service'],
            targetUrl: '/appliance-repair-services',
          },
          {
            _id: 'default-2',
            title: 'Pandit Booking Special Discount',
            description: 'Flat 10% discount on all religious pooja and pandit bookings across Hyderabad.',
            image: 'uploads/offers/1779110337668-Pandit Booking Discount.png',
            couponCode: 'POOJA10',
            discountType: 'percentage',
            discountValue: 10,
            maxDiscountAmount: 300,
            minOrderAmount: 999,
            serviceId: ['695250aa57bb211ca094e5fd'],
            serviceName: ['Religious Services'],
            targetUrl: '/religious-services',
          },
          {
            _id: 'default-3',
            title: 'Hostel & PG Welcome Offer',
            description: 'Flat ₹500 off on first month advance booking for verified premium hostels & PGs.',
            image: 'uploads/service/1780375226268-Pg_and_Hostels.webp',
            couponCode: 'HOSTEL500',
            discountType: 'fixed',
            discountValue: 500,
            minOrderAmount: 4999,
            serviceId: ['69524fb157bb211ca094e5ee'],
            serviceName: ['PG & Hostels'],
            targetUrl: '/pghostels',
          },
          {
            _id: 'default-4',
            title: 'Salon & Grooming Special Discount',
            description: 'Flat 15% discount on unisex salon, hair spa and grooming services.',
            image: 'uploads/service/Unisex_Salon_Petcare.webp',
            couponCode: 'SALON15',
            discountType: 'percentage',
            discountValue: 15,
            minOrderAmount: 799,
            serviceId: ['69524f4a57bb211ca094e5e6'],
            serviceName: ['Unisex & Pet Saloons'],
            targetUrl: '/spa-salon',
          },
        ]);
        setLoading(false);
      }
    }

    loadAllOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (e, code) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!code) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const executeRedeem = (offer, destinationPath) => {
    if (offer?.couponCode && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(offer.couponCode);
      setCopiedCode(offer.couponCode);
    }

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
      // Storage fallback
    }

    if (selectedOfferModal) setSelectedOfferModal(null);
    if (multiCategoryOffer) setMultiCategoryOffer(null);

    router.push(destinationPath);
  };

  const handleRedeemOffer = (e, offer) => {
    e?.preventDefault();
    e?.stopPropagation();

    const eligibleRoutes = getEligibleDestinations(offer);

    if (eligibleRoutes.length > 1) {
      setMultiCategoryOffer({ offer, routes: eligibleRoutes });
      return;
    }

    const destination = eligibleRoutes[0]?.path || getServiceDestination(offer);
    executeRedeem(offer, destination);
  };

  const categories = useMemo(() => {
    const set = new Set();
    offers.forEach((o) => {
      if (Array.isArray(o.serviceName)) o.serviceName.forEach((s) => s && set.add(s));
      else if (o.serviceName) set.add(o.serviceName);
    });
    return ['All', ...Array.from(set)];
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchSearch =
        search === '' ||
        o.title?.toLowerCase().includes(search.toLowerCase()) ||
        o.couponCode?.toLowerCase().includes(search.toLowerCase()) ||
        o.description?.toLowerCase().includes(search.toLowerCase());

      const sName = Array.isArray(o.serviceName) ? o.serviceName.join(' ') : o.serviceName || '';
      const matchCat = selectedCategory === 'All' || sName.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCat;
    });
  }, [offers, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FDFB]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAFBF7] via-[#F2FBF9] to-[#F8FDFB] pt-12 pb-16 border-b border-[#E3EEEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-6">
            <Link href="/" className="hover:text-[#00796F]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#00796F]">Exclusive Offers & Coupons</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#00796F]/25 text-[#00796F] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
              <Ticket className="w-3.5 h-3.5 text-[#00796F]" />
              <span>DOORSTEP HUB PROMOTIONS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102033] tracking-tight leading-[1.15] mb-4">
              Exclusive Offers & Discount Coupons
            </h1>
            <p className="text-[#64748B] text-base sm:text-lg leading-relaxed">
              Explore active promotional discounts, seasonal deals, and promo codes across home appliance repairs,
              beauty & salon, PG accommodations, and religious ceremonies.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search offers or coupon code (e.g. WELCOME25, POOJA10)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EEEB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00796F]/30 focus:border-[#00796F] shadow-2xs"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#00796F] text-white shadow-xs'
                      : 'bg-white text-[#64748B] hover:text-[#102033] border border-[#E3EEEB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xs animate-pulse space-y-3">
                <div className="aspect-[16/9] w-full rounded-xl bg-gray-200" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E3EEEB] p-8 max-w-lg mx-auto shadow-xs">
            <Ticket className="w-12 h-12 text-[#00796F]/40 mx-auto mb-4" />
            <h3 className="text-lg font-black text-[#102033] mb-1">No Offers Available</h3>
            <p className="text-sm text-[#64748B] mb-6">
              {search || selectedCategory !== 'All'
                ? 'No offers matched your search criteria. Try selecting "All" or a different keyword.'
                : 'There are currently no active public promotional coupons. Please check back soon!'}
            </p>
            {(search || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 rounded-xl bg-[#00796F] text-white font-bold text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, idx) => {
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
                <div
                  key={offer._id || offer.couponCode || idx}
                  className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#E3EEEB] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Promotional Image Banner */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgSrc}
                      alt={offer.title || 'Offer'}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `${IMAGE_BASE_URL}/uploads/thumbn_ph_image/default_image.jpg`;
                      }}
                    />

                    {/* Overlaid Service Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-xs text-[#00796F] border border-[#00796F]/20 shadow-xs">
                      {serviceName}
                    </div>

                    {/* Overlaid Discount Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-black bg-[#E65100] text-white shadow-xs">
                      {discountTag}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-black text-[#102033] text-base sm:text-lg leading-snug line-clamp-1 mb-1">
                        {offer.title || 'Exclusive Doorstep Hub Offer'}
                      </h3>

                      {offer.description && (
                        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-3">
                          {offer.description}
                        </p>
                      )}

                      <div className="text-xs text-[#64748B] flex items-center gap-2 mb-3">
                        {offer.minOrderAmount ? (
                          <span>Min order: ₹{offer.minOrderAmount}</span>
                        ) : (
                          <span>No min order</span>
                        )}
                        {offer.endDate && (
                          <>
                            <span>•</span>
                            <span>Till {formatDate(offer.endDate)}</span>
                          </>
                        )}
                      </div>

                      {/* Coupon Code Pill */}
                      {offer.couponCode && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-[#F0FAF7] border border-[#99F6E4]/60 mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Coupon Code</span>
                            <span className="font-mono font-black text-sm tracking-wider text-[#00796F]">
                              {offer.couponCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, offer.couponCode)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#00796F] bg-white border border-[#99F6E4] hover:bg-[#EAFBF7] active:scale-95 transition-all cursor-pointer shadow-2xs"
                            title="Click to copy coupon code"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#F0F5F4] flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleRedeemOffer(e, offer)}
                        style={{ color: '#ffffff' }}
                        className="btn-redeem-offer flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#00796F] hover:bg-[#00695C] !text-white font-bold text-xs tracking-wide shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Multi-Category Selection Modal */}
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

      {/* Coupon Details Modal */}
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
              <button
                type="button"
                onClick={() => setSelectedOfferModal(null)}
                className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 shadow-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={getImageUrl(selectedOfferModal.image)}
                  alt={selectedOfferModal.title}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = `${IMAGE_BASE_URL}/uploads/thumbn_ph_image/default_image.jpg`;
                  }}
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-[#00796F] shadow-xs">
                  {Array.isArray(selectedOfferModal.serviceName)
                    ? selectedOfferModal.serviceName[0]
                    : selectedOfferModal.serviceName || 'Home Services'}
                </div>
              </div>

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
                      onClick={(e) => handleCopy(e, selectedOfferModal.couponCode)}
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
    </div>
  );
}
