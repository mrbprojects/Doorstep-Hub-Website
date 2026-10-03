'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Sparkles, Award, CloudFog, HandHeart, Coffee, Flame, Droplets, Scissors, Palette, Wind, Crown, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function LatestSpaServices() {
  const router = useRouter();
  const [spaStores, setSpaStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1280);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const handleStoreClick = (store) => {
    router.push(`/spa-salon/${store.slug || store._id}`);
  };

  const amenityIcons = {
    'Steam room or sauna': CloudFog,
    'Steam room': CloudFog,
    'Sauna': Flame,
    'Hot towel service': HandHeart,
    'Relaxation lounges': Coffee,
    'Complimentary beverages': Coffee,
    'Robes & slippers': Crown,
    'Lockers & secure storage': Award,
    'Lockers & secure storage for personal items': Award,
    'Haircut': Scissors,
    'Hair Coloring': Palette,
    'Styling': Wind,
    'Facial': Sparkles,
    'Massage': HandHeart,
    'Premium Products': Droplets,
  };

  useEffect(() => {
    const fetchSpaServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_spa_stores`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        if (data.success && data.stores) {
          const cleanAmenityText = (text) => {
            if (!text) return '';
            // Extract text before dash, en-dash, em-dash, or colon
            let title = String(text).trim().split(/\s+[–—]\s+|\s+-\s+/)[0].trim();
            title = title.replace(/\s*\([^)]*\)/g, '').trim();

            const lower = title.toLowerCase();
            if (lower.includes('beverage') || lower.includes('coffee') || lower.includes('tea') || lower.includes('drink')) return 'Beverages';
            if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('internet')) return 'Free Wi-Fi';
            if (lower.includes('warm towel') || lower.includes('hot towel') || lower.includes('towel')) return 'Warm Towels';
            if (lower.includes('vanity') || lower.includes('refresh') || lower.includes('mirror')) return 'Vanity Area';
            if (lower.includes('manicure') && lower.includes('pedicure')) return 'Nail Care';
            if (lower.includes('manicure')) return 'Manicure';
            if (lower.includes('pedicure')) return 'Pedicure';
            if (lower.includes('massage')) return 'Massage';
            if (lower.includes('haircut') || lower.includes('hair cut')) return 'Haircut';
            if (lower.includes('steam')) return 'Steam Room';
            if (lower.includes('sauna')) return 'Sauna';
            if (lower.includes('lounge') || lower.includes('relax')) return 'Lounge';
            if (lower.includes('charging')) return 'Charging Station';
            if (lower.includes('entertainment') || lower.includes('reading') || lower.includes('tv')) return 'Entertainment';
            if (lower.includes('hygien') || lower.includes('clean') || lower.includes('sanitiz')) return 'Hygienic Setup';
            if (lower.includes('expert') || lower.includes('therapist') || lower.includes('certified')) return 'Expert Staff';
            if (lower.includes('product') || lower.includes('premium')) return 'Premium Products';

            if (title.length > 16) {
              const parts = title.split(/[&/,]/)[0].trim();
              if (parts.length > 0 && parts.length <= 16) return parts;
              return title.split(' ').slice(0, 2).join(' ').slice(0, 16);
            }
            return title;
          };

          const getCityFromStore = (s) => {
            if (typeof s.cityName === 'string' && s.cityName.trim()) return s.cityName.trim();
            if (typeof s.cityName === 'object' && s.cityName?.cityName) return s.cityName.cityName;
            if (typeof s.city === 'string' && s.city.trim()) return s.city.trim();
            if (typeof s.addressCityName === 'string' && s.addressCityName.trim()) return s.addressCityName.trim();
            if (s.address && typeof s.address === 'string') {
              const parts = s.address.split(',').map(item => item.trim()).filter(Boolean);
              const filtered = parts.filter(p => !/^\d{5,6}$|india|telangana|andhra|karnataka|maharashtra/i.test(p));
              if (filtered.length > 0) return filtered[filtered.length - 1];
            }
            return 'Hyderabad';
          };

          const mappedStores = data.stores.map((store, index) => {
            let displayedAmenities = [];

            if (store.amenities && store.amenities.length > 0) {
              displayedAmenities = store.amenities.map(a => a.title || a);
            } else {
              displayedAmenities = (store.otherAmenities || "")
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(item => {
                  const lower = item.toLowerCase();
                  return item.length > 0 &&
                    !lower.includes("amenities") &&
                    !lower.includes("relaxation & comfort") &&
                    !item.trim().endsWith(":");
                });
            }

            if (displayedAmenities.length === 0) {
              displayedAmenities = ['Premium Services', 'Expert Therapists', 'Relaxation Lounge', 'Hygienic Environment'];
            }

            return {
              _id: store._id,
              slug: store.slug,
              storeName: store.storeName || `${store.firstName || ''} ${store.lastName || ''}`.trim(),
              category: 'Premium Spa & Salon',
              rating: store.rating || 4.8,
              price: store.startingAt ? `₹${store.startingAt}` : '$$',
              image: store.image ? (store.image.startsWith('http') ? store.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.image}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY3OTU0MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
              badge: index === 0 ? 'Recently Booked' : 'Top Rated',
              highlights: displayedAmenities.slice(0, 4).map(cleanAmenityText),
              location: getCityFromStore(store),
            };
          });

          setSpaStores(mappedStores);
        }
      } catch (error) {
        console.error("Error fetching spa services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaServices();
  }, []);

  const scrollRef = React.useRef(null);
  const shouldDesktopScroll = isDesktop && spaStores.length > 5;
  const scrollCards = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.querySelector('[data-scroll-card="latest-spa"]');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 280;
    const amount = cardWidth + 16;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="relative py-8 sm:py-10 lg:py-14 overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/20 rounded-full blur-[170px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/15 rounded-full blur-[170px] pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight"
          >
            <span className="bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-transparent">
              Recently Booked Spa & Saloons
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-500 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed"
          >
            Explore recently booked spa and salon services for hair care, beauty treatments, grooming, facials, styling, massages, and more. Discover popular services customers are choosing and book convenient beauty and wellness appointments near you.
          </motion.p>
        </motion.div>

        {/* Carousel Navigation Buttons */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollCards('left')}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white shadow-2xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollCards('right')}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white shadow-2xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Spa Services Slider / Responsive Grid */}
        <div
          ref={scrollRef}
          className={`overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 ${
            shouldDesktopScroll ? 'xl:overflow-x-auto' : 'xl:overflow-visible'
          }`}
        >
          <div
            className={`flex gap-4 sm:gap-5 snap-x snap-mandatory ${
              shouldDesktopScroll
                ? 'min-w-max'
                : `min-w-max xl:min-w-0 xl:grid ${
                    spaStores.length === 1 ? 'xl:grid-cols-1 max-w-sm mx-auto' :
                    spaStores.length === 2 ? 'xl:grid-cols-2 max-w-2xl mx-auto' :
                    spaStores.length === 3 ? 'xl:grid-cols-3 max-w-4xl mx-auto' :
                    spaStores.length === 4 ? 'xl:grid-cols-4' :
                    spaStores.length === 5 ? 'xl:grid-cols-5' :
                    'xl:grid-cols-6'
                  } xl:snap-none`
            }`}
          >
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[260px] sm:w-[280px] shrink-0 snap-start xl:w-auto">
                  <div className="h-[380px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                </div>
              ))
            ) : (
              spaStores.map((place, index) => (
                <motion.div
                  key={place._id || index}
                  data-scroll-card="latest-spa"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className={`group relative w-[260px] sm:w-[280px] shrink-0 snap-start cursor-pointer ${
                    shouldDesktopScroll ? '' : 'xl:w-auto'
                  }`}
                  onClick={() => handleStoreClick(place)}
                >
                  {/* Clean, Uniform Card with Dynamic Heights and Proper Alignment */}
                  <div className="relative h-full flex flex-col rounded-2xl border border-[#037166]/20 bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-[#037166]/40 transition-all duration-300 overflow-hidden">
                    {/* Top Badge */}
                    <div className="spa-badge absolute top-0 left-1/2 z-20 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-b-lg bg-gradient-to-r from-[#037166] via-[#049486] to-[#037166] px-4 py-1 shadow-md">
                      <Award className="w-3.5 h-3.5 !text-white shrink-0" style={{ color: '#ffffff' }} />
                      <span className="text-[10px] font-extrabold !text-white uppercase tracking-wider" style={{ color: '#ffffff' }}>
                        {place.badge}
                      </span>
                    </div>

                    {/* Image with Aspect Ratio */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <ImageWithFallback
                        src={place.image}
                        alt={place.storeName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Floating Content Box */}
                    <div className="relative z-10 -mt-6 mx-3 mb-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between flex-1">
                      {/* Category & Title */}
                      <div className="mb-2">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-[#008C80] mb-1 truncate">
                          {place.category}
                        </span>
                        <h4
                          className="text-sm font-extrabold text-[#101828] leading-tight line-clamp-2 h-10 group-hover:text-[#008C80] transition-colors"
                          title={place.storeName}
                        >
                          {place.storeName}
                        </h4>
                      </div>

                      {/* Price & Action Box with Fixed Safe Vertical Rhythm */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-[#008C80]/15 bg-[#E9F8F6]/60 px-3 py-2 my-2">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
                            Starting at
                          </span>
                          <span className="text-xs sm:text-sm font-black text-[#6D1357] leading-tight truncate">
                            {place.price}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="spa-view-details-btn rounded-full bg-[#008C80] group-hover:bg-[#006D65] px-3 py-1.5 text-[9px] font-bold !text-white shadow-2xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                          style={{ color: '#ffffff' }}
                        >
                          <span className="!text-white text-white font-bold" style={{ color: '#ffffff' }}>
                            View Details
                          </span>
                        </button>
                      </div>

                      {/* 2x2 Highlights / Amenities Grid */}
                      <div className="grid grid-cols-2 gap-1.5 mt-auto pt-1">
                        {place.highlights.map((highlight, idx) => {
                          const Icon = amenityIcons[highlight] || Sparkles;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5 min-w-0"
                              title={highlight}
                            >
                              <Icon className="h-3 w-3 shrink-0 text-[#d4af37]" />
                              <span className="text-[10px] font-medium text-gray-700 truncate leading-none">
                                {highlight}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
