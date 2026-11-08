'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function RecentlyBooked({ onServiceClick, onViewAll }) {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SEO Schema for Recently Booked Services
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Recently Booked Appliance Services",
    "description": "Trending appliance repair services recently booked by our customers.",
    "itemListElement": (services || []).slice(0, 12).map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": service.title,
      "url": service.slug ? `https://doorstephub.com/${service.slug.replace(/^\//, '')}` : undefined
    }))
  };

  // Fetch real recently booked services (Total 12 items)
  useEffect(() => {
    const fetchRecentServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_bookings_services`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recent services');
        }

        const data = await response.json();
        if (data.success && data.services) {
          // Transform API data to match component structure - exactly 12 items for 2 rows of 6
          const transformedServices = data.services.slice(0, 12).map(service => ({
            id: service._id,
            image: service.mainImage ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400',
            title: service.serviceName,
            price: service.serviceBookingCost,
            bookings: Math.floor(Math.random() * 200) + 50,
            categoryName: service.categoryName,
            subcategoryName: service.subcategoryName,
            slug: service.slug,
          }));
          setServices(transformedServices);
        } else {
          throw new Error(data.message || 'No services found');
        }
      } catch (err) {
        console.error('Error fetching recent services:', err);
        setError('Failed to load recent services');
        toast.error('Failed to load recent services');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentServices();
  }, []);

  // Shimmer Skeleton Card (6-column grid item)
  const ShimmerRecentCard = () => (
    <div className="w-full h-[250px] rounded-2xl overflow-hidden bg-white border border-gray-200/90 shadow-sm animate-pulse flex flex-col justify-between">
      <div className="relative h-32 bg-gray-100 flex-shrink-0" />
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-full bg-[#00796B]/15 rounded-xl mt-auto" />
      </div>
    </div>
  );

  // Loading state (6 per row, total 12)
  if (loading) {
    return (
      <section className="py-8 sm:py-10 lg:py-12 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00796B]/10 border border-[#00796B]/20 mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00796B]" />
              <span className="text-xs font-bold text-[#00796B] tracking-wider uppercase">TRENDING NOW</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Explore Our Recently Booked Services</h2>
            <p className="text-slate-600 text-sm sm:text-base">See what services your neighbors are booking right now</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ShimmerRecentCard key={`shimmer-recent-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || services.length === 0) {
    return (
      <section className="py-16 relative overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-slate-500 mb-4">{error || 'No recent bookings available'}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00796B] text-white text-xs font-semibold hover:bg-[#00605A] transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="recently-booked" className="py-8 sm:py-10 lg:py-12 relative overflow-hidden">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00796B]/10 border border-[#00796B]/20 mb-2.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#00796B]" />
              <h6 className="text-xs font-bold text-[#00796B] tracking-wider uppercase">TRENDING NOW</h6>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 tracking-tight"
            >
              Explore Our Recently Booked Services
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed"
            >
              See what services your neighbors are booking right now
            </motion.p>
          </div>

          {onViewAll && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="self-start sm:self-end shrink-0"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-full bg-gradient-to-r from-[#00796B] to-[#009688] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#00796B]/20 hover:shadow-lg hover:shadow-[#00796B]/40 hover:opacity-95 transition-all inline-flex items-center gap-2"
                onClick={onViewAll}
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Services Grid: 6 per row on desktop, total 12 (2 rows of 6) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {services.slice(0, 12).map((service, index) => {
            const dynamicUrl = service.slug ? `/${service.slug.replace(/^\//, '')}` : '#';

            return (
              <motion.div
                key={service.id || index}
                data-recent-card="true"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => {
                  if (service.slug) {
                    router.push(dynamicUrl);
                  } else {
                    onServiceClick?.(service.id, service.categoryName, service.subcategoryName, service.slug);
                  }
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white border border-gray-200/90 hover:border-[#00796B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
                  
                  {/* Service Image */}
                  <div className="relative h-32 sm:h-36 overflow-hidden bg-gray-50 shrink-0 border-b border-gray-100">
                    <Image
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400';
                      }}
                     width={500} height={300} />

                    {/* Category Name Tag */}
                    {service.categoryName && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-[#5eead4] truncate max-w-[110px] shadow-xs">
                        {service.categoryName}
                      </span>
                    )}
                  </div>

                  {/* Card Content - Crisp Visible Text */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 mb-3 group-hover:text-[#00796B] transition-colors line-clamp-2 leading-snug">
                      {service.title}
                    </h4>

                    {/* Book Service Button with dynamic link */}
                    <Link
                      href={dynamicUrl}
                      onClick={(e) => {
                        e.stopPropagation();
                        onServiceClick?.(service.id, service.categoryName, service.subcategoryName, service.slug);
                      }}
                      className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-[#00796B] to-[#009688] hover:opacity-95 text-white text-[11px] sm:text-xs font-bold shadow-xs transition-all active:scale-95 group-hover:scale-[1.02]"
                    >
                      <span>Book Service</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
