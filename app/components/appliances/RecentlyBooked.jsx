'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ArrowRight, Users } from 'lucide-react';
import { toast } from 'sonner';

export function RecentlyBooked({ onServiceClick, onViewAll }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real recently booked services
  useEffect(() => {
    const fetchRecentServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/latest_bookings_services', {
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
          // Transform API data to match component structure
          const transformedServices = data.services.slice(0, 10).map(service => ({
            id: service._id,
            image: service.mainImage ? `https://api.doorstephub.com/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400',
            title: service.serviceName,
            description: `${service.categoryName} - ${service.subcategoryName}`,
            price: service.serviceBookingCost, // Default pricing (can be fetched from rate cards if needed)
            bookings: Math.floor(Math.random() * 200) + 50, // Random bookings for demo
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

  // Shimmer Skeleton Card (Carousel Item)
  const ShimmerRecentCard = () => (
    <div className="flex-shrink-0 w-80">
      <div className="relative w-full h-[380px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
        {/* Shimmer Badge */}
        <div className="absolute top-4 left-4 z-20 h-8 w-36 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />

        {/* Shimmer Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Shimmer Content */}
        <div className="p-5">
          {/* Title Shimmer */}
          <div className="h-6 w-3/4 mb-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />

          {/* Description Shimmer */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            <div className="h-4 w-2/3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>

          {/* Price & CTA Shimmer */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3 w-10 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
              <div className="h-8 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />
            </div>
            <div className="h-12 w-28 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <section className="py-5 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4">
              <TrendingUp className="w-3 h-3 text-[#04a99d]" />
              <h6 className="text-xs font-medium text-[#04a99d]">TRENDING NOW</h6>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Explore Our Recently Booked Services</h2>
            <p className="text-white/60">See what services your neighbors are booking right now</p>
          </div>

          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-6 min-w-max">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ShimmerRecentCard key={`shimmer-recent-${index}`} />
                ))}
              </div>
            </div>
            {/* Fade Edges */}
            <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
          </div>
        </div>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    );
  }

  // Error state
  if (error || services.length === 0) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-white/60 mb-4">{error || 'No recent bookings available'}</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-all">
              Refresh Page
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-1 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4"
          >
            <TrendingUp className="w-3 h-3 text-[#04a99d]" />
            <h6 className="text-sm font-medium text-[#04a99d]">TRENDING NOW</h6>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent"
          >
            Explore Our Recently Booked Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            See what services your neighbors are booking right now ({services.length} services)
          </motion.p>
        </div>

        {/* Horizontal Scrolling Carousel */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex gap-6 min-w-max">
              {services.map((service, index) => (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer flex-shrink-0 w-80"
                  onClick={() => onServiceClick?.(service.id, service.categoryName, service.subcategoryName, service.slug)}
                >
                  <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
                    {/* Booking Badge */}


                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Hover Glow */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 to-transparent"
                      />

                      {/* Book Now Button Badge - Bottom Center */}
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 px-6 py-1 bg-[#037166] backdrop-blur-md rounded-t-lg rounded-b-none text-white shadow-lg border border-b-0 border-[#037166]/20 whitespace-nowrap cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-[#025951]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onServiceClick?.(service.id, service.categoryName, service.subcategoryName, service.slug);
                        }}
                      >
                        <h6 className="text-[12px] font-ubuntu tracking-wider text-white">Book Now</h6>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-2">
                        {service.title}
                      </h4>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>


                    </div>

                    {/* Glass Border on Hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl border-2 border-[#037166]/50 pointer-events-none"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-lg shadow-lg shadow-[#037166]/30 hover:shadow-[#037166]/50 transition-all inline-flex items-center gap-3"
            onClick={onViewAll}
          >
            View All Services
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
