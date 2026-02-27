'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Church, Calendar, MapPin, Users, Bell, Flame, User, Scroll, Flower2, Utensils, Home, Clock, BookOpen, Building2, Star } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function LatestReligiousServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/latest_religious_services');
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

            return {
              id: service._id,
              name: service.serviceName || `${service.firstName} ${service.lastName}`,
              location: service.cityName || service.address || 'Hyderabad',
              amenities: displayedAmenities,
              attendees: Math.floor(Math.random() * 50) + 80,
              image: service.image ? `https://api.doorstephub.com/${service.image}` : 'https://images.unsplash.com/photo-1712999533944-9200e6b20e27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBzcGlyaXR1YWwlMjByZWxpZ2lvdXN8ZW58MXx8fHwxNzY4MDI2NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
              bio: service.bio
            };
          });
          setServices(mappedServices.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching religious services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestServices();
  }, []);

  // Auto-scroller logic
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
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, services]);

  // Skeleton Shimmer Component
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-full bg-gradient-to-br from-[#1a1a1a]/70 to-[#1a0f1a]/70 backdrop-blur-xl border border-[#037166]/20 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Skeleton Type Badge */}
      <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-gradient-to-r from-[#9b59b6]/40 via-[#037166]/40 to-[#9b59b6]/40 backdrop-blur-md rounded-full animate-shimmer">
        <div className="h-4 w-20 bg-gradient-to-r from-white/30 via-white/50 to-white/30 rounded-full" />
      </div>

      {/* Skeleton Bell Icon */}
      <div className="absolute top-6 right-6 z-20 w-12 h-12 bg-[#037166]/20 backdrop-blur-md border border-[#037166]/30 rounded-full animate-shimmer" />

      {/* Skeleton Image */}
      <div className="relative h-64 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
      </div>

      {/* Skeleton Content */}
      <div className="p-6">
        <div className="h-6 w-48 mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />

        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full animate-shimmer" />
              <div className="h-4 w-32 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            </div>
          ))}
        </div>

        <div className="h-12 bg-gradient-to-r from-[#037166]/40 via-[#9b59b6]/40 to-[#037166]/40 rounded-xl animate-shimmer" />
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0a10] to-[#0a0a0a]" />
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[#037166]/15 via-[#9b59b6]/10 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#9b59b6]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6 animate-shimmer mx-auto w-48 h-10" />
            <div className="h-12 w-80 mx-auto mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl animate-shimmer" />
            <div className="h-5 w-64 mx-auto bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
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
    <section className="relative py-18 overflow-hidden">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#9b59b6]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <Church className="w-4 h-4 text-[#9b59b6]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166] bg-clip-text text-transparent font-medium">
              Spiritual World
            </h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166] bg-clip-text text-transparent">
              Latest Religious Services
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with your spiritual side through sacred ceremonies and community gatherings
          </p>
        </motion.div>

        {/* Services - Horizontal Scroller */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 pb-12 scrollbar-hide snap-x snap-mandatory px-4 sm:px-0"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id || index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="flex-shrink-0 w-[85%] sm:w-[45%] lg:w-[24%] snap-start group"
            >
              {/* Spiritual Card */}
              <div className="relative h-full bg-gradient-to-br from-[#1a1a1a]/70 to-[#1a0f1a]/70 backdrop-blur-xl border border-[#037166]/20 rounded-3xl overflow-hidden shadow-2xl">
                {/* Type Badge */}
                {/* <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-gradient-to-r from-[#9b59b6]/80 to-[#037166]/80 backdrop-blur-md rounded-full">
                  <h6 className="text-xs font-bold text-white">{service.type}</h6>
                </div> */}

                {/* Bell Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                  className="absolute top-6 right-6 z-20 w-12 h-12 bg-[#037166]/20 backdrop-blur-md border border-[#037166]/30 rounded-full flex items-center justify-center"
                >
                  <Bell className="w-6 h-6 text-[#9b59b6]" />
                </motion.div>

                {/* Image */}
                <div className="relative h-64 overflow-hidden">
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
                      <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                      <span className="text-sm font-bold text-white">{service.rating || '4.8'}</span>
                    </div>
                  </div>

                  {/* Join Service Button Badge - Bottom Center */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/religious-services/service/${service.id}`}>
                      <div
                        className="px-6 py-1 bg-[#037166] backdrop-blur-md rounded-t-lg rounded-b-none text-white shadow-lg border border-b-0 border-[#037166]/20 whitespace-nowrap cursor-pointer transition-all hover:bg-[#025951]"
                      >
                        <h6 className="text-[12px] font-ubuntu font-bold tracking-wider text-white">Join Service</h6>
                      </div>
                    </Link>
                  </div>

                  {/* Subtle Glow Animation */}
                  <motion.div
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#9b59b6]/30 rounded-full blur-2xl"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-lg font-bold mb-3
      bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166]
      bg-clip-text text-transparent">
                    {service.name}
                  </h4>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="w-4 h-4 text-[#037166]" />
                      <span className="text-gray-300 font-normal line-clamp-1">{service.location}</span>
                    </div>
                  </div>

                  {/* Amenities Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    {service.amenities.slice(0, 4).map((amenity, idx) => {
                      const Icon = amenityIcons[amenity] || Flame;
                      return (
                        <div key={idx} className="flex items-center space-x-2 p-2 bg-[#1a1a1a]/50 rounded-lg border border-[#037166]/10">
                          <Icon className="w-3 h-3 text-[#9b59b6]" />
                          <span className="text-[10px] text-gray-300 line-clamp-1">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>


                </div>

                {/* Divine Glow Effect */}
                <motion.div
                  animate={{
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-1 bg-gradient-to-r from-[#037166]/20 via-[#9b59b6]/20 to-[#037166]/20 blur-xl -z-10"
                />
              </div>
            </motion.div>
          ))}
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
