'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { fetchFeaturedServices, imageLoader } from '@/lib/api';

export function FeaturedServices({ onViewAll, onServiceClick }) {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
      {/* Shimmer Badge */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer h-7 w-20" />

      {/* Shimmer Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Shimmer Content */}
      <div className="p-6">
        {/* Rating Shimmer */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />
          <div className="h-4 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        </div>

        {/* Title Shimmer */}
        <div className="h-6 w-3/4 mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />

        {/* Description Shimmer */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-2/3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        </div>

        {/* Button Shimmer */}
        <div className="flex items-center justify-end">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1614]/30 to-transparent" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4">
              <div className="w-3 h-3 bg-[#04a99d]/50 rounded-full" />
              <span className="text-xs font-medium text-[#04a99d]">FEATURED</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Explore Our Featured Service</h2>
            <p className="text-white/60">Top-rated services trusted by thousands of customers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <ShimmerServiceCard key={`shimmer-${index}`} />
            ))}
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
        `}</style>
      </section>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 rounded-full bg-[#037166]/20 border border-[#037166]/50 text-white hover:bg-[#037166]/40 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section id="featured-services" className="py-15 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1614]/30 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4"
          >
            <Sparkles className="w-3 h-3 text-[#04a99d]" />
            <h6 className="text-sm font-medium text-[#04a99d]">FEATURED</h6>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent"
          >
            Explore Our Featured Service
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Top-rated services trusted by thousands of customers
          </motion.p>
        </div>

        {/* Services Horizontal Scroller */}
        <div className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory py-6">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="flex-shrink-0 w-[85%] sm:w-[50%] md:w-[33%] lg:w-[22%] xl:w-[15.5%] snap-start group cursor-pointer"
              onClick={() => onServiceClick?.(service._id, service.categoryName, service.subcategoryName)}
            >
              <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
                {/* Featured Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="absolute top-0 inset-x-0 mx-auto w-fit z-20 px-6 py-1 bg-gradient-to-r from-[#037166] to-[#04a99d] backdrop-blur-md rounded-full rounded-t-none border border-t-0 border-[#037166]/30 shadow-lg whitespace-nowrap flex items-center space-x-2"
                >
                  <h6 className="m-0 text-white text-xs font-bold w-full text-center">{service.serviceDelhiveryType || 'Featured'}</h6>
                </motion.div>

                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={imageLoader({ src: service.mainImage })}
                    alt={service.serviceName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Hover Glow */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 to-transparent"
                  />

                  <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-[#037166] flex items-center justify-center shadow-lg shadow-black/40 border border-white/20"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>

                  {/* Rating Badge - Bottom Left */}
                  <div className="absolute bottom-0 left-0 z-20">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border-t border-r border-white/10">
                      <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                      <span className="text-sm font-bold text-white">{service.rating || '4.8'}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">


                  {/* Title */}
                  <h4 className="text-xl bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-bold mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                    {service.serviceName}
                  </h4>

                  {/* Description */}
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

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full  bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent hover:bg-white/10 border border-white/10 hover:border-[#037166]/50 text-white font-medium transition-all duration-300 flex items-center gap-2 group"
            onClick={onViewAll}
          >
            View All Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
