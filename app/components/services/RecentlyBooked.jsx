'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function RecentlyBooked({ onServiceClick, onViewAll }) {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real recently booked services
  useEffect(() => {
    const fetchRecentServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_bookings_services`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recent services');
        }

        const data = await response.json();
        if (data.success && data.services) {
          // Transform API data to match component structure - exactly 12 items for 2 rows of 6
          const transformedServices = data.services.slice(0, 12).map(service => ({
            id: service._id,
            image: service.mainImage ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400',
            title: service.serviceName,
            price: service.serviceBookingCost,
            bookings: Math.floor(Math.random() * 200) + 50,
            categoryName: service.categoryName,
            subcategoryName: service.subcategoryName,
            slug: service.slug,
          }));
          setServices(transformedServices);
        } else {
          throw new Error(data.message || 'No services found');
        }
      } catch (err) {
        console.error('Error fetching recent services:', err);
        setError('Failed to load recent services');
        toast.error('Failed to load recent services');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentServices();
  }, []);

  // Shimmer Skeleton Card (6-column grid item)
  const ShimmerRecentCard = () => (
    <div className="w-full h-[250px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm animate-pulse flex flex-col justify-between">
      <div className="relative h-32 bg-white/5" />
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-3/4 bg-white/10 rounded" />
          <div className="h-3 w-1/2 bg-white/5 rounded" />
        </div>
        <div className="h-8 w-full bg-[#037166]/20 rounded-xl mt-auto" />
      </div>
    </div>
  );

  // Loading state (6 per row, total 12)
  if (loading) {
    return (
      <section className="py-8 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-3">
              <TrendingUp className="w-3 h-3 text-[#04a99d]" />
              <h6 className="text-xs font-medium text-[#04a99d]">TRENDING NOW</h6>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-white">Explore Our Recently Booked Services</h2>
            <p className="text-white/60 text-sm sm:text-base">See what services your neighbors are booking right now</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ShimmerRecentCard key={`shimmer-recent-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || services.length === 0) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-white/60 mb-4">{error || 'No recent bookings available'}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-3"
          >
            <TrendingUp className="w-3 h-3 text-[#04a99d]" />
            <h6 className="text-xs font-semibold text-[#04a99d] tracking-wider uppercase">TRENDING NOW</h6>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-white"
          >
            Explore Our Recently Booked Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm sm:text-base max-w-2xl"
          >
            See what services your neighbors are booking right now
          </motion.p>
        </div>

        {/* Services Grid: 6 per row on desktop, total 12 (2 rows of 6) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {services.slice(0, 12).map((service, index) => {
            const dynamicUrl = service.slug ? `/${service.slug.replace(/^\//, '')}` : '#';

            return (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => {
                  if (service.slug) {
                    router.push(dynamicUrl);
                  } else {
                    onServiceClick?.(service.id, service.categoryName, service.subcategoryName, service.slug);
                  }
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/60 shadow-lg hover:shadow-[#037166]/20 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
                  
                  {/* Service Image */}
                  <div className="relative h-32 sm:h-36 overflow-hidden bg-slate-900 flex-shrink-0">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-black/30" />

                    {/* Category Tag */}
                    {service.categoryName && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-[#5eead4] truncate max-w-[110px]">
                        {service.categoryName}
                      </span>
                    )}

                    {/* Hover Glow */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 to-transparent pointer-events-none"
                    />
                  </div>

                  {/* Card Content - Description Hidden */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs sm:text-[13px] font-bold text-white mb-3 group-hover:text-[#5eead4] transition-colors line-clamp-2 leading-snug">
                      {service.title}
                    </h4>

                    {/* Book Service Button with dynamic link */}
                    <Link
                      href={dynamicUrl}
                      onClick={(e) => {
                        e.stopPropagation();
                        onServiceClick?.(service.id, service.categoryName, service.subcategoryName, service.slug);
                      }}
                      className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#04a99d] hover:to-[#037166] text-white text-[11px] sm:text-xs font-bold shadow-md shadow-[#037166]/20 hover:shadow-lg hover:shadow-[#037166]/40 transition-all active:scale-95 group-hover:scale-[1.02]"
                    >
                      <span>Book Service</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Glass Border on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl border-2 border-[#037166]/50 pointer-events-none"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        {onViewAll && (
          <div className="text-center mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#037166]/30 hover:shadow-[#037166]/50 transition-all inline-flex items-center gap-2"
              onClick={onViewAll}
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
