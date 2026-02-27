'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export function TopCategories({ onViewAll }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Continuous "Marquee" Auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!isLoading && categories.length > 0 && container) {
      // Disable CSS smooth scrolling for manual control if needed, quite abrupt otherwise?
      // Actually simply setting scrollLeft works well for marquee.

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
  }, [isLoading, categories, isPaused]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 1. Check localStorage first
        if (typeof window !== 'undefined') {
          const savedLocation = localStorage.getItem('user_location_data');
          if (savedLocation) {
            try {
              const parsed = JSON.parse(savedLocation);
              // Use lat/lng and look for alternatives too
              const lat = parsed.lat || parsed.lattitude;
              const lng = parsed.lng || parsed.longitude;

              if (lat && lng) {
                await fetchCategoriesFromAPI(lat.toString(), lng.toString());
                return;
              }
            } catch (e) {
              console.error('Error parsing saved location:', e);
            }
          }
        }

        // 2. Fallback to GPS or Default
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchCategoriesFromAPI(latitude.toString(), longitude.toString());
            },
            () => {
              fetchWithDefaultLocation();
            },
            { timeout: 5000 } // Add a timeout for safety
          );
        } else {
          fetchWithDefaultLocation();
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setIsLoading(false);
      }
    };

    const fetchCategoriesFromAPI = async (lattitude, longitude) => {
      try {
        const body = lattitude && longitude ? { lattitude, longitude } : {};
        const response = await fetch(
          'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getallcategorys',
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
            image: `https://api.doorstephub.com/${item.image}`,
            _id: item._id,
            status: item.status,
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWithDefaultLocation = async () => {
      await fetchCategoriesFromAPI('17.4391296', '78.4433152'); // Hyderabad
    };

    fetchCategories();
  }, []);

  // Skeleton Shimmer Component
  const SkeletonCategoryCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      className="group cursor-pointer"
    >
      <div className="relative w-72 lg:w-[210px] h-64 lg:h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
        {/* Skeleton Image */}
        <div className="absolute inset-0 animate-shimmer">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-3xl" />
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
      <motion.div style={{ opacity, y }} className="max-w-[1400px] mx-auto px-6 lg:px-8">
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
              className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent"
            >
              Explore Top Categories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg max-w-2xl"
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
          <div ref={scrollRef} className="overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-6 min-w-max">
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCategoryCard key={`skeleton-${index}`} />
                ))
                : categories.map((category, index) => (
                  <motion.div
                    key={category._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -12 }}
                    onClick={() => router.push(`/services/category/${category._id}?name=${encodeURIComponent(category.title)}`)}
                    className="group cursor-pointer"
                  >
                    <div className="relative w-72 lg:w-[210px] h-54 lg:h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
                      {/* Image */}
                      <div className="absolute inset-0">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>

                      {/* Hover Glow Effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-[#037166]/40 via-[#037166]/10 to-transparent"
                      />

                      {/* Glass Card Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="relative z-10">
                          <h4 className="text-xl  bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-bold mb-2 group-hover:text-[#04a99d] transition-colors">
                            {category.title}
                          </h4>
                          <motion.div
                            initial={{ width: 0 }}
                            whileHover={{ width: '60px' }}
                            className="h-1 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full"
                          />
                        </div>
                      </div>

                      {/* Glassmorphism Border on Hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 rounded-3xl border-2 border-[#037166]/50 pointer-events-none"
                        style={{ boxShadow: '0 0 20px rgba(3, 113, 102, 0.3)' }}
                      />

                      {/* Floating Arrow */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
                      >
                        <ChevronRight className="w-5 h-5 text-[#04a99d]" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
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
