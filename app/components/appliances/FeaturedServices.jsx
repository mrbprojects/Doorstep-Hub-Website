'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Star, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchFeaturedServices, imageLoader } from '@/lib/api';

// Utility to clean raw HTML tags into clean, readable text
function cleanDescription(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function FeaturedServices({ onViewAll, onServiceClick }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = React.useRef(null);

  const scrollCards = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.querySelector('[data-featured-card="true"]');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
    const amount = cardWidth + 24;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await fetchFeaturedServices();
        setServices(data);
      } catch (err) {
        console.error('Error loading featured services:', err);
        setError('Failed to load featured services');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Shimmer Skeleton Card
  const ShimmerServiceCard = () => (
    <div className="relative h-full rounded-2xl overflow-hidden bg-white border border-gray-200/90 shadow-sm animate-pulse flex flex-col justify-between">
      <div className="relative h-44 sm:h-48 bg-gray-100 flex-shrink-0" />
      <div className="p-3.5 sm:p-4 space-y-2 flex-1">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="py-8 sm:py-10 lg:py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00796B]/10 border border-[#00796B]/20 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00796B]" />
              <span className="text-xs font-bold text-[#00796B] tracking-wider uppercase">FEATURED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Explore Our Featured Service</h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl">Top-rated services trusted by thousands of customers</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <ShimmerServiceCard key={`shimmer-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-full bg-[#00796B] text-white hover:bg-[#00605A] transition-all font-semibold text-xs"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section id="featured-services" className="py-8 sm:py-10 lg:py-12 relative overflow-hidden">
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00796B]/10 border border-[#00796B]/20 mb-2.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00796B]" />
              <h6 className="text-xs font-bold text-[#00796B] tracking-wider uppercase">FEATURED</h6>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 tracking-tight"
            >
              Explore Our Featured Service
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed"
            >
              Discover our most popular home appliance services, chosen by customers for convenient doorstep support, skilled technicians, clear service guidance, and reliable repair solutions for everyday appliance problems.
            </motion.p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-end shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => scrollCards('left')}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xs transition hover:bg-[#00796B] hover:text-white hover:border-[#00796B]"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCards('right')}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xs transition hover:bg-[#00796B] hover:text-white hover:border-[#00796B]"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            {onViewAll && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-[#00796B] to-[#009688] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#00796B]/20 hover:shadow-lg hover:shadow-[#00796B]/40 hover:opacity-95 transition-all inline-flex items-center gap-2"
                onClick={onViewAll}
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Services Horizontal Scroller */}
        <div ref={scrollRef} className="flex overflow-x-auto gap-4 sm:gap-5 scroll-smooth snap-x snap-mandatory py-2 pb-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              data-featured-card="true"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="shrink-0 w-[82%] xs:w-[70%] sm:w-[48%] md:w-[32%] lg:w-[22%] xl:w-[15.5%] snap-start group cursor-pointer"
              onClick={() => onServiceClick?.(service._id, service.categoryName, service.subcategoryName, service.slug)}
            >
              <div className="relative h-full rounded-2xl overflow-hidden bg-white border border-gray-200/90 hover:border-[#00796B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
                {/* Category / Delivery Badge at top center */}
                {(service.categoryName || service.serviceDelhiveryType) && (
                  <div className="absolute top-0 inset-x-0 mx-auto w-fit z-20 px-3.5 py-0.5 bg-[#00897B] rounded-b-xl text-white text-[10px] sm:text-[11px] font-bold shadow-xs whitespace-nowrap pointer-events-none">
                    <span>{service.categoryName || service.serviceDelhiveryType}</span>
                  </div>
                )}

                {/* Service Image */}
                <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-50 shrink-0 border-b border-gray-100">
                  <Image
                    src={imageLoader({ src: service.mainImage || service.image })}
                    alt={service.serviceName || 'Featured Service'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400';
                    }}
                   width={500} height={300} />

                  {/* Rating Badge - Bottom Left */}
                  <div className="absolute bottom-2 left-2 z-20">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{service.rating || '4.8'}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#00796B] transition-colors line-clamp-1 mb-1.5 leading-snug">
                      {service.serviceName}
                    </h4>

                    {/* Clean Description */}
                    <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {cleanDescription(service.description) || 'Professional doorstep appliance repair and diagnostics.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
