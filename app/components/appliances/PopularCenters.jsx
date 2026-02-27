'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Award, ArrowRight, TrendingUp, MapPin } from 'lucide-react';
import { useLocationContext } from '../../context/LocationContext';

export function PopularCenters({ onStoreClick }) {
  const { location } = useLocationContext();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCenters = async () => {
      if (!location?.lat || !location?.lng) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/featured_service_centers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lattitude: location.lat,
            longitude: location.lng
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch service centers');
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.featuredServiceCenters)) {
          const mappedCenters = data.featuredServiceCenters.map(center => ({
            id: center._id,
            // Use image if available, otherwise logo, otherwise fallback
            image: center.image ? `https://api.doorstephub.com/${center.image}` :
              (center.logo ? `https://api.doorstephub.com/${center.logo}` : 'https://images.unsplash.com/photo-1667503779301-3120a323859a?auto=format&fit=crop&q=80'),
            name: center.name,
            location: center.cityName && center.stateName ? `${center.cityName}, ${center.stateName}` : (center.address || 'Unknown Location'),
            rating: typeof center.rating === 'string' ? parseFloat(center.rating) : (center.rating || 0),
            reviews: 0, // Not provided by API
            speciality: center.bio || 'Service Center',
            popular: true, // Assuming all featured centers are popular
            charges: center.serviceCharge
          }));
          setCenters(mappedCenters);
        } else {
          setCenters([]);
        }

      } catch (err) {
        console.error('Error fetching centers:', err);
        setError('Failed to load service centers');
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [location?.lat, location?.lng]);

  // Shimmer Skeleton Card
  const ShimmerCenterCard = () => (
    <div className="w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
      {/* Shimmer Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />

      {/* Shimmer Content */}
      <div className="p-5">
        {/* Title Shimmer */}
        <div className="h-6 w-3/4 mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />

        {/* Location Shimmer */}
        <div className="h-4 w-1/2 mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />

        {/* Speciality Badge Shimmer */}
        <div className="h-6 w-1/3 mb-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />

        {/* Rating & CTA Shimmer */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-16 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg animate-shimmer" />
          <div className="h-10 w-24 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4">
              <Award className="w-3 h-3 text-[#04a99d]" />
              <h6 className="text-xs font-medium text-[#04a99d]">TOP RATED</h6>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">Explore Popular Services Center</h2>
            <p className="text-white/60">Most trusted and highly-rated service providers in your area</p>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <ShimmerCenterCard key={i} />
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </section>
    );
  }

  if (centers.length === 0) {
    return null; // Or return a message saying no centers found
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1614]/30 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4"
          >
            <Award className="w-3 h-3 text-[#04a99d]" />
            <h6 className="text-sm font-medium text-[#04a99d]">TOP RATED</h6>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent"
          >
            Explore Popular Services Center
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Most trusted and highly-rated service providers in your area
          </motion.p>
        </div>

        {/* Horizontal Scroll */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-6 min-w-max">
              {centers.map((center, index) => (
                <motion.div
                  key={center.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <div className="relative w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
                    {/* Popular Badge */}
                    {center.popular && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] shadow-lg">
                        <TrendingUp className="w-3 h-3 text-white" />
                        <h6 className="text-xs font-medium text-white">Most Popular</h6>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-[#0a0a0a]">
                      <img
                        src={center.image}
                        alt={center.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1667503779301-3120a323859a?auto=format&fit=crop&q=80';
                        }}
                      />
                      {/* Rating Badge - Bottom Left Flush */}
                      <div className="absolute bottom-0 left-0 z-20">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border-t border-r border-white/10 text-white">
                          <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                          <span className="text-sm font-bold">{center.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h4 className="text-xl font-bold text-white mb-1 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                        {center.name}
                      </h4>
                      <p className="text-white/50 text-sm mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {center.location}
                      </p>

                      {/* Speciality Badge */}
                      <div className="inline-block px-3 py-1 rounded-lg bg-[#037166]/20 border border-[#037166]/30 mb-4 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        <h6 className="text-xs font-medium text-[#04a99d] line-clamp-1">{center.speciality}</h6>
                      </div>

                      {/* Rating & CTA */}
                      <div className="flex items-center justify-between">


                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium text-sm shadow-lg shadow-[#037166]/30 group-hover:shadow-[#037166]/50 transition-all flex items-center gap-2"
                          onClick={() => onStoreClick?.(center)}
                        >
                          View Store
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Glass Border on Hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl border-2 border-[#037166]/50 pointer-events-none"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
