'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

/* ─── Skeleton ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex flex-col group">
      <div className="h-36 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse flex-shrink-0" />
      <div className="p-4 space-y-2.5 flex-1">
        <div className="h-2.5 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-full animate-pulse w-4/5" />
        <div className="h-4 bg-gray-100 rounded-full animate-pulse w-3/5" />
        <div className="flex justify-end pt-1">
          <div className="h-8 w-24 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ─── Service Card ─────────────────────────────────────────── */
function ServiceCard({ service, onBook, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full"
      onClick={() => onBook(service)}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Status badge */}
        {service.status && service.status !== 'Unavailable' && (
          <span className="absolute top-2.5 left-2.5 bg-[#037166] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
            {service.status}
          </span>
        )}

        {/* Rating */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{service.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-3.5 gap-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#037166]">
          {service.category}
        </p>
        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
          {service.title}
        </h4>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onBook(service); }}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#e89117] to-[#00796B] text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 shadow hover:opacity-90 hover:scale-105 transition-all"
          >
            Book Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ───────────────────────────────────────── */
export function BookingServices() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [serviceSlugs, setServiceSlugs] = useState({
    appliances: 'appliance-repair-services',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels'
  });

  /* Fetch data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch dynamic slug
        try {
          const slugRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`);
          const slugData = await slugRes.json();
          if (slugData.success && slugData.data?.home) {
            setServiceSlugs(prev => ({ ...prev, appliances: slugData.data.home }));
          }
        } catch { /* use default */ }

        // 2. Fetch latest bookings services
        let bookingServices = [];
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_bookings_services`);
          const data = await response.json();
          if (data.success && Array.isArray(data.services)) {
            bookingServices = data.services;
          }
        } catch (e) {
          console.warn('Error fetching latest bookings:', e);
        }

        // 3. Fetch all active categories to ensure EVERY category is represented
        let allCategories = [];
        try {
          const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lattitude: '17.3850', longitude: '78.4867' })
          });
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.data)) {
            allCategories = catData.data;
          }
        } catch (e) {
          console.warn('Error fetching categories:', e);
        }

        // Group bookingServices by category
        const categoryServicesMap = {};
        bookingServices.forEach(s => {
          const catKey = (s.categoryName || '').trim().toLowerCase();
          if (catKey) {
            if (!categoryServicesMap[catKey]) categoryServicesMap[catKey] = [];
            categoryServicesMap[catKey].push(s);
          }
        });

        // 4. For any categories missing or having fewer than 3 services in bookingServices, fetch their subcategories
        const missingOrLowCats = allCategories.filter(c => {
          const key = (c.name || '').trim().toLowerCase();
          return !categoryServicesMap[key] || categoryServicesMap[key].length < 3;
        });

        let additionalServices = [];
        if (missingOrLowCats.length > 0) {
          const subcatFetches = missingOrLowCats.map(c =>
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ categoryId: c._id })
            })
            .then(r => r.json())
            .then(d => {
              if (d.success && Array.isArray(d.data)) {
                return d.data.map(sub => ({
                  _id: sub._id,
                  serviceName: sub.name,
                  categoryName: c.name,
                  slug: sub.slug,
                  mainImage: sub.image,
                  status: 'active'
                }));
              }
              return [];
            })
            .catch(() => [])
          );
          const subcatResults = await Promise.all(subcatFetches);
          additionalServices = subcatResults.flat();
        }

        // 5. Combine and transform all services
        const combined = [...bookingServices, ...additionalServices];

        // Deduplicate by ID
        const seenIds = new Set();
        const deduplicated = [];
        combined.forEach(s => {
          const id = (s._id || s.id || '').toString();
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            deduplicated.push(s);
          }
        });

        const transformed = deduplicated.map(service => {
          const rawImage = service.mainImage || service.image || '';
          const imageUrl = rawImage
            ? (rawImage.startsWith('http') ? rawImage : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${rawImage.replace(/^\/+/, '')}`)
            : 'https://images.unsplash.com/photo-1594873604892-b599f847e859?w=400';

          return {
            id: service._id || service.id,
            title: service.serviceName || service.name || 'Appliance Service',
            category: service.categoryName || service.category || 'General',
            slug: service.slug,
            rating: 4.8,
            image: imageUrl,
            status: service.status === 'active' ? '10% Off' : null,
          };
        });

        setServices(transformed);
      } catch (err) {
        console.error('Error fetching booking services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Derived categories with exact service counts */
  const categories = useMemo(() => {
    const map = {};
    services.forEach(s => {
      const key = (s.category || 'General').trim();
      if (!map[key]) map[key] = 0;
      map[key]++;
    });
    return Object.entries(map).map(([name, count]) => ({
      name,
      count
    }));
  }, [services]);

  /* Filtered services: balanced mix across all categories for 'all', full category list otherwise */
  const visibleServices = useMemo(() => {
    if (activeCategory === 'all') {
      // In "All Services", take up to 3 services from EACH category so every category is visible
      const byCat = {};
      services.forEach(s => {
        const k = (s.category || 'General').trim();
        if (!byCat[k]) byCat[k] = [];
        if (byCat[k].length < 3) {
          byCat[k].push(s);
        }
      });
      const balanced = Object.values(byCat).flat();
      return balanced.length > 0 ? balanced : services.slice(0, 24);
    }
    return services.filter(s => (s.category || 'General').trim() === activeCategory);
  }, [activeCategory, services]);

  /* Navigation handler */
  const handleServiceClick = (service) => {
    const upperCat = (service.category || '').toUpperCase();
    const upperTitle = (service.title || '').toUpperCase();

    if (upperCat.includes('RELIGIOUS') || upperTitle.includes('RELIGIOUS')) {
      router.push(`/religious-services/${service.slug || service.id}`);
      return;
    }
    if (upperCat.includes('SPA') || upperTitle.includes('SPA') || upperCat.includes('SALON') || upperTitle.includes('SALON')) {
      router.push(`/spa-salon/${service.slug || service.id}`);
      return;
    }
    if (upperCat.includes('PG') || upperTitle.includes('PG')) {
      router.push(`/pghostels/${service.slug || service.id}`);
      return;
    }

    if (service.slug && service.slug.startsWith('/')) {
      router.push(service.slug);
      return;
    }

    if (service.slug) {
      router.push(`/${serviceSlugs.appliances}/${service.slug}`);
      return;
    }

    const categoryParam = encodeURIComponent(service.category || '');
    const subCategoryParam = encodeURIComponent(service.title || '');
    router.push(`/${serviceSlugs.appliances}/detail/${service.id}?category=${categoryParam}&subCategory=${subCategoryParam}`);
  };

  return (
    <section id="booking-services" className="relative bg-[#0a0a0a] pt-10 pb-14 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#037166]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#04a99d]/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-7"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
              Latest Appliance Service Bookings
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-5xl mx-auto">
            See the home appliance services customers are booking right now, from AC and refrigerator repairs to washing machine, TV, water purifier and other doorstep service needs.
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`category-pill group flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              activeCategory === 'all'
                ? 'category-pill-active bg-[#037166] border-[#037166] !text-white shadow-sm shadow-[#037166]/30'
                : 'bg-white border-[#037166]/30 !text-[#037166] hover:bg-[#037166] hover:border-[#037166] hover:!text-white shadow-sm'
            }`}
          >
            All Services ({services.length})
          </button>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 h-8 w-28 rounded-full bg-white/10 animate-pulse" />
              ))
            : categories.map(cat => {
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setActiveCategory(cat.name)}
                    className={`category-pill group flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                      isActive
                        ? 'category-pill-active bg-[#037166] border-[#037166] !text-white shadow-sm shadow-[#037166]/30'
                        : 'bg-white border-[#037166]/30 !text-[#037166] hover:bg-[#037166] hover:border-[#037166] hover:!text-white shadow-sm'
                    }`}
                  >
                    {cat.name}
                    <span className={`ml-1.5 text-[10px] font-medium transition-colors ${
                      isActive ? '!text-white/80' : '!text-[#037166]/80 group-hover:!text-white'
                    }`}>
                      ({cat.count})
                    </span>
                  </button>
                );
              })
          }
        </div>

        {/* Service Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visibleServices.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            >
              {visibleServices.map((service, i) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={i}
                  onBook={handleServiceClick}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-16 border border-[#037166]/20 rounded-2xl bg-white/5">
            <p className="text-white font-semibold text-lg">No services found</p>
            <p className="text-white/50 text-sm mt-2">Try selecting a different category</p>
          </div>
        )}

        {/* View All CTA */}
        {!loading && services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-8"
          >
            <button
              type="button"
              onClick={() => router.push(`/${serviceSlugs.appliances}`)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#037166]/40 bg-white/5 text-[#58c4b4] text-sm font-semibold hover:bg-[#037166] hover:text-white hover:border-[#037166] transition-all"
            >
              View All Services
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
