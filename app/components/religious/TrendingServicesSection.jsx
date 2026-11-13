'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';

function resolveImage(src) {
  if (!src) return '';
  if (typeof src !== 'string') return '';
  if (src.startsWith('http')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com';
  return `${baseUrl}/${src.replace(/^\//, '')}`;
}

const DEFAULT_TRENDING_ITEMS = [
  {
    _id: 'trending-1',
    business_name: 'Sri Lalitha Pooja Services',
    description: 'Expert religious services for your sacred needs.',
    startingAt: 499,
    avgRating: 4.8,
    image: 'https://images.unsplash.com/photo-1609358905581-e5382c2069b2?auto=format&fit=crop&w=700&q=80',
    slug: 'sri-lalitha-pooja-services',
  },
  {
    _id: 'trending-2',
    business_name: 'Satya Sailesh pooja services',
    description: 'Satya Sai Pooja Services - Divine Spiritual Services with Devotion & Tradition.',
    startingAt: 499,
    avgRating: 4.8,
    image: 'https://images.unsplash.com/photo-1545232979-fbf6c63283f3?auto=format&fit=crop&w=700&q=80',
    slug: 'satya-sailesh-pooja-services',
  },
  {
    _id: 'trending-3',
    business_name: 'Sree Uma Maheswara Astrology & Allied',
    description: 'Trusted Vedic astrology and pooja services.',
    startingAt: 999,
    avgRating: 4.8,
    image: 'https://images.unsplash.com/photo-1567591414240-e2518e388d74?auto=format&fit=crop&w=700&q=80',
    slug: 'sree-uma-maheswara-astrology-allied-services',
  },
];

export default function TrendingServicesSection({
  services = [],
  loading = false,
  onOpenService,
  onBookNow,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine backend services or fall back to reference trending items
  const items = useMemo(() => {
    if (services && services.length > 0) {
      return services;
    }
    return DEFAULT_TRENDING_ITEMS;
  }, [services]);

  const maxIndex = Math.max(0, items.length - 3);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Slice visible cards (3 on desktop)
  const visibleCards = items.slice(currentIndex, currentIndex + 3);

  return (
    <section aria-label="Trending & Popular Services" className="w-full pt-4 pb-6 sm:pt-6 sm:pb-8 md:pt-8 md:pb-10 bg-[#FFF9EF]">
      <div className="container max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header with Devotional Flourish */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[#E96B18] text-sm sm:text-base">🪷</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-[#4C124D] tracking-tight">
              Trending & Popular <span className="text-[#E96B18]">Services</span>
            </h2>
            <span className="text-[#E96B18] text-sm sm:text-base">🪷</span>
          </div>

          <p className="text-xs sm:text-sm text-[#685D68] max-w-xl font-normal">
            Most booked poojas and rituals by our devotees
          </p>
        </div>

        {/* Carousel / Cards Grid with Left & Right Arrows */}
        <div className="relative">
          {/* Prev Button (Desktop) */}
          {items.length > 3 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous services"
              className={`hidden lg:flex absolute -left-4 xl:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#EAD8C3] shadow-md items-center justify-center transition-all cursor-pointer ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-gray-300'
                  : 'text-[#4C124D] hover:bg-[#FFE5B2] hover:border-[#E8B34E]'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Cards Grid: Mobile horizontal swipe snap, desktop 3-col grid */}
          <div className="w-full flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-3 snap-x snap-mandatory scrollbar-none">
            {loading && items.length === 0 && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`trend-skel-${i}`}
                    className="h-80 w-[82vw] sm:w-[320px] md:w-auto shrink-0 rounded-2xl bg-white border border-[#EAD8C3] animate-pulse"
                  />
                ))}
              </>
            )}

            {visibleCards.map((service, idx) => {
              const businessName =
                service.business_name ||
                service.serviceName ||
                `${service.firstName || ''} ${service.lastName || ''}`.trim() ||
                'Sacred Pooja Service';

              const description =
                service.description ||
                service.bio?.replace(/<[^>]+>/g, '') ||
                'Expert religious services for your sacred needs.';

              const startingPrice =
                service.startingAt ||
                service.serviceBookingCost ||
                service.BasePrice ||
                service.minFare ||
                499;

              const imgSrc =
                resolveImage(service.image) ||
                (idx === 0
                  ? 'https://images.unsplash.com/photo-1609358905581-e5382c2069b2?auto=format&fit=crop&w=700&q=80'
                  : idx === 1
                  ? 'https://images.unsplash.com/photo-1545232979-fbf6c63283f3?auto=format&fit=crop&w=700&q=80'
                  : 'https://images.unsplash.com/photo-1567591414240-e2518e388d74?auto=format&fit=crop&w=700&q=80');

              return (
                <article
                  key={service._id || idx}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#EAD8C3] hover:border-[#E8B34E] shadow-xs hover:shadow-xl transition-all duration-300 w-[82vw] sm:w-[320px] md:w-auto shrink-0 snap-center md:shrink"
                >
                  {/* Top Image Part */}
                  <div
                    onClick={() => onOpenService && onOpenService(service)}
                    className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D4] cursor-pointer"
                  >
                    <Image
                      src={imgSrc}
                      alt={businessName}
                      fill
                      sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 sm:p-5 flex flex-col flex-1">
                    {/* Badge & Rating Row */}
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Service
                      </span>

                      <div className="flex items-center text-xs sm:text-sm font-semibold text-[#30252C]">
                        <Star className="w-3.5 h-3.5 fill-[#E8B34E] text-[#E8B34E] mr-1" />
                        <span>{service.avgRating || 4.8}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onOpenService && onOpenService(service)}
                      className="font-bold text-sm sm:text-base md:text-lg text-[#30252C] group-hover:text-[#E96B18] transition-colors line-clamp-1 leading-snug cursor-pointer mb-1"
                    >
                      {businessName}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#685D68] line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                      {description}
                    </p>

                    {/* Bottom Bar: Price & Book Now Button */}
                    <div className="mt-auto pt-2.5 sm:pt-3 border-t border-[#F0E5D8] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 italic">Starting from</span>
                        <span className="text-sm sm:text-base md:text-lg font-bold text-[#30252C]">
                          ₹{startingPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onBookNow) onBookNow(service);
                          else if (onOpenService) onOpenService(service);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#650B50] hover:bg-[#440A40] text-white text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer active:scale-95"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Next Button (Desktop) */}
          {items.length > 3 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              aria-label="Next services"
              className={`hidden lg:flex absolute -right-4 xl:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#EAD8C3] shadow-md items-center justify-center transition-all cursor-pointer ${
                currentIndex >= maxIndex
                  ? 'opacity-40 cursor-not-allowed text-gray-300'
                  : 'text-[#4C124D] hover:bg-[#FFE5B2] hover:border-[#E8B34E]'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
