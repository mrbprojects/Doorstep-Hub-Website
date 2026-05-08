'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Wrench, Cpu, Loader2, MapPin, CheckCircle2, Star } from 'lucide-react';
import { fetchServicesByBrand, fetchAuthorizedServices, fetchCities, fetchCategories, fetchAllBrands } from '@/lib/api';

function StepBar({ step }) {
  const steps = ['Category', 'Brand', 'Service'];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                done ? 'bg-[#037166] border-[#037166] text-white' :
                active ? 'bg-white border-[#037166] text-[#037166]' :
                'bg-white border-gray-200 text-gray-300'
              }`}>
                {done ? <CheckCircle2 size={18} /> : idx}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest hidden sm:block transition-colors ${
                active ? 'text-[#037166]' : done ? 'text-[#037166]/70' : 'text-gray-300'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 mx-4 h-0.5 transition-all duration-300 ${done ? 'bg-[#037166]' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ServicePageContent() {
  const router = useRouter();
  const params = useParams();
  const { citySlug, categorySlug, brandSlug } = params;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cities, cats, brands] = await Promise.all([fetchCities(), fetchCategories(), fetchAllBrands()]);
        
        const cityMatch = cities.find(c => (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') === citySlug.toLowerCase());
        const catMatch = cats.find(c => c.slug === categorySlug);
        const brandMatch = brands.find(b => (b.slug || b.name || '').toLowerCase().replace(/\s+/g, '-') === brandSlug.toLowerCase());

        setSelectedCity(cityMatch || { name: citySlug, slug: citySlug });
        setSelectedCategory(catMatch || { name: categorySlug, slug: categorySlug });
        setSelectedBrand(brandMatch || { name: brandSlug, slug: brandSlug });

        const brandName = brandMatch?.name || brandSlug;
        const [apiResult, authResult] = await Promise.allSettled([
          fetchServicesByBrand(brandName),
          fetchAuthorizedServices(),
        ]);

        let apiServices = apiResult.status === 'fulfilled' ? apiResult.value : [];
        let authServices = [];

        if (authResult.status === 'fulfilled' && Array.isArray(authResult.value)) {
          authServices = authResult.value
            .filter(s => {
              const bMatch = s.brandName?.toLowerCase().trim() === brandName?.toLowerCase().trim();
              const cMatch = !catMatch?.name || (
                Array.isArray(s.categoryName)
                  ? s.categoryName.some(c => c?.toLowerCase() === catMatch.name?.toLowerCase())
                  : s.categoryName?.toLowerCase() === catMatch?.name?.toLowerCase()
              );
              return bMatch && cMatch;
            })
            .map(s => ({
              _id: s._id,
              serviceName: s.name,
              image: s.mainImage,
              slug: s.slug,
              isAuthorized: true,
            }));
        }

        const combined = [...apiServices, ...authServices];
        const unique = Array.from(new Map(combined.map(i => [i.serviceName, i])).values());
        setServices(unique);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [citySlug, categorySlug, brandSlug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#037166]" />
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#037166]">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
            <MapPin size={14} className="text-[#037166]" />
            <span className="text-[#037166]">{selectedCity?.name}</span>
            <span className="text-gray-300">·</span>
            <span>{selectedCategory?.name} · {selectedBrand?.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-[#037166] hover:border-[#037166]/30 transition-all"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">Available Services</h1>
          <p className="mt-2 text-gray-400 font-medium">{selectedCategory?.name} · {selectedBrand?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => router.push(`/appliances/repair-service/${citySlug}`)}
            className="px-4 py-2 rounded-full border border-[#037166]/20 bg-[#037166]/5 text-[#037166] text-xs font-black uppercase tracking-wider"
          >
            {selectedCategory?.name}
          </button>
          <button
            onClick={() => router.push(`/appliances/repair-service/${citySlug}/${categorySlug}`)}
            className="px-4 py-2 rounded-full border border-[#037166]/20 bg-[#037166]/5 text-[#037166] text-xs font-black uppercase tracking-wider"
          >
            {selectedBrand?.name}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {services.map(service => {
            const sSlug = service.slug || service._id;
            return (
              <button
                key={service._id || service.serviceName}
                onClick={() => router.push(`/service-list/book-now/${sSlug}`)}
                className="group relative rounded-3xl border-2 border-gray-100 bg-white overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#037166]/30 hover:shadow-2xl shadow-lg"
              >
                <div className="flex h-[150px]">
                  {/* Image section - Touching Top, Left, Bottom */}
                  <div className="w-32 sm:w-36 flex-shrink-0 h-full overflow-hidden bg-gray-50 border-r border-gray-100">
                    {service.image ? (
                      <img
                        src={`https://api.doorstephub.com/${service.image}`}
                        alt={service.serviceName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Wrench size={32} className="text-gray-200" />
                      </div>
                    )}
                  </div>

                  {/* Content section */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center relative min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {/*
                        <div className="flex items-center gap-2 mb-1.5">
                           <span className="px-2 py-0.5 rounded-md bg-[#037166]/5 text-[#037166] text-[8px] font-black uppercase tracking-widest">
                            {service.isAuthorized ? 'Authorized Service' : 'Premium Quality'}
                           </span>
                        </div>
                        */}
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight leading-tight truncate">
                          {service.serviceName}
                        </h3>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#037166] group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                      Professional doorstep {service.serviceName?.toLowerCase()} with expert technician visit, genuine spares, and transparent pricing.
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                       <div className="flex items-center gap-1 text-amber-400">
                         <Star size={12} fill="currentColor" />
                         <span className="text-[10px] font-black text-gray-900">4.9</span>
                       </div>
                       <div className="h-1 w-1 rounded-full bg-gray-200" />
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Available Now</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {services.length === 0 && (
             <div className="py-20 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-[2rem]">
               No services found for this brand and category.
             </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ServicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#037166]" /></div>}>
      <ServicePageContent />
    </Suspense>
  );
}


