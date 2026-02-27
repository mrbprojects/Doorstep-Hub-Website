'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart, Users, Star, Check, Home, Wifi, Shield, Building2, Bed, Coffee, Flame, Scroll, Flower2, Utensils, Bell, Clock, BookOpen } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function RecommendedHostels() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch latest PG hostels from API
  useEffect(() => {
    const fetchLatestHostels = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/latest_pg_hostels');
        const data = await response.json();

        if (data.success && data.hostels) {
          const mappedHostels = data.hostels.map((hostel, index) => {
            let displayedAmenities = [];
            if (hostel.amenities && hostel.amenities.length > 0 && hostel.amenities[0].title !== 'test') {
              displayedAmenities = hostel.amenities.map(a => a.title);
            } else {
              displayedAmenities = (hostel.otherAmenities || "")
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(item => item.length > 0 && !item.toLowerCase().includes("amenities"));
            }

            if (displayedAmenities.length === 0) {
              displayedAmenities = ['Verified Property', '24/7 Security', 'High-Speed WiFi', 'Modern Amenities'];
            }

            return {
              id: hostel._id,
              name: hostel.hostelName || `${hostel.firstName} ${hostel.lastName}`,
              tagline: hostel.bio || "Premium living space for your comfort and safety.",
              image: hostel.image ? `https://api.doorstephub.com/${hostel.image}` : 'https://images.unsplash.com/photo-1743116591552-9ff5e8c1ad31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYmVkcm9vbSUyMGhvc3RlbHxlbnwxfHx8fDE3NjgwMjY3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
              amenities: displayedAmenities.slice(0, 3),
              price: hostel.startingAt || hostel.serviceBookingCost || 0,
            };
          });
          setHostels(mappedHostels.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching latest hostels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestHostels();
  }, []);

  // Auto-scroller logic
  const scrollRef = React.useRef(null);
  useEffect(() => {
    if (loading || hostels.length === 0) return;
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
  }, [loading, hostels]);

  // Skeleton Shimmer Component
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-full flex flex-col bg-gradient-to-br from-[#1a1a1a] to-[#1a1410] border-2 border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Skeleton Trust Badge */}
      <div className="absolute top-6 right-6 z-20">
        <div className="relative w-20 h-20">
          <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full animate-shimmer" />
        </div>
      </div>

      {/* Skeleton Image */}
      <div className="relative h-40 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer rounded-t-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
        <div className="absolute top-6 left-6 w-12 h-12 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#037166]/30 rounded-full animate-shimmer" />
      </div>

      {/* Skeleton Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="h-8 w-64 mb-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />
          <div className="h-5 w-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full animate-shimmer" />
            <div className="h-6 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full animate-shimmer" />
            <div className="h-5 w-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-[#037166]/30 via-[#037166]/50 to-[#037166]/30 rounded-full animate-shimmer" />
              <div className="h-4 w-40 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-auto h-10 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl animate-shimmer" />
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0a0a] to-[#0a0a0a]" />
          <motion.div
            animate={{
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#037166]/20 via-[#ff6b35]/10 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 to-[#ff6b35]/10 border border-[#037166]/30 rounded-full mb-6 animate-shimmer">
              <div className="w-4 h-4 bg-gradient-to-r from-[#ff6b35]/60 via-[#ff6b35]/80 to-[#ff6b35]/60 rounded-full" />
              <div className="h-4 w-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded" />
            </div>
            <div className="h-12 w-80 mx-auto mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl animate-shimmer" />
            <div className="h-5 w-64 mx-auto bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

  const amenityIcons = {
    'High-Speed WiFi': Wifi,
    'Wi-Fi': Wifi,
    'Wi-Fi access': Wifi,
    'High-speed Wi-Fi': Wifi,
    '24/7 Security': Shield,
    'CCTV': Shield,
    'Security': Shield,
    'Housekeeping': Building2,
    'Gym Access': Users,
    'Cafeteria': Coffee,
    'Mess': Coffee,
    'Food Included': Coffee,
    'Study Rooms': Building2,
    'Study Area': Building2,
    'Laundry': Building2,
    'Power Backup': Building2,
    'Fully Furnished': Bed,
    'Fully furnished rooms': Bed,
    'Bed with mattress': Bed,
    'Individual wardrobe / locker': Building2,
    'Study table & chair': Building2,
    'Ceiling fan / AC': Building2,
    'Mirror & dustbin': Building2,
    'AC Rooms': Building2,
    'Recreation': Users,
    'Bunk beds with mattresses': Bed,
    'Individual lockers': Shield,
    'Shared charging points': Building2,
    'Ceiling fans': Building2,
    'Shared bathroom facilities': Building2,
    'Bunk beds or single beds': Bed,
    'Mattress + pillows': Bed,
    'Bed linens': Bed,
    'Lockable storage lockers': Shield,
    'Personal reading light & power outlet': Building2,
    'Curtains or privacy partitions': Building2,
    'Single bed with mattress': Bed,
    'Personal wardrobe / locker': Building2,
    'Study table and chair': Building2,
    'Attached bathroom': Building2,
    'Charging points': Building2,
    'Separate beds or bunk beds': Bed,
    'Individual storage space': Building2,
    'Common study table': Building2,
    'Ceiling fan': Building2,
    'Wi-Fi connectivity': Wifi,
    'Adequate lighting & ventilation': Building2,
    'Shared bathroom': Building2,
  };

  return (
    <section className="relative py-20 overflow-hidden">
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
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#ff6b35]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <Heart className="w-4 h-4 text-[#ff6b35]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent font-medium">
              Warm Comfort World
            </h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent">
              Recommended Hostels
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Trusted accommodations with a focus on safety, comfort, and community
          </p>
        </motion.div>

        {/* Hostels - Horizontal Scroller */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 pb-12 scrollbar-hide snap-x snap-mandatory px-4 sm:px-0"
        >
          {loading ? (
            // Skeleton Loading State
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-[85%] sm:w-[45%] lg:w-[24%] snap-start">
                <SkeletonCard />
              </div>
            ))
          ) : (
            hostels.map((hostel, index) => (
              <motion.div
                key={hostel.id || index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="flex-shrink-0 w-[85%] sm:w-[45%] lg:w-[24%] snap-start group"
              >
                {/* Trust-Focused Card */}
                <div className="relative h-full flex flex-col bg-gradient-to-br from-[#1a1a1a] to-[#1a1410] border-2 border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl">

                  {/* Trust Score Circle - Static, commented out as requested */}
                  {/* <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="absolute top-6 right-6 z-20 w-20 h-20"
                >
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#1a1a1a"
                      strokeWidth="6"
                      fill="none"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#037166"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={220}
                      initial={{ strokeDashoffset: 220 }}
                      whileInView={{ strokeDashoffset: 220 - (220 * (hostel.trustScore || 0)) / 100 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: index * 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-white">{hostel.trustScore}</div>
                    <h6 className="text-xs text-[#037166]">Trust</h6>
                  </div>
                </motion.div> */}

                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <ImageWithFallback
                      src={hostel.image}
                      alt={hostel.name}
                      className="w-full h-full  object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />

                    {/* Schedule Visit Button Badge - Bottom Center */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link href={`/pghostels/hostel-detail/${hostel.id}`}>
                        <div
                          className="px-6 py-1 bg-[#037166] backdrop-blur-md rounded-t-lg rounded-b-none text-white shadow-lg border border-b-0 border-[#037166]/20 whitespace-nowrap cursor-pointer transition-all hover:bg-[#025951]"
                        >
                          <h6 className="text-[12px] font-ubuntu font-bold tracking-wider">Schedule Your Space</h6>
                        </div>
                      </Link>
                    </div>

                    {/* Price Badge - Dynamic */}


                    {/* Heart Icon */}
                    {/* <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-6 left-6 w-12 h-12 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#037166]/30 rounded-full flex items-center justify-center group/heart"
                  >
                    <Heart className="w-6 h-6 text-[#ff6b35] group-hover/heart:fill-[#ff6b35] transition-all" />
                  </motion.button> */}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-2">
                      <h4 className="text-xl font-bold bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent mb-1 line-clamp-1">
                        {hostel.name}
                      </h4>
                      {/* <p className="text-gray-400 italic text-sm line-clamp-2">{hostel.tagline}</p> */}
                    </div>

                    {/* Stats - Static, commented out as requested */}
                    {/* <div className="flex items-center space-x-6 mb-6">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-[#037166] fill-[#037166]" />
                      <span className="text-lg font-semibold text-white">{hostel.rating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-[#037166]" />
                      <span className="text-sm text-gray-400">{hostel.residents} residents</span>
                    </div>
                  </div> */}

                    {/* Amenities */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {hostel.amenities.slice(0, 4).map((amenity, idx) => {
                        const Icon = amenityIcons[amenity] || Building2;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-center space-x-2 p-2 bg-[#1a1a1a]/50 rounded-lg"
                          >
                            <Icon className="w-4 h-4 text-[#037166]" />
                            <span className="text-xs text-gray-300 line-clamp-1">{amenity}</span>
                          </motion.div>
                        );
                      })}
                    </div>


                  </div>

                  {/* Warm Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#037166]/20 via-[#ff6b35]/10 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Trust Indicators */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Check, label: 'Verified Properties', value: '100%' },
            { icon: Heart, label: 'Satisfaction Rate', value: '4.8/5' },
            { icon: Users, label: 'Happy Residents', value: '2.5K+' },
            { icon: Home, label: 'Safe Locations', value: '50+' },
          ].map((indicator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-gradient-to-br from-[#1a1a1a]/60 to-[#1a1410]/60 backdrop-blur-sm border border-[#037166]/20 rounded-2xl text-center"
            >
              <indicator.icon className="w-8 h-8 text-[#037166] mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{indicator.value}</div>
              <h6 className="text-xs text-gray-400 uppercase tracking-wider">{indicator.label}</h6>
            </motion.div>
          ))}
        </motion.div> */}

        {hostels.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hostels available at the moment</p>
          </div>
        )}
      </div>
    </section>
  );
}
