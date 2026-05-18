'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Search, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { fetchAllBrands, fetchCities, fetchCategories } from '@/lib/api';

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

function BrandPageContent() {
  const router = useRouter();
  const params = useParams();
  const { citySlug, categorySlug } = params;

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cities, cats] = await Promise.all([fetchCities(), fetchCategories()]);
        
        const cityMatch = cities.find(c => (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') === citySlug.toLowerCase());
        setSelectedCity(cityMatch || { name: citySlug, slug: citySlug });

        const catMatch = cats.find(c => c.slug === categorySlug);
        setSelectedCategory(catMatch || { name: categorySlug, slug: categorySlug });
        
        const catId = catMatch?._id || catMatch?.id || '';
        const brandData = await fetchAllBrands(catId, '');
        setBrands(brandData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [citySlug, categorySlug]);

  // Fetch brands dynamically when search changes (debounced by 300ms)
  useEffect(() => {
    if (!selectedCategory) return;
    
    let active = true;
    const fetchBrands = async () => {
      try {
        const catId = selectedCategory?._id || selectedCategory?.id || '';
        const brandData = await fetchAllBrands(catId, search);
        if (active) {
          setBrands(brandData);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    const delay = search ? 300 : 0;
    const timer = setTimeout(fetchBrands, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedCategory]);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${selectedCategory?.name} Repair in ${selectedCity?.name || citySlug}`,
    "description": `Professional ${selectedCategory?.name} repair and maintenance services in ${selectedCity?.name || citySlug}. Certified technicians for all major brands.`,
    "areaServed": {
      "@type": "City",
      "name": selectedCity?.name || citySlug
    },
    "provider": {
      "@type": "Organization",
      "name": "Doorstep Hub",
      "url": "https://doorstephub.com"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${selectedCategory?.name} Brand Services`,
      "itemListElement": brands.slice(0, 15).map((brand, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${brand.name || brand} ${selectedCategory?.name} Repair in ${selectedCity?.name || citySlug}`,
          "url": `https://doorstephub.com/${citySlug}/${categorySlug}/${(brand.slug || brand.name || brand).toLowerCase().trim().replace(/\s+/g, '-')}`
        }
      }))
    }
  };

  const filtered = brands.filter(b => (b.name || b).toLowerCase().includes(search.toLowerCase()));


  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#037166]" />
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#037166]">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
            <MapPin size={14} className="text-[#037166]" />
            <span className="text-[#037166]">{selectedCity?.name}</span>
            <span className="text-gray-300">·</span>
            <span>{selectedCategory?.name}</span>
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
        
        <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">Select Appliance Brand</h1>
            <p className="mt-2 text-gray-400 font-medium">Category: {selectedCategory?.name}</p>
          </div>
          <div className="relative w-full lg:w-[420px] lg:flex-shrink-0">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search brand…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-800 outline-none focus:border-[#037166]/40"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => router.push(`/appliances/repair-service/${citySlug}`)}
            className="px-4 py-2 rounded-full border border-[#037166]/20 bg-[#037166]/5 text-[#037166] text-xs font-black uppercase tracking-wider"
          >
            {selectedCategory?.name}
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-3">
            {filtered.map(brand => {
              const bSlug = (brand.slug || brand.name || '').toLowerCase().trim().replace(/\s+/g, '-');
              const logo = (brand.image || brand.logo || brand.brandLogo);
              return (
                <button
                  key={brand.name || brand}
                  onClick={() => {
                    router.push(`/${citySlug}/${categorySlug}/${bSlug}`);
                  }}
                  className="group relative rounded-2xl border-2 border-gray-100 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#037166]/30 hover:shadow-md shadow-sm"
                >
                  <div className="h-28 flex items-center justify-center overflow-hidden p-2">
                    {logo ? (
                      <img
                        src={logo.startsWith('http') ? logo : `https://api.doorstephub.com/${logo}`}
                        alt={brand.name}
                        className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-xl font-black text-gray-200">{(brand.name || brand)?.[0]?.toUpperCase()}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
            <Search size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-500">No brands found</p>
            <p className="text-sm text-gray-400 mt-1">There are no brands available under the {selectedCategory?.name} category currently.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BrandPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#037166]" /></div>}>
      <BrandPageContent />
    </Suspense>
  );
}

