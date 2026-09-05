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
            let str = String(text).trim().replace(/\s*\([^)]*\)/g, '');
            const mappings = {
              'Steam room or sauna': 'Steam Room',
              'Steam room': 'Steam Room',
              'Sauna': 'Sauna',
              'Hot towel service': 'Hot Towel',
              'Relaxation lounges': 'Relaxation Lounge',
              'Complimentary beverages': 'Beverages',
              'Robes & slippers': 'Robes & Slippers',
              'Lockers & secure storage': 'Secure Lockers',
              'Lockers & secure storage for personal items': 'Secure Lockers',
              'Haircut': 'Haircut',
              'Hair Coloring': 'Hair Color',
              'Styling': 'Styling',
              'Facial': 'Facial',
              'Massage': 'Massage',
              'Premium Products': 'Premium Products',
            };
            if (mappings[str]) return mappings[str];
            if (str.length > 20) {
              const words = str.split(' ');
              if (words.length > 2) return words.slice(0, 2).join(' ');
            }
            return str;
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
  const shouldDesktopScroll = isDesktop && spaStores.length > 6;
  const scrollCards = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.querySelector('[data-scroll-card="latest-spa"]');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 228;
    const amount = cardWidth + 16;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="relative py-22 overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/20 rounded-full blur-[170px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/15 rounded-full blur-[170px] pointer-events-none" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-transparent">
              Recently Booked Spa & Saloons
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-400 text-lg max-w-5xl mx-auto"
          >
            Explore recently booked spa and salon services for hair care, beauty treatments, grooming, facials, styling, massages, and more. Discover popular services customers are choosing and book convenient beauty and wellness appointments near you.
          </motion.p>
        </motion.div>

        <div className="mb-4 flex items-center justify-end gap-2">
          <button type="button" onClick={() => scrollCards('left')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white" aria-label="Scroll left">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollCards('right')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white" aria-label="Scroll right">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Spa Services Slider */}
        <div
          ref={scrollRef}
          className={`overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4 xl:mx-0 ${shouldDesktopScroll ? 'xl:px-0' : 'xl:px-0 xl:overflow-visible'}`}
        >
          <div className={`flex min-w-max gap-4 snap-x snap-mandatory ${shouldDesktopScroll ? '' : 'xl:min-w-0 xl:grid xl:grid-cols-6 xl:snap-none'}`}>
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group relative w-[228px] shrink-0 snap-start xl:w-auto">
                  <div className="relative h-[320px] rounded-2xl bg-white/5 animate-pulse" />
                </div>
              ))
            ) : (
              spaStores.map((place, index) => (
                <motion.div
                  key={place._id || index}
                  data-scroll-card="latest-spa"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.7 }}
                  className={`group relative w-[228px] shrink-0 snap-start cursor-pointer ${shouldDesktopScroll ? '' : 'xl:w-auto'}`}
                  onClick={() => handleStoreClick(place)}
                >
                  {/* Premium Card - Matching Recommended Spa & Salon */}
                  <div className="relative h-full overflow-hidden rounded-2xl border-2 border-[#037166]/30 bg-gradient-to-br from-[#1a1a1a] via-[#1a1510] to-[#0f0f0f]">
                    {/* Top Badge */}
                    <div className="absolute top-0 left-1/2 z-20 flex -translate-x-1/2 items-center space-x-2 whitespace-nowrap rounded-lg rounded-t-none border border-t-0 border-[#037166]/30 bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] px-5 py-1 shadow-lg backdrop-blur-md">
                      <Award className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold !text-white uppercase tracking-wider block">{place.badge}</span>
                    </div>

                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <ImageWithFallback
                        src={place.image}
                        alt={place.storeName}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 -mt-10 p-4">
                      <motion.div
                        className="mb-4 flex h-[220px] flex-col rounded-2xl border border-[#037166]/30 bg-[#1a1a1a]/90 p-3 shadow-xl backdrop-blur-xl"
                      >
                        <div className="mb-2 min-h-[48px]">
                          <h6 className="mb-1 bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-[10px] font-semibold uppercase tracking-[0.18em] text-transparent">
                            {place.category}
                          </h6>
                          <h4 className="line-clamp-2 w-full bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-[15px] font-bold leading-tight text-transparent" title={place.storeName}>
                            {place.storeName}
                          </h4>
                        </div>

                        {/* Price & Action */}
                        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-[#037166]/20 bg-[#037166]/5 p-2">
                          <div>
                            <h6 className="mb-0.5 font-ubuntu text-[9px] text-gray-400">
                              Starting at
                            </h6>
                            <div className="font-ubuntu text-[11px] font-bold text-[#6D1357]">
                              {place.price}
                            </div>
                          </div>

                          <div>
                            <div className="whitespace-nowrap rounded-full bg-[#297A70] px-3 py-1.5 text-[9px] font-semibold shadow-lg">
                              <span className="!text-white">
                                View Details
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Highlights / Amenities */}
                        <div className="mt-auto grid grid-cols-2 gap-2">
                          {place.highlights.map((highlight, idx) => {
                            const Icon = amenityIcons[highlight] || Sparkles;
                            return (
                              <div key={idx} className="flex min-h-[36px] items-center space-x-1.5 rounded-lg border border-[#037166]/10 bg-[#1a1a1a]/50 px-2 py-1.5">
                                <Icon className="h-3 w-3 shrink-0 text-[#d4af37]" />
                                <span className="text-[9px] text-gray-300 leading-tight break-words">{highlight}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
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
