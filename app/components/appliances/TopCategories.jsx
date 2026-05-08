'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ChevronRight, MapPin } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';

export function TopCategories({ onViewAll }) {
  const router = useRouter();
  const { location } = useLocationContext();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Continuous auto-scroll effect for mobile only
  useEffect(() => {
    const container = scrollRef.current;
    if (!isLoading && categories.length > 0 && container && isMobile) {
      let animationId;
      const scroll = () => {
        if (!isPaused && container) {
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
            container.scrollLeft = 0;
          } else {
            container.scrollLeft += 1;
          }
        }
        animationId = requestAnimationFrame(scroll);
      };

      animationId = requestAnimationFrame(scroll);
      return () => cancelAnimationFrame(animationId);
    }
  }, [isLoading, categories, isPaused, isMobile]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!location?.lat || !location?.lng) {
        setIsLoading(false); // Stop loading, wait for location
        return;
      }

      setIsLoading(true);
      try {
        const body = {
          lattitude: location.lat.toString(),
          longitude: location.lng.toString()
        };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const mappedCategories = result.data.map((item) => ({
            title: item.name,
            image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}`,
            _id: item._id,
            status: item.status,
            slug: item.slug,
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [location?.lat, location?.lng]);

  // Skeleton Shimmer Component
  const SkeletonCategoryCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      className="group cursor-pointer snap-start shrink-0 md:w-auto"
    >
      <div className="relative h-40 w-32 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] backdrop-blur-sm sm:h-48 sm:w-40 md:h-52 md:w-full xl:h-56">
        {/* Skeleton Image */}
        <div className="absolute inset-0 animate-shimmer">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Skeleton Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="relative z-10">
            <div className="h-8 w-48 mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />
            <div className="h-1 w-16 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full animate-shimmer" />
          </div>
        </div>

        {/* Skeleton Arrow */}
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center animate-shimmer" />
      </div>
    </motion.div>
  );

  return (
    <section ref={sectionRef} className="py-1 relative overflow-hidden">
      <motion.div style={{ opacity, y }} className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4"
            >
              <div className="w-2 h-2 rounded-full bg-[#04a99d] animate-pulse" />
              <h6 className="text-sm font-medium text-[#04a99d]">POPULAR</h6>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold mb-4 text-white"
            >
              Explore Top Categories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white text-lg max-w-2xl"
            >
              Browse our most requested services
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#037166]/50 transition-all duration-300 group"
            onClick={onViewAll}
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Horizontal Scrolling Cards */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex min-w-max gap-4 snap-x snap-mandatory md:grid md:min-w-0 md:grid-cols-4 md:gap-4 md:snap-none xl:grid-cols-8">
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCategoryCard key={`skeleton-${index}`} />
                ))
                : categories.length > 0 ? categories.map((category, index) => (
                  <motion.div
                    key={category._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -12 }}
                    onClick={() => router.push(`/${category.slug}`)}
                    className="group cursor-pointer snap-start shrink-0 md:w-auto"
                  >
                    <div className="relative h-40 w-32 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] backdrop-blur-sm sm:h-48 sm:w-40 md:h-52 md:w-full xl:h-56">
                      {/* Image */}
                      <div className="absolute inset-0">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                      </div>

                      {/* Hover Glow Effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-[#037166]/40 via-[#037166]/10 to-transparent"
                      />

                      {/* Glass Card Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <div className="relative z-10">
                          <h4 className="text-sm sm:text-base !text-white font-bold mb-1 transition-colors line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                            {category.title}
                          </h4>
                          <motion.div
                            initial={{ width: 0 }}
                            whileHover={{ width: '40px' }}
                            className="h-1 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full"
                          />
                        </div>
                      </div>

                      {/* Glassmorphism Border on Hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 rounded-2xl border-2 border-[#037166]/50 pointer-events-none"
                        style={{ boxShadow: '0 0 20px rgba(3, 113, 102, 0.3)' }}
                      />

                      {/* Floating Arrow */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4 text-[#04a99d]" />
                      </motion.div>
                    </div>
                  </motion.div>
                )) : !location ? (
                  <div className="w-full py-12 flex flex-col items-center justify-center text-center">
                    <MapPin className="w-8 h-8 text-[#037166] mb-3 opacity-50" />
                    <p className="text-gray-500 text-sm mb-4">Set your location to view popular categories</p>
                    <button
                      onClick={() => document.querySelector('[data-location-trigger]')?.click()}
                      className="text-xs font-bold text-[#04a99d] uppercase tracking-wider hover:underline"
                    >
                      Select Location
                    </button>
                  </div>
                ) : (
                  <div className="w-full py-12 text-center text-gray-500">No categories found for this location</div>
                )
              }
            </div>
          </div>

        </div>
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
          0% { 
            background-position: -200% 0; 
          }
          100% { 
            background-position: 200% 0; 
          }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
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

