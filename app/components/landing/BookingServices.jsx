'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Calendar, Clock, Star, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

function SkeletonCard() {
  return (
    <div className="h-auto bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-3xl overflow-hidden">
      <div className="h-40 bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-24 bg-[#2a2a2a] rounded animate-pulse" />
        <div className="h-5 bg-[#2a2a2a] rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}

export function BookingServices() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [serviceSlugs, setServiceSlugs] = useState({
    appliances: 'appliances',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels'
  });

  // Fetch Service Slugs and Services
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Slugs
        const servicesToFetchSlugs = [
          { id: '683daaa8f261c1548bdf7442', key: 'appliances' },
          { id: '695250aa57bb211ca094e5fd', key: 'religious' },
          { id: '69524f4a57bb211ca094e5e6', key: 'spa' },
          { id: '69524fb157bb211ca094e5ee', key: 'pg' }
        ];

        const slugResults = await Promise.all(
          servicesToFetchSlugs.map(s =>
            fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_slugs_by_serviceId/${s.id}`)
              .then(res => res.json())
              .then(data => data.success && data.data?.home ? { [s.key]: data.data.home } : null)
              .catch(() => null)
          )
        );

        const newSlugs = { ...serviceSlugs };
        slugResults.forEach(res => {
          if (res) Object.assign(newSlugs, res);
        });
        setServiceSlugs(newSlugs);

        // 2. Fetch Latest Booking Services
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/latest_bookings_services');
        const data = await response.json();

        if (data.success && data.services) {
          // Fetch all services for slug enrichment
          const allRes = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/all-services');
          const allData = await allRes.json();
          const allServices = allData.success && Array.isArray(allData.data) ? allData.data : [];

          const transformedServices = data.services.slice(0, 6).map(service => {
            const matched = allServices.find(as => as._id === service._id || as.serviceName === service.serviceName);
            return {
              id: service._id,
              title: service.serviceName,
              category: service.categoryName,
              slug: service.slug || matched?.slug,
              rating: 4.8,
              bookings: '2.3K',
              image: service.mainImage
                ? `https://api.doorstephub.com/${service.mainImage}`
                : 'https://images.unsplash.com/photo-1594873604892-b599f847e859?w=400',
              status: service.status === 'active' ? 'Save 10% On Services' : 'Unavailable',
            };
          });
          setServices(transformedServices);
        }
      } catch (err) {
        console.error('Error fetching booking services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-scroller for the horizontal container
  const scrollRef = React.useRef(null);
  useEffect(() => {
    if (loading || services.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 3000); // Scroll every 3 seconds
    return () => clearInterval(interval);
  }, [loading, services]);

  const handleServiceClick = (service) => {
    if (service.slug) {
      router.push(`/${service.slug}`);
      return;
    }
    const categoryParam = encodeURIComponent(service.category);
    const subCategoryParam = encodeURIComponent(service.title);

    // Determine base slug dynamically
    let baseSlug = 'appliances';
    const upperCategory = service.category.toUpperCase();
    const upperTitle = service.title.toUpperCase();

    if (upperCategory.includes('APPLIANCE') || upperTitle.includes('APPLIANCE')) baseSlug = serviceSlugs.appliances;
    else if (upperCategory.includes('RELIGIOUS') || upperTitle.includes('RELIGIOUS')) baseSlug = serviceSlugs.religious;
    else if (upperCategory.includes('PG') || upperTitle.includes('PG')) baseSlug = serviceSlugs.pg;
    else if (upperCategory.includes('SPA') || upperTitle.includes('SPA')) baseSlug = serviceSlugs.spa;

    router.push(`/${baseSlug}/detail/${service.id}?category=${categoryParam}&subCategory=${subCategoryParam}`);
  };

  return (
    <section id="booking-services" className="relative py-22  overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/40 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <Calendar className="w-4 h-4 text-[#037166]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Futuristic Service Partners</h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
              Latest Booking Services
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Book your favorite services instantly with our advanced booking platform
          </p>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-8 scrollbar-hide snap-x snap-mandatory"
        >
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[15.8%] snap-start">
                <SkeletonCard />
              </div>
            ))
          ) : (
            services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[15.8%] snap-start flex flex-col"
              >
                <div className="relative flex-1 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#037166]/20 transition-all duration-300 flex flex-col">
                  {/* Status Badge - Top Center */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-[#037166]/90 backdrop-blur-md rounded-b-lg rounded-t-none text-[15px]  text-white shadow-lg border border-t-0 border-[#037166]/20 whitespace-nowrap">

                    <h6 className="text-[10px] font-ubuntu tracking-wide">{service.status}</h6>
                  </div>

                  {/* Image - Fixed height */}
                  <div className="relative h-40 overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{ width: '100%', height: '100%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                    {/* Rating Badge - Bottom Left Flush */}
                    <div className="absolute bottom-0 left-0 z-20">
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border-t border-r border-white/10">
                        <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                        <span className="text-sm font-bold text-white">{service.rating}</span>
                      </div>
                    </div>

                    {/* Book Now Button Badge - Bottom Center */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 px-6 py-1 bg-[#037166] backdrop-blur-md rounded-t-lg rounded-b-none text-white shadow-lg border border-b-0 border-[#037166]/20 whitespace-nowrap cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-[#025951]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceClick(service);
                      }}
                    >
                      <h6 className="text-[12px] font-ubuntu tracking-wider text-white bg-clip-text text-transparent">Book Now</h6>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col">
                    <div className="space-y-1">

                      {/* Category + Rating */}
                      <div className="flex items-center justify-between">

                        {/* Category */}
                        <h6 className="text-[10px] text-[#037166] font-medium  tracking-wider">
                          {service.category}
                        </h6>
                      </div>

                      {/* Title */}
                      <h4
                        className="text-[12px] font-medium bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent leading-tight line-clamp-2"
                        title={service.title}
                      >
                        {service.title}
                      </h4>

                    </div>
                  </div>


                  {/* Hover glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#037166]/0 via-[#037166]/20 to-[#037166]/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
