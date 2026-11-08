'use client';

import React, { useState, useEffect } from 'react';

import { motion } from 'motion/react';
import { Building2, Wifi, Coffee, Shield, Bed, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useRouter } from 'next/navigation';

const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="relative w-[240px] shrink-0 overflow-hidden rounded-3xl border border-[#037166]/30 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] shadow-2xl xl:w-auto"
  >
    {/* Skeleton Image */}
    <div className="relative h-36 overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer rounded-t-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
    </div>

    {/* Skeleton Content */}
    <div className="p-4">
      {/* Title */}
      <div className="h-12 w-3/4 mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />

      {/* Location */}
      <div className="flex justify-between mb-3 text-xs">
        <div className="h-4 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        <div className="h-4 w-24 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
      </div>

      {/* Price & Button Block */}
      <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-[#037166]/20 p-2 bg-[#037166]/5">
        <div className="w-24">
          <div className="h-3 w-16 mb-1 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        </div>
        <div className="h-7 w-16 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full animate-shimmer" />
      </div>

      {/* Amenities */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-2 p-2 bg-[#1a1a1a]/50 rounded-lg">
            <div className="w-3.5 h-3.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            <div className="h-3 w-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const dummyHostels = [
  {
    id: 'dummy-1',
    name: 'Sunrise Premium PG',
    type: 'Premium PG',
    location: 'Gachibowli, Hyderabad',
    price: '₹12,000/month',
    occupancy: 'Single/Double',
    image: 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njc5NTMwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Fully Furnished', '24/7 Security', 'High-Speed WiFi', 'Power Backup'],
    isDummy: true
  },
  {
    id: 'dummy-2',
    name: 'Elite Stays Hostel',
    type: 'Luxury Hostel',
    location: 'Hitech City, Hyderabad',
    price: '₹15,000/month',
    occupancy: 'Single',
    image: 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njc5NTMwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['AC Rooms', 'Food Included', 'Laundry', 'Gym Access'],
    isDummy: true
  },
  {
    id: 'dummy-3',
    name: 'Comfort Zone PG',
    type: 'Executive PG',
    location: 'Madhapur, Hyderabad',
    price: '₹10,000/month',
    occupancy: 'Double/Triple',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwgc3R1ZGVudCUyMHJvb218ZW58MXx8fHwxNzY4MDI2NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Housekeeping', 'Recreation', 'Study Rooms', 'Cafeteria'],
    isDummy: true
  },
  {
    id: 'dummy-4',
    name: 'Urban Nest Hostel',
    type: 'Student Living',
    location: 'Kukatpally, Hyderabad',
    price: '₹9,500/month',
    occupancy: 'Double/Triple',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwgc3R1ZGVudCUyMHJvb218ZW58MXx8fHwxNzY4MDI2NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wi-Fi', 'Study Area', 'Mess', 'CCTV'],
    isDummy: true
  }
];

export function PremiumPGHostels() {
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
    if (hostel.isDummy) return;
    const detailSegment = hostel.slug || hostel.hostelSlug || hostel.id;
    if (!detailSegment) return;
    router.push(`/pghostels/${detailSegment}`);
  };

  // Fetch featured PG hostels from API
  useEffect(() => {
    const fetchFeaturedPGHostels = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/featured_pg_hostels`);
        const data = await response.json();

        if (data.success && data.hostels && data.hostels.length > 0) {
          const mappedHostels = data.hostels.map((hostel) => {
            let displayedAmenities = hostel.amenities && hostel.amenities.length > 0
              ? hostel.amenities.map(a => (typeof a === 'object' && a.title ? a.title : a))
              : (hostel.otherAmenities || "")
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(item => item.length > 0 && !item.toLowerCase().includes("amenities"));

            if (displayedAmenities.length === 0) {
              displayedAmenities = ['Fully Furnished', '24/7 Security', 'High-Speed WiFi', 'Power Backup'];
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
              type: 'Premium PG',
              location: getCityFromHostel(hostel),
              price: `₹${hostel.startingAt}/month`,
              occupancy: 'Single/Double',
              image: hostel.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${hostel.image}` : 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njc5NTMwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
              description: hostel.bio,
              amenities: displayedAmenities.map(cleanAmenityText),
              isDummy: false
            };
          });
          setHostels(mappedHostels);
        } else {
          setHostels(dummyHostels);
        }
      } catch (err) {
        console.error('Error fetching featured PG hostels:', err);
        setHostels(dummyHostels);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPGHostels();
  }, []);

  const scrollRef = React.useRef(null);
  const shouldDesktopScroll = isDesktop && hostels.length > 6;
  const scrollCards = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.querySelector('[data-pg-card="true"]');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 240;
    const amount = cardWidth + 16;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const amenityIcons = {
    'High-Speed WiFi': Wifi,
    'Wi-Fi': Wifi,
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
  };

  return (
    <section className="relative py-8 sm:py-10 lg:py-12 overflow-hidden">
      {/* Architectural World Background */}
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Static Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/20 rounded-full blur-[170px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/15 rounded-full blur-[170px] pointer-events-none" />


        {/* Central Highlight Glow - Warm Warmth */}

      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 sm:mb-6"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            <span className="bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent">
              Premium PG & Hostels
            </span>
          </h2>

          <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-3xl mx-auto mb-3 sm:mb-4 leading-relaxed">
            Discover premium PGs and hostels with comfortable rooms, essential amenities, convenient locations, and flexible stay options. Explore suitable accommodation for students and working professionals and choose the right place with ease.
          </p>

          {/* Explore All Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/pghostels')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#297A70] hover:bg-[#037166] !text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md cursor-pointer group/header-btn transition-all"
            style={{ color: '#ffffff' }}
          >
            <span className="!text-white font-bold" style={{ color: '#ffffff' }}>Explore All PG & Hostels</span>
            <ArrowRight className="w-4 h-4 !text-white transition-transform group-hover/header-btn:translate-x-1" style={{ color: '#ffffff', stroke: '#ffffff' }} />
          </motion.button>
        </motion.div>

        <div className={`mb-3 items-center justify-end gap-2 ${shouldDesktopScroll ? 'flex' : 'hidden'}`}>
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

        {/* PG Cards - Horizontal Scroller */}
        {loading ? (
          <div className="overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 xl:mx-0 xl:px-0">
            <div className="flex min-w-max gap-3 sm:gap-4 xl:min-w-0 xl:grid xl:grid-cols-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className={`overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 xl:mx-0 ${shouldDesktopScroll ? 'xl:px-0' : 'xl:px-0 xl:overflow-visible'}`}
          >
            <div className={`flex min-w-max gap-3 sm:gap-4 ${shouldDesktopScroll ? '' : `xl:min-w-0 xl:grid ${
              hostels.length === 1 ? 'xl:grid-cols-1' :
              hostels.length === 2 ? 'xl:grid-cols-2' :
              hostels.length === 3 ? 'xl:grid-cols-3' :
              hostels.length === 4 ? 'xl:grid-cols-4' :
              hostels.length === 5 ? 'xl:grid-cols-5' :
              'xl:grid-cols-6'
            }`}`}>
            {hostels.map((hostel, index) => (
              <motion.div
                key={hostel.id || index}
                data-pg-card="true"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`group w-[260px] sm:w-[280px] shrink-0 cursor-pointer ${shouldDesktopScroll ? '' : 'xl:w-auto'}`}
                onClick={() => handleHostelClick(hostel)}
              >
                {/* Card with Parallax Effect */}
                <motion.div
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Type Badge */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-8 py-1 bg-[#037166]/90 backdrop-blur-md rounded-full rounded-t-none border border-t-0 border-[#037166]/30 shadow-lg whitespace-nowrap">
                    <span className="text-xs font-intro !text-white tracking-wider block">
                      {hostel.type}
                    </span>
                  </div>


                  {/* Image with Depth */}
                  <div className="relative h-36 overflow-hidden">
                    <motion.div
                      transition={{ duration: 0.6 }}
                    >
                      <ImageWithFallback
                        src={hostel.image}
                        alt={hostel.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>



                    {/* Architectural Grid Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="mb-2 h-12 line-clamp-2 bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-base font-bold text-transparent">
                      {hostel.name}
                    </h4>

                    {/* Description - 2 lines */}
                    {/* <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2 min-h-[2.5em]">
                      {hostel.description || "Experience premium living with the perfect blend of comfort, style, and community. Our state-of-the-art facilities ensure a hassle-free lifestyle."}
                    </p> */}

                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Location</span>
                        <span className="text-white font-intro text-right flex-1 ml-4">{hostel.location}</span>
                      </div>
                    </div>

                    {/* Price - Disabled interaction */}
                    <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-[#037166]/20 p-2 opacity-80">

                      {/* Left: Price */}
                      <div>
                        <h6 className="text-[10px] text-gray-400 mb-0.5 font-intro">
                          Starting from
                        </h6>
                        <div className="text-xs font-bold text-[#037166] font-intro">
                          {hostel.price}
                        </div>
                      </div>

                      {/* Right: Book Now - Disabled */}
                      <div>
                        <motion.button
                          className="cursor-pointer whitespace-nowrap rounded-full bg-[#297A70] px-2 py-1.5 text-[10px] font-semibold shadow-lg"
                        >
                          <span className="!text-white">
                            Book Now
                          </span>
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

                    {/* Action Buttons */}

                  </div>

                  {/* 3D Depth Effect */}
                  {!hostel.isDummy && (
                    <div className="absolute -inset-1 bg-gradient-to-br from-[#037166]/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                  )}
                </motion.div>
              </motion.div>
            ))}
            </div>
          </div>
        )}
      </div>

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





