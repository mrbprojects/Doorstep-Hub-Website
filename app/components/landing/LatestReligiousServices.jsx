'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'motion/react';
import {  MapPin, Bell, Flame, User, Scroll, Flower2, Utensils, Home, Clock, BookOpen, Building2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="relative h-full w-[240px] shrink-0 overflow-hidden rounded-2xl border border-[#037166]/20 bg-gradient-to-br from-[#1a1a1a]/70 to-[#1a0f1a]/70 backdrop-blur-xl shadow-2xl xl:w-auto"
  >
    {/* Skeleton Type Badge */}
    <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-gradient-to-r from-[#9b59b6]/40 via-[#037166]/40 to-[#9b59b6]/40 backdrop-blur-md rounded-full animate-shimmer">
      <div className="h-4 w-20 bg-gradient-to-r from-white/30 via-white/50 to-white/30 rounded-full" />
    </div>

    {/* Skeleton Bell Icon */}
    <div className="absolute top-4 right-4 z-20 h-10 w-10 bg-[#037166]/20 backdrop-blur-md border border-[#037166]/30 rounded-full animate-shimmer" />

    {/* Skeleton Image */}
    <div className="relative h-40 overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
    </div>

    {/* Skeleton Content */}
    <div className="p-4">
      <div className="h-5 w-40 mb-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />

      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3.5 h-3.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full animate-shimmer" />
          <div className="h-3 w-32 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-2 p-2 bg-[#1a1a1a]/50 rounded-lg border border-[#037166]/10">
            <div className="w-3 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full animate-shimmer" />
            <div className="h-2 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export function LatestReligiousServices() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1280);

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const handleServiceClick = (service) => {
    const detailSegment = service.slug || service.serviceSlug || service.id;
    if (!detailSegment) return;
    router.push(`/religious-services/${detailSegment}`);
  };

  const amenityIcons = {
    'Experienced Vedic Pandit': User,
    'Panditji': User,
    'Certified Priest': User,
    'Vedic Rituals': BookOpen,
    'Pooja Samagri': Flower2,
    'Homam Samagri': Flower2,
    'Pooja materials provided': Flower2,
    'Mantra Chanting': Scroll,
    'Vedic Procedures': Scroll,
    'Prasadam Distribution': Utensils,
    'Prasadam provided': Utensils,
    'Havan Setup': Flame,
    'Havan kundam setup': Flame,
    'Pure Ghee & Herbs': Flame,
    'Home Pooja': Home,
    'Office Pooja': Building2,
    'On-Time Service': Clock,
    'Ganapathi Pooja': Bell,
  };

  // Fetch latest religious services from API
  useEffect(() => {
    const fetchLatestServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_religious_services`);
        const data = await response.json();

        if (data.success && data.services) {
          const mappedServices = data.services.map((service) => {
            let displayedAmenities = [];
            if (service.amenities && service.amenities.length > 0) {
              displayedAmenities = service.amenities.map(a => a.title);
            } else {
              displayedAmenities = (service.otherAmenities || "")
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(item => item.length > 0 && !item.toLowerCase().includes("amenities"));
            }

            if (displayedAmenities.length === 0) {
              displayedAmenities = ['Vedic Rituals', 'Pooja Samagri', 'Mantra Chanting', 'Prasadam Distribution'];
            }

            const cleanAmenityText = (text) => {
              if (!text) return '';
              let str = String(text).trim().replace(/\s*\([^)]*\)/g, '');
              const mappings = {
                'Experienced Vedic Pandit': 'Vedic Pandit',
                'Certified Priest': 'Vedic Priest',
                'Pooja materials provided': 'Pooja Samagri',
                'Prasadam Distribution': 'Prasadam',
                'Prasadam provided': 'Prasadam',
                'Havan kundam setup': 'Havan Setup',
                'Pure Ghee & Herbs': 'Ghee & Herbs',
                'Vedic Procedures': 'Vedic Rituals',
              };
              if (mappings[str]) return mappings[str];
              if (str.length > 20) {
                const words = str.split(' ');
                if (words.length > 2) return words.slice(0, 2).join(' ');
              }
              return str;
            };

            const getCityFromService = (s) => {
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

            return {
              id: service._id,
              slug: service.slug || service.serviceSlug,
              name: service.serviceName || `${service.firstName} ${service.lastName}`,
              location: getCityFromService(service),
              amenities: displayedAmenities.slice(0, 4).map(cleanAmenityText),
              attendees: 90,
              image: service.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}` : 'https://images.unsplash.com/photo-1712999533944-9200e6b20e27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBzcGlyaXR1YWwlMjByZWxpZ2lvdXN8ZW58MXx8fHwxNzY4MDI2NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
              bio: service.bio
            };
          });
          setServices(mappedServices);
        }
      } catch (err) {
        console.error('Error fetching religious services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestServices();
  }, []);

  const scrollRef = React.useRef(null);
  const shouldDesktopScroll = isDesktop && services.length > 6;
  const scrollCards = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.querySelector('[data-latest-religious-card="true"]');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 240;
    const amount = cardWidth + 16;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0a10] to-[#0a0a0a]" />
          <motion.div
            initial={false}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[#037166]/15 via-[#9b59b6]/10 to-transparent rounded-full blur-3xl pointer-events-none"
          />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#9b59b6]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6 animate-shimmer mx-auto w-48 h-10" />
            <div className="h-12 w-80 mx-auto mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl animate-shimmer" />
            <div className="h-5 w-64 mx-auto bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>

          <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 xl:mx-0 xl:px-0">
            <div className="flex min-w-max gap-4 xl:min-w-0 xl:grid xl:grid-cols-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="relative py-8 sm:py-10 lg:py-12 overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Static Gradient Orbs */}
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
          {/* <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#9b59b6]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <Church className="w-4 h-4 text-[#9b59b6]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166] bg-clip-text text-transparent font-medium">
              Spiritual World
            </h6>
          </div> */}

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166] bg-clip-text text-transparent">
              Latest Religious Services
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-4xl mx-auto">
           Explore the latest religious services for pujas, homams, rituals, temple ceremonies, housewarming, weddings, festivals, and other spiritual occasions. Find suitable priests and service options based on your tradition, location, and ceremony needs.
          </p>
        </motion.div>
        <div className={`mb-3 items-center justify-end gap-2 ${shouldDesktopScroll ? 'flex' : 'hidden'}`}>
          <button type="button" onClick={() => scrollCards('left')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white" aria-label="Scroll left">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollCards('right')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white" aria-label="Scroll right">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Services - Horizontal Scroller */}
        <div
          ref={scrollRef}
          className={`overflow-x-auto pb-2 -mx-4 px-4 xl:mx-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${shouldDesktopScroll ? 'xl:px-0' : 'xl:px-0 xl:overflow-visible'}`}
        >
          <div className={`flex min-w-max gap-3 sm:gap-4 snap-x snap-mandatory ${shouldDesktopScroll ? '' : `xl:min-w-0 xl:grid ${
            services.length === 1 ? 'xl:grid-cols-1' :
            services.length === 2 ? 'xl:grid-cols-2' :
            services.length === 3 ? 'xl:grid-cols-3' :
            services.length === 4 ? 'xl:grid-cols-4' :
            services.length === 5 ? 'xl:grid-cols-5' :
            'xl:grid-cols-6'
          } xl:snap-none`}`}>
          {services.map((service, index) => (
            <motion.div
              key={service.id || index}
              data-latest-religious-card="true"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={`group w-[260px] sm:w-[280px] shrink-0 snap-start cursor-pointer ${shouldDesktopScroll ? '' : 'xl:w-auto'}`}
              onClick={() => handleServiceClick(service)}
            >
              {/* Spiritual Card */}
              <div className="relative h-full bg-gradient-to-br from-[#1a1a1a]/70 to-[#1a0f1a]/70 backdrop-blur-xl border border-[#037166]/20 rounded-2xl overflow-hidden shadow-2xl">
                {/* Type Badge */}
                {/* <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-gradient-to-r from-[#9b59b6]/80 to-[#037166]/80 backdrop-blur-md rounded-full">
                  <h6 className="text-xs font-bold text-white">{service.type}</h6>
                </div> */}

                {/* Bell Icon */}
                <motion.div initial={false}
                  whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                  className="absolute top-4 right-4 z-20 h-10 w-10 bg-[#037166]/20 backdrop-blur-md border border-[#037166]/30 rounded-full flex items-center justify-center pointer-events-none"
                >
                  <Bell className="w-5 h-5 text-[#9b59b6]" />
                </motion.div>

                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <ImageWithFallback
                      src={service.image}
                      alt={service.name}
                      className=" bg-gradient-to-r from-white via-[#9b59b6] to-white bg-clip-text text-transparent w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Divine Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

                  {/* Rating Badge - Bottom Left Flush */}
                  <div className="absolute bottom-0 left-0 z-20">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border-t border-r border-white/10">
                      <Star className="w-4 h-4 fill-white text-white" />
                      <span className="text-sm font-bold !text-white">{service.rating || '4.8'}</span>
                    </div>
                  </div>



                  {/* Subtle Glow Animation */}
                  <motion.div initial={false}
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#9b59b6]/30 rounded-full blur-2xl pointer-events-none"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="text-lg font-bold mb-3
      bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166]
      bg-clip-text text-transparent">
                    {service.name}
                  </h4>

                  {/* Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#037166]" />
                      <span className="text-gray-300 font-normal line-clamp-1">{service.location}</span>
                    </div>
                  </div>

                  {/* Amenities Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {service.amenities.slice(0, 4).map((amenity, idx) => {
                      const Icon = amenityIcons[amenity] || Flame;
                      return (
                        <div key={idx} className="flex items-center space-x-2 p-2 bg-[#1a1a1a]/50 rounded-lg border border-[#037166]/10">
                          <Icon className="w-3 h-3 text-[#9b59b6] shrink-0" />
                          <span className="text-[10px] text-gray-300 leading-tight break-words">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>


                </div>

                {/* Divine Glow Effect */}
                <motion.div initial={false}
                  animate={{
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-1 bg-gradient-to-r from-[#037166]/20 via-[#9b59b6]/20 to-[#037166]/20 blur-xl -z-10 pointer-events-none"
                />
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Peaceful Message */}
        {/* {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-gray-400 italic text-lg"
            >
              "Find peace in every moment, strength in every prayer"
            </motion.p>
          </motion.div>
        )} */}
      </div>
    </section>
  );
}




