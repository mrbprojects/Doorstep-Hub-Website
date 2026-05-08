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

  // SEO Schema for Popular Centers
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Popular Appliance Service Centers",
    "description": "Top-rated authorized appliance repair and service centers near you.",
    "itemListElement": (centers || []).slice(0, 10).map((center, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": center.name,
      "description": `Authorized service center in ${center.location}. Rating: ${center.rating}/5.`,
      "url": center.slug ? `https://doorstephub.com/service-list/${center.slug}` : undefined
    }))
  };

  useEffect(() => {
    const fetchCenters = async () => {

      if (!location?.lat || !location?.lng) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/featured_service_centers`, {
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
            slug: center.slug, // Map the slug
            // Use image if available, otherwise logo, otherwise fallback
            image: center.logo
              ? `https://api.doorstephub.com/${center.logo}`
              : center.image
                ? `https://api.doorstephub.com/${center.image}`
                : 'https://images.unsplash.com/photo-1667503779301-3120a323859a?auto=format&fit=crop&q=80',
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
    <div className="w-80 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
      {/* Shimmer Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 animate-shimmer" />

      {/* Shimmer Content */}
      <div className="p-5">
        {/* Title Shimmer */}
        <div className="h-6 w-3/4 mb-2 bg-gray-200 rounded animate-shimmer" />

        {/* Location Shimmer */}
        <div className="h-4 w-1/2 mb-4 bg-gray-200 rounded animate-shimmer" />

        {/* Speciality Badge Shimmer */}
        <div className="h-6 w-1/3 mb-4 bg-gray-200 rounded-lg animate-shimmer" />

        {/* Rating & CTA Shimmer */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-shimmer" />
          <div className="h-10 w-24 rounded-full bg-gray-200 animate-shimmer" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden bg-white">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4">
              <Award className="w-3 h-3 text-[#04a99d]" />
              <h6 className="text-xs font-medium text-[#04a99d]">TOP RATED</h6>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">Explore Popular Services Center</h2>
            <p className="text-gray-500">Most trusted and highly-rated service providers in your area</p>
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
    <section className="py-20 relative bg-white">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />


      <div className="relative z-10 w-full">
        {/* Section Header */}
        <div className="mb-12 px-6 lg:px-8">
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
            className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900"
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
            <div className="flex gap-6 min-w-max px-6 lg:px-8">
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
                  <div className="relative w-80 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300">
                    {/* Popular Badge */}
                    {center.popular && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] shadow-lg">
                        <TrendingUp className="w-3 h-3 text-white" />
                        <h6 className="text-xs font-medium !text-white">Most Popular</h6>
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
                      <h4 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                        {center.name}
                      </h4>
                      <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
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
                          onClick={() => onStoreClick?.(center.slug)}
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
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
