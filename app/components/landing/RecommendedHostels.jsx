'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart, Users, Star, Check, Home, Wifi, Shield, Building2, Bed, Coffee, Flame, Scroll, Flower2, Utensils, Bell, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useRouter } from 'next/navigation';

export function RecommendedHostels() {
  const router = useRouter();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1280);

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const handleHostelClick = (hostel) => {
    const detailSegment = hostel.slug || hostel.hostelSlug || hostel.id;
    if (!detailSegment) return;
    router.push(`/pghostels/${detailSegment}`);
  };

  // Fetch latest PG hostels from API
  useEffect(() => {
    const fetchLatestHostels = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_pg_hostels`);
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

            const cleanAmenityText = (text) => {
              if (!text) return '';
              let str = String(text).trim().replace(/\s*\([^)]*\)/g, '');
              const mappings = {
                'Sleeping & Room Facilities': 'Sleeping Facilities',
                'Bunk beds or single beds': 'Bunk Beds',
                'Bunk beds with mattresses': 'Bunk Beds',
                'Mattress + pillows': 'Mattress & Pillows',
                'Bed linens': 'Bed Linens',
                'Fully furnished rooms': 'Fully Furnished',
                'Comfortable beds with mattress': 'Comfortable Beds',
                'Individual wardrobe / locker': 'Individual Locker',
                'Individual wardrobe': 'Individual Wardrobe',
                'Study table and chair': 'Study Table & Chair',
                'Study table & chair': 'Study Table & Chair',
                'Shared charging points': 'Charging Points',
                'Personal reading light & power outlet': 'Reading Light',
                'Lockable storage lockers': 'Lockable Lockers',
                'Shared bathroom facilities': 'Shared Bathroom',
                'Curtains or privacy partitions': 'Privacy Curtains',
              };
              if (mappings[str]) return mappings[str];
              if (str.length > 20) {
                const words = str.split(' ');
                if (words.length > 2) return words.slice(0, 2).join(' ');
              }
              return str;
            };

            const getCityFromHostel = (h) => {
              if (typeof h.cityName === 'string' && h.cityName.trim()) return h.cityName.trim();
              if (typeof h.cityName === 'object' && h.cityName?.cityName) return h.cityName.cityName;
              if (typeof h.city === 'string' && h.city.trim()) return h.city.trim();
              if (typeof h.addressCityName === 'string' && h.addressCityName.trim()) return h.addressCityName.trim();
              if (h.address && typeof h.address === 'string') {
                const parts = h.address.split(',').map(s => s.trim()).filter(Boolean);
                const filtered = parts.filter(p => !/^\d{5,6}$|india|telangana|andhra|karnataka|maharashtra/i.test(p));
                if (filtered.length > 0) return filtered[filtered.length - 1];
              }
              return 'Hyderabad';
            };

            return {
              id: hostel._id,
              slug: hostel.slug || hostel.hostelSlug,
              name: hostel.hostelName || `${hostel.firstName} ${hostel.lastName}`,
              tagline: hostel.bio || "Premium living space for your comfort and safety.",
              location: getCityFromHostel(hostel),
              image: hostel.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${hostel.image}` : 'https://images.unsplash.com/photo-1743116591552-9ff5e8c1ad31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYmVkcm9vbSUyMGhvc3RlbHxlbnwxfHx8fDE3NjgwMjY3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
              amenities: displayedAmenities.slice(0, 4).map(cleanAmenityText),
              price: hostel.startingAt || hostel.serviceBookingCost || 0,
            };
          });
          setHostels(mappedHostels);
        }
      } catch (err) {
        console.error('Error fetching latest hostels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestHostels();
  }, []);

  const scrollRef = React.useRef(null);
  const shouldDesktopScroll = isDesktop && hostels.length > 6;
  const scrollCards = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.querySelector('[data-recommended-hostel-card="true"]');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 240;
    const amount = cardWidth + 16;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Skeleton Shimmer Component
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex w-[240px] shrink-0 flex-col overflow-hidden rounded-3xl border-2 border-[#037166]/30 bg-gradient-to-br from-[#1a1a1a] to-[#1a1410] shadow-2xl xl:w-auto"
    >
      {/* Skeleton Image */}
      <div className="relative h-36 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer rounded-t-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
      </div>

      {/* Skeleton Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Title */}
        <div className="mb-2">
          <div className="h-6 w-3/4 mb-1 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />
        </div>

        {/* Amenities */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2 rounded-lg bg-[#1a1a1a]/50 p-2">
              <div className="w-3.5 h-3.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
              <div className="h-3 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0a0a] to-[#0a0a0a]" />
          <motion.div initial={false}
            animate={{
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#037166]/20 via-[#ff6b35]/10 to-transparent rounded-full blur-3xl pointer-events-none"
          />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 to-[#ff6b35]/10 border border-[#037166]/30 rounded-full mb-6 animate-shimmer">
              <div className="w-4 h-4 bg-gradient-to-r from-[#ff6b35]/60 via-[#ff6b35]/80 to-[#ff6b35]/60 rounded-full" />
              <div className="h-4 w-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded" />
            </div>
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Static Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/8 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#ff6b35]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <Heart className="w-4 h-4 text-[#ff6b35]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent font-medium">
              Warm Comfort World
            </h6>
          </div> */}

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent">
              Recommended Hostels
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Trusted accommodations with a focus on safety, comfort, and community
          </p>
        </motion.div>

        <div className="mb-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollCards('left')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollCards('right')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#037166]/40 bg-[#037166]/10 text-[#037166] transition hover:bg-[#037166] hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Hostels - Horizontal Scroller */}
        <div
          ref={scrollRef}
          className={`overflow-x-auto scrollbar-hide pb-12 -mx-4 px-4 xl:mx-0 ${shouldDesktopScroll ? 'xl:px-0' : 'xl:px-0 xl:overflow-visible'}`}
        >
          <div className={`flex min-w-max gap-4 snap-x snap-mandatory ${shouldDesktopScroll ? '' : 'xl:min-w-0 xl:grid xl:grid-cols-6 xl:snap-none'}`}>
          {loading ? (
            // Skeleton Loading State
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-[240px] shrink-0 snap-start xl:w-auto">
                <SkeletonCard />
              </div>
            ))
          ) : (
            hostels.map((hostel, index) => (
              <motion.div
                key={hostel.id || index}
                data-recommended-hostel-card="true"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`group w-[240px] shrink-0 snap-start cursor-pointer ${shouldDesktopScroll ? '' : 'xl:w-auto'}`}
                onClick={() => handleHostelClick(hostel)}
              >
                {/* Premium PG-style Card */}
                <motion.div
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Type Badge — same as Premium PG */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-8 py-1 bg-[#037166]/90 backdrop-blur-md rounded-full rounded-t-none border border-t-0 border-[#037166]/30 shadow-lg whitespace-nowrap">
                    <span className="text-xs font-intro !text-white tracking-wider block">
                      Hostel
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative h-36 overflow-hidden">
                    <motion.div transition={{ duration: 0.6 }}>
                      <ImageWithFallback
                        src={hostel.image}
                        alt={hostel.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                      />
                    </motion.div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />

                    {/* Schedule Visit Hover Badge */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="px-6 py-1 bg-[#297A70] backdrop-blur-md rounded-t-lg text-white shadow-lg border border-b-0 border-gray-600/20 whitespace-nowrap">
                        <span className="text-[12px] font-ubuntu font-bold tracking-wider !text-white block">Schedule Your Space</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="mb-2 h-12 line-clamp-2 bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-base font-bold text-transparent">
                      {hostel.name}
                    </h4>

                    {/* Location row */}
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Location</span>
                        <span className="text-white font-intro text-right flex-1 ml-4">
                          {hostel.location || 'Hyderabad'}
                        </span>
                      </div>
                    </div>

                    {/* Price + Book Now row */}
                    <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-[#037166]/20 p-2 opacity-80">
                      <div>
                        <h6 className="text-[10px] text-gray-400 mb-0.5 font-intro">Starting from</h6>
                        <div className="text-xs font-bold text-[#037166] font-intro">
                          {hostel.price ? `₹${hostel.price}/month` : 'Contact Us'}
                        </div>
                      </div>
                      <div>
                        <motion.button
                          className="cursor-pointer whitespace-nowrap rounded-full bg-[#297A70] px-2 py-1.5 text-[10px] font-semibold shadow-lg"
                        >
                          <span className="!text-white">Book Now</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {hostel.amenities.slice(0, 4).map((amenity, idx) => {
                        const Icon = amenityIcons[amenity] || Building2;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-center space-x-2 rounded-lg bg-[#1a1a1a]/50 p-2"
                          >
                            <Icon className="h-3.5 w-3.5 text-[#037166] shrink-0" />
                            <span className="text-[11px] text-gray-300 leading-tight break-words">{amenity}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#037166]/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                </motion.div>
              </motion.div>
            ))
          )}
          </div>
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
      <style jsx>{`
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




