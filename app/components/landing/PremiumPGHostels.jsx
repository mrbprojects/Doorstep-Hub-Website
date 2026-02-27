'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Building2, Wifi, Coffee, Shield, Bed, Users, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useRouter } from 'next/navigation';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch featured PG hostels from API
  useEffect(() => {
    const fetchFeaturedPGHostels = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/featured_pg_hostels');
        const data = await response.json();

        if (data.success && data.hostels && data.hostels.length > 0) {
          const mappedHostels = data.hostels.map((hostel, index) => {
            let displayedAmenities = hostel.amenities && hostel.amenities.length > 0
              ? hostel.amenities.map(a => (typeof a === 'object' && a.title ? a.title : a))
              : (hostel.otherAmenities || "")
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(item => item.length > 0 && !item.toLowerCase().includes("amenities"));

            if (displayedAmenities.length === 0) {
              displayedAmenities = ['Fully Furnished', '24/7 Security', 'High-Speed WiFi', 'Power Backup'];
            }

            return {
              id: hostel._id,
              name: hostel.hostelName || `${hostel.firstName} ${hostel.lastName}`,
              type: 'Premium PG',
              location: hostel.cityName || 'Hyderabad Area',
              price: `₹${hostel.startingAt}/month`,
              occupancy: 'Single/Double',
              image: hostel.image ? `https://api.doorstephub.com/${hostel.image}` : 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njc5NTMwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
              description: hostel.bio,
              amenities: displayedAmenities,
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
      className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl h-full"
    >
      {/* Skeleton Badge */}
      <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#037166]/50 rounded-full shimmer">
        <div className="h-4 w-16 bg-gradient-to-r from-[#037166]/40 via-[#037166]/60 to-[#037166]/40 rounded-full animate-shimmer" />
      </div>

      {/* Skeleton Image */}
      <div className="relative h-64 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer rounded-t-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      {/* Skeleton Content */}
      <div className="p-6">
        {/* Title */}
        <div className="h-8 w-3/4 mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />

        {/* Description Placeholder - 5 lines */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-2/3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
        </div>

        {/* Location & Occupancy */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            <div className="h-4 w-24 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            <div className="h-4 w-24 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          </div>
        </div>

        {/* Price */}
        <div className="mb-6 p-4 bg-[#037166]/10 border border-[#037166]/20 rounded-xl">
          <div className="h-4 w-24 mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
          <div className="h-10 w-28 bg-gradient-to-r from-[#037166]/40 via-[#037166]/60 to-[#037166]/40 rounded-lg animate-shimmer" />
        </div>

        {/* Amenities */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2 p-1 bg-[#1a1a1a]/50 rounded-lg">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
              <div className="h-4 w-20 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-11 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    </motion.div>
  );

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
    <section className="relative py-22 overflow-hidden">
      {/* Architectural World Background */}
      {/* Animated Background */}
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


        {/* Central Highlight Glow - Warm Warmth */}

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
            <Building2 className="w-4 h-4 text-[#037166]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent font-medium">Modern Architectural World</h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent">
              Premium PG & Hostels
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            Discover your perfect home away from home with modern amenities and comfort
          </p>

          {/* Explore All Button */}
          <motion.button
            onClick={() => router.push('/pghostels')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-xl font-semibold shadow-lg shadow-[#037166]/30 hover:shadow-xl hover:shadow-[#037166]/40 transition-all"
          >
            <span>Explore All PG & Hostels</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* PG Cards - Horizontal Scroller */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 pb-8 scrollbar-hide snap-x snap-mandatory"
          >
            {hostels.map((hostel, index) => (
              <motion.div
                key={hostel.id || index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`flex-shrink-0 w-[85%] sm:w-[45%] lg:w-[24%] snap-start group ${hostel.isDummy ? 'cursor-not-allowed grayscale-[0.5] opacity-80' : ''}`}
              >
                {/* Card with Parallax Effect */}
                <motion.div
                  whileHover={hostel.isDummy ? {} : {}}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`relative h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl ${hostel.isDummy ? 'pointer-events-none' : ''}`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Type Badge */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-8 py-1 bg-[#037166]/90 backdrop-blur-md rounded-full rounded-t-none border border-t-0 border-[#037166]/30 shadow-lg whitespace-nowrap">
                    <h6 className="text-xs font-intro text-white  tracking-wider">
                      {hostel.type}
                    </h6>
                  </div>


                  {/* Image with Depth */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.div
                      whileHover={hostel.isDummy ? {} : {}}
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
                    <h4 className="text-xl font-bold bg-gradient-to-r from-[#037166] via-[#ff6b35] to-[#037166] bg-clip-text text-transparent mb-2 h-14 line-clamp-2">
                      {hostel.name}
                    </h4>

                    {/* Description - 2 lines */}
                    {/* <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2 min-h-[2.5em]">
                      {hostel.description || "Experience premium living with the perfect blend of comfort, style, and community. Our state-of-the-art facilities ensure a hassle-free lifestyle."}
                    </p> */}

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Location</span>
                        <span className="text-white font-intro text-right flex-1 ml-4 line-clamp-1">{hostel.location}</span>
                      </div>
                      {/* <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Occupancy</span>
                        <span className="text-white font-intro text-right flex-1 ml-4">{hostel.occupancy}</span>
                      </div> */}
                    </div>

                    {/* Price */}
                    <div className="mb-2 p-2 border border-[#037166]/20 rounded-xl flex items-center justify-between gap-2">

                      {/* Left: Price */}
                      <div>
                        <h6 className="text-[10px] text-gray-400 mb-0.5 font-intro">
                          Starting from
                        </h6>
                        <div className="text-sm font-bold text-[#037166] font-intro">
                          {hostel.price}
                        </div>
                      </div>



                      {/* Right: Book Now */}
                      <div className={`${hostel.isDummy ? 'opacity-100 pointer-events-none' : ''}`}>
                        <Link
                          href={hostel.isDummy ? '#' : `/pghostels/hostel-detail/${hostel.id}`}
                        >
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={hostel.isDummy}
                            className="px-2 py-1.5 bg-gradient-to-r from-[#037166] to-[#025951] rounded-full font-semibold text-[10px] shadow-lg shadow-[#037166]/30 whitespace-nowrap"
                          >
                            <span className="text-white">
                              Book Now
                            </span>
                          </motion.button>
                        </Link>
                      </div>

                    </div>


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
                            <span className="text-xs text-gray-300">{amenity}</span>
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
      `}</style>
    </section>
  );
}
