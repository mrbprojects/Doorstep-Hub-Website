'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Star, Clock, Heart, BookOpen, Flame, User, Scroll, Flower2, Utensils, Home, Bell, Building2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function RecommendedReligious() {
  const [journeys, setJourneys] = useState([]);
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

  // Fetch featured religious services from API
  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/featured_religious_services');
        const data = await response.json();

        if (data.success && data.services) {
          const mappedJourneys = data.services.map((service, index) => {
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
              title: service.serviceName,
              providerName: `${service.firstName} ${service.lastName}`,
              description: service.bio,
              rating: 5.0,
              image: service.image ? `https://api.doorstephub.com/${service.image}` : '/placeholder-religious.jpg',
              address: service.address || service.cityName,
              amenities: displayedAmenities
            };
          });
          setJourneys(mappedJourneys.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching featured religious services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
    const interval = setInterval(fetchFeaturedServices, 60000); // 1 minute refresh
    return () => clearInterval(interval);
  }, []);

  // Auto-scroller for the horizontal container
  const scrollRef = React.useRef(null);
  useEffect(() => {
    if (loading || journeys.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth / 2, behavior: 'smooth' });
        }
      }
    }, 3000); // Scroll every 3 seconds
    return () => clearInterval(interval);
  }, [loading, journeys]);

  // Skeleton Shimmer Component
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f1a] border-2 border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Skeleton Image */}
      <div className="relative h-64 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer rounded-t-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

        {/* Skeleton Rating Badge */}
        <div className="absolute top-6 right-6 px-4 py-2 bg-[#037166]/40 backdrop-blur-md rounded-full flex items-center space-x-2 animate-shimmer">
          <div className="w-4 h-4 bg-white/50 rounded-full" />
          <div className="h-4 w-10 bg-white/30 rounded" />
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="p-6">
        {/* Title & Description */}
        <div className="mb-4">
          <div className="h-8 w-4/5 mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />
          <div className="h-4 w-full mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-full mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-3/4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        </div>

        {/* Participants & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 animate-shimmer">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 rounded-full border-2 border-[#1a1a1a]" />
              ))}
            </div>
            <div className="h-4 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0d12] to-[#0a0a0a]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#9b59b6]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6 mx-auto w-64 h-10 animate-shimmer" />
            <div className="h-12 w-80 mx-auto mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl animate-shimmer" />
            <div className="h-5 w-64 mx-auto bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-[#1a1a1a]/60 via-[#1a1a1a]/80 to-[#1a1a1a]/60 backdrop-blur-xl border border-[#037166]/20 rounded-3xl text-center animate-shimmer h-32" />
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
    <section className="relative py-22  overflow-hidden">
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
          <div className="inline-flex items-center space-x-2 px-4 py-2 mt-10 bg-gradient-to-r from-[#037166]/10 via-[#9b59b6]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <Compass className="w-4 h-4 text-[#9b59b6]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166] bg-clip-text text-transparent font-medium">
              Guided Spiritual Journey
            </h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166] bg-clip-text text-transparent">
              Recommended Pandit's
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Embark on transformative spiritual experiences curated for seekers of all paths
          </p>
        </motion.div>

        {/* Journey Cards - Horizontal Scroller */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 pb-12 scrollbar-hide snap-x snap-mandatory"
        >
          {journeys.map((journey, index) => (
            <motion.div
              key={journey.id || index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.7 }}
              className="flex-shrink-0 w-[85%] sm:w-[45%] lg:w-[24%] snap-start group"
            >
              {/* Journey Card */}
              <div className="relative h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f1a] border-2 border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={journey.image}
                    alt={journey.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

                  {/* Begin Journey Button Badge - Bottom Center */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      onClick={() => (window.location.href = `/religious-services?serviceId=${journey.id}`)}
                      className="px-6 py-1 bg-[#037166] backdrop-blur-md rounded-t-lg rounded-b-none text-white shadow-lg border border-b-0 border-[#037166]/20 whitespace-nowrap cursor-pointer transition-all hover:bg-[#025951]"
                    >
                      <h6 className="text-[12px] font-ubuntu font-bold tracking-wider">Begin Pandit </h6>
                    </div>
                  </div>

                  {/* Rating Badge - Bottom Left Flush */}
                  <div className="absolute bottom-0 left-0 z-20">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border border-white/10">
                      <Star className="w-4 h-4 text-[#04a99d] fill-[#04a99d]" />
                      <h6 className="text-sm font-bold text-white">{journey.rating}</h6>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 h-[200px] flex flex-col justify-between">
                  {/* Title & Description */}
                  <div className="mb-4">
                    <h4 className="text-lg font-bold bg-gradient-to-r from-[#037166] via-[#9b59b6] to-[#037166] bg-clip-text text-transparent line-clamp-1">
                      {journey.title}
                    </h4>
                    <h6 className="text-[#9b59b6] text-xs font-medium mb-2 uppercase tracking-wider">{journey.providerName}</h6>
                    {/* <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">{journey.description}</p> */}

                    {/* Amenities Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {journey.amenities.slice(0, 4).map((amenity, idx) => {
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

                  {/* Participants */}
                  {/* <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 bg-gradient-to-br from-[#037166] to-[#9b59b6] rounded-full border-2 border-[#1a1a1a]"
                          />
                        ))}
                      </div>
                      <span>{journey.participants}+ joined</span>
                    </div>
                  </div> */}
                </div>

                {/* Spiritual Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#037166]/20 via-[#9b59b6]/20 to-[#037166]/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 -z-10" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inspirational Quote */}
        {/* {journeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-[#1a1a1a]/60 via-[#1a1a1a]/80 to-[#1a1a1a]/60 backdrop-blur-xl border border-[#037166]/20 rounded-3xl text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4 opacity-30"
            >
              <Compass className="w-full h-full text-[#9b59b6]" />
            </motion.div>
            <p className="text-xl text-gray-300 italic leading-relaxed mb-2">
              "The journey of a thousand miles begins with a single step"
            </p>
            <p className="text-sm text-[#037166]">- Ancient Wisdom</p>
          </motion.div>
        )} */}
      </div>
    </section>
  );
}
