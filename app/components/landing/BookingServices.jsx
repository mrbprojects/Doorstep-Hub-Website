'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Star } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

function SkeletonCard() {
  return (
    <div className="h-[250px] bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-3xl overflow-hidden flex flex-col">
      <div className="h-40 bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-pulse flex-shrink-0" />
      <div className="p-4 space-y-2 flex-1">
        <div className="h-3 w-24 bg-[#2a2a2a] rounded animate-pulse" />
        <div className="h-8 bg-[#2a2a2a] rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}

export function BookingServices() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [offsetY, setOffsetY] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [serviceSlugs, setServiceSlugs] = useState({
    appliances: 'appliance-repair-services',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels'
  });

  // Fetch Service Slugs and Services
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Slugs (only appliance ID is supported by this endpoint)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`);
          const data = await res.json();
          if (data.success && data.data?.home) {
            setServiceSlugs(prev => ({ ...prev, appliances: data.data.home }));
          }
        } catch (e) { /* use default slug */ }

        // 2. Fetch Latest Booking Services
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_bookings_services`);
        const data = await response.json();

        if (data.success && data.services) {
          // Fetch all services for slug enrichment
          const allRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/all-services`);
          const allData = await allRes.json();
          const allServices = allData.success && Array.isArray(allData.data) ? allData.data : [];

          const transformedServices = data.services.slice(0, 6).map(service => {
            const matched = allServices.find(as => as._id === service._id || as.serviceName === service.serviceName);
            return {
              id: service._id,
              title: service.serviceName,
              category: service.categoryName,
              slug: service.slug || matched?.slug,
              rating: 4.8,
              bookings: '2.3K',
              image: service.mainImage
                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.mainImage}`
                : 'https://images.unsplash.com/photo-1594873604892-b599f847e859?w=400',
              status: service.status === 'active' ? '10% Off On Repairs' : 'Unavailable',
            };
          });
          setServices(transformedServices);
        }
      } catch (err) {
        console.error('Error fetching booking services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const subcategoryListRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const groupedServices = useMemo(() => {
    const grouped = services.reduce((accumulator, service) => {
      const key = service.category || 'General Services';
      if (!accumulator[key]) accumulator[key] = [];
      accumulator[key].push(service);
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, items]) => ({
      name,
      items,
      image: items[0]?.image || '',
    }));
  }, [services]);

  const visibleServices = useMemo(() => {
    if (activeSubcategory === 'all') return services;
    return services.filter((service) => service.category === activeSubcategory);
  }, [activeSubcategory, services]);

  useEffect(() => {
    if (!groupedServices.length) {
      setActiveSubcategory('all');
      return;
    }

    setActiveSubcategory((current) => {
      if (current === 'all') return current;
      return groupedServices.some((group) => group.name === current) ? current : groupedServices[0].name;
    });
  }, [groupedServices]);

  useEffect(() => {
    if (!isDesktop || loading) {
      setOffsetY(0);
      return;
    }

    const container = subcategoryListRef.current;
    if (!container || activeSubcategory === 'all') {
      setOffsetY(0);
      return;
    }

    const activeButton = container.querySelector(`[data-subcategory="${CSS.escape(activeSubcategory)}"]`);
    setOffsetY(activeButton?.offsetTop || 0);
  }, [activeSubcategory, isDesktop, loading, groupedServices]);

  const handleServiceClick = (service) => {
    const categoryParam = encodeURIComponent(service.category);
    const subCategoryParam = encodeURIComponent(service.title);

    // Determine base slug dynamically
    let baseSlug = serviceSlugs.appliances;
    const upperCategory = (service.category || '').toUpperCase();
    const upperTitle = (service.title || '').toUpperCase();

    if (upperCategory.includes('RELIGIOUS') || upperTitle.includes('RELIGIOUS')) baseSlug = serviceSlugs.religious;
    else if (upperCategory.includes('PG') || upperTitle.includes('PG')) baseSlug = serviceSlugs.pg;
    else if (upperCategory.includes('SPA') || upperTitle.includes('SPA')) baseSlug = serviceSlugs.spa;

    if (baseSlug === serviceSlugs.spa) {
      router.push(`/spa-salon/${service.slug || service.id}`);
      return;
    }
    if (baseSlug === serviceSlugs.religious) {
      router.push(`/religious-services/${service.slug || service.id}`);
      return;
    }
    if (baseSlug === serviceSlugs.pg) {
      router.push(`/pghostels/${service.slug || service.id}`);
      return;
    }

    router.push(`/${service.slug || `${baseSlug}/detail/${service.id}?category=${categoryParam}&subCategory=${subCategoryParam}`}`);
  };

  return (
    <section id="booking-services" className="relative pt-4 pb-12 overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Static Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/20 rounded-full blur-[170px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/15 rounded-full blur-[170px] pointer-events-none" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-2">
            <Calendar className="w-4 h-4 text-[#037166]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Futuristic Service Partners</h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
              Latest Booking Services
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Book your favorite services instantly with our advanced booking platform
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            {loading ? (
              <>
                <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-12 min-w-[120px] rounded-full border border-[#037166]/20 bg-white/10 animate-pulse" />
                  ))}
                </div>
                <div ref={subcategoryListRef} className="hidden space-y-4 lg:block">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-[96px] rounded-[28px] border border-[#037166]/20 bg-white/10 animate-pulse" />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-hide">
                  <button
                    type="button"
                    onClick={() => setActiveSubcategory('all')}
                    className={`flex h-12 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
                      activeSubcategory === 'all'
                        ? 'border-[#037166] bg-[#037166] !text-white'
                        : 'border-[#037166]/25 bg-white/10 text-[#037166]'
                    }`}
                  >
                    All Services
                  </button>
                  {groupedServices.map((group) => (
                    <button
                      key={group.name}
                      type="button"
                      onClick={() => setActiveSubcategory(group.name)}
                      className={`flex h-12 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
                        activeSubcategory === group.name
                          ? 'border-[#037166] bg-[#037166] !text-white'
                          : 'border-[#037166]/25 bg-white/10 text-[#037166]'
                      }`}
                    >
                      {group.name}
                    </button>
                  ))}
                </div>

                <div className="hidden space-y-4 lg:block">
                  <button
                    type="button"
                    onClick={() => setActiveSubcategory('all')}
                    className={`group flex h-[96px] w-full items-center justify-between rounded-[28px] border px-5 py-4 text-left transition ${
                      activeSubcategory === 'all'
                        ? 'border-[#037166]/45 bg-white text-[#0f172a] shadow-[0_20px_50px_rgba(3,113,102,0.14)]'
                        : 'border-[#037166]/20 bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                        activeSubcategory === 'all' ? 'border-[#037166]/30 bg-[#037166]/10' : 'border-white/10 bg-white/5'
                      }`}>
                        <span className={`text-base font-bold ${activeSubcategory === 'all' ? 'text-[#037166]' : 'text-white'}`}>All</span>
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${activeSubcategory === 'all' ? 'text-[#0f172a]' : 'text-white'}`}>All Services</h3>
                        <p className={`${activeSubcategory === 'all' ? 'text-slate-500' : 'text-white/60'} text-sm`}>Show every service</p>
                      </div>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      activeSubcategory === 'all' ? 'bg-[#037166] !text-white' : 'bg-white/10 text-white'
                    }`}>
                      <ArrowRight className="h-5 w-5 !text-white" />
                    </div>
                  </button>

                  {groupedServices.map((group) => {
                    const isActive = activeSubcategory === group.name;

                    return (
                      <button
                        key={group.name}
                        data-subcategory={group.name}
                        type="button"
                        onClick={() => setActiveSubcategory(group.name)}
                        className={`group flex h-[96px] w-full items-center justify-between rounded-[28px] border px-5 py-4 text-left transition ${
                          isActive
                            ? 'border-[#037166]/45 bg-white text-[#0f172a] shadow-[0_20px_50px_rgba(3,113,102,0.14)]'
                            : 'border-[#037166]/20 bg-white/10 text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                            isActive ? 'border-[#037166]/30 bg-[#037166]/10' : 'border-white/10 bg-white/5'
                          }`}>
                            {group.image ? (
                              <img
                                loading="lazy"
                                decoding="async"
                                src={group.image}
                                alt={group.name}
                                className="h-11 w-11 rounded-xl object-cover"
                              />
                            ) : (
                              <span className={`text-base font-bold ${isActive ? 'text-[#037166]' : 'text-white'}`}>
                                {group.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${isActive ? 'text-[#0f172a]' : 'text-white'}`}>{group.name}</h3>
                            <p className={`${isActive ? 'text-slate-500' : 'text-white/60'} text-sm`}>{group.items.length} Services</p>
                          </div>
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          isActive ? 'bg-[#037166] !text-white' : 'bg-white/10 text-white'
                        }`}>
                          <ArrowRight className="h-5 w-5 !text-white" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div
            className="min-w-0"
            style={isDesktop ? { marginTop: `${offsetY}px`, transition: 'margin-top 0.4s cubic-bezier(0.16, 1, 0.3, 1)' } : {}}
          >
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : visibleServices.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {visibleServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.45 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="group relative cursor-pointer"
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className="relative overflow-hidden rounded-3xl border border-[#037166]/20 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#037166]/20">
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={service.image}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          style={{ width: '100%', height: '100%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />

                        <div className="absolute left-0 top-0 z-20 rounded-br-xl bg-[#037166]/90 px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] !text-white">
                          {service.status}
                        </div>

                        <div className="absolute bottom-0 left-0 z-20">
                          <div className="flex items-center gap-1 rounded-tr-xl border-r border-t border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                            <Star className="h-4 w-4 fill-white text-white" />
                            <span className="text-sm font-bold text-white">{service.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <div>
                          <h6 className="text-[10px] font-medium tracking-[0.18em] text-[#58c4b4] uppercase">
                            {service.category}
                          </h6>
                          <h4
                            className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-white"
                            title={service.title}
                          >
                            {service.title}
                          </h4>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleServiceClick(service);
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e89117] to-[#00796B] hover:opacity-90 px-4 py-2 text-sm font-semibold !text-white transition shadow-md hover:shadow-lg hover:scale-105"
                          >
                            Book Now
                            <ArrowRight className="h-4 w-4 !text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="absolute -inset-1 -z-10 bg-gradient-to-r from-[#037166]/0 via-[#037166]/20 to-[#037166]/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-[#037166]/20 bg-white/10 px-6 py-12 text-center">
                <p className="text-lg font-semibold text-white">No services found for this subcategory</p>
                <p className="mt-2 text-sm text-white/60">Try another subcategory to view related services.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}




