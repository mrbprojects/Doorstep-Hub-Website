'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { BookingModal } from '@/components/appliances/booking-flow/BookingModal';
import { ChevronLeft, ChevronRight, Wrench, Cpu, MapPin, CheckCircle2, Search, Loader2, Monitor, Tv, Waves, Droplets, Flame, Microwave, Snowflake, Star, Clock, Shield, ArrowRight } from 'lucide-react';
import { fetchCategories, fetchAllBrands, fetchServicesByBrand, fetchAuthorizedServices, fetchCities } from '@/lib/api';
import { resolveBookNowNavigationPath } from '@/lib/applianceRepairSlugs';
import { AmcServiceCoverage } from '@/components/amc/AmcServiceCoverage';

// ─── Step indicator ─────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Category', 'Brand', 'Service'];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        const isDetail = step === 4 && idx === 3; // Detail counts as Service step
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                done || isDetail ? 'bg-[#037166] border-[#037166] text-white' :
                active ? 'bg-white border-[#037166] text-[#037166]' :
                'bg-white border-gray-200 text-gray-300'
              }`}>
                {done || isDetail ? <CheckCircle2 size={18} /> : idx}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest hidden sm:block transition-colors ${
                active || isDetail ? 'text-[#037166]' : done ? 'text-[#037166]/70' : 'text-gray-300'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 mx-4 h-0.5 transition-all duration-300 ${done || (step === 4 && i === 1) ? 'bg-[#037166]' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Category Step ───────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'ac': Snowflake,
  'computer': Monitor,
  'tv': Tv,
  'washing-machine': Waves,
  'refrigerator': Snowflake,
  'geyser': Flame,
  'oven': Microwave,
  'water-purifier': Droplets,
  'microwave': Microwave
};

function CategoryStep({ categories, selected, onSelect, loading }) {
  const [search, setSearch] = useState('');
  const filtered = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-44 rounded-3xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      <div className="relative mb-6">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-800 outline-none focus:border-[#037166]/40 placeholder-gray-300"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(cat => {
          const active = selected?.slug === cat.slug;
          const Icon = CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS[cat.name?.toLowerCase().replace(' repair', '').replace(/\s+/g, '-')] || Wrench;
          
          return (
            <button
              key={cat.slug}
              onClick={() => onSelect(cat)}
              className={`group relative rounded-3xl border-2 overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 ${
                active
                  ? 'border-[#037166] shadow-xl shadow-[#037166]/15 ring-1 ring-[#037166]'
                  : 'border-gray-100 bg-white hover:border-[#037166]/30 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="h-44 overflow-hidden bg-gray-50">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"  width={500} height={300} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench size={32} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center gap-3 bg-white">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-[#037166]/10 text-[#037166]' : 'bg-gray-50 text-gray-400 group-hover:bg-[#037166]/5 group-hover:text-[#037166]'}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold tracking-tight truncate ${active ? 'text-[#037166]' : 'text-gray-800'}`}>{cat.name}</p>
                </div>
                {active && <CheckCircle2 size={14} className="text-[#037166] flex-shrink-0" />}
              </div>
              {active && <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#037166] to-[#04a99d]" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 font-bold">No categories found.</div>
        )}
      </div>
    </div>
  );
}

// ─── Brand Step ──────────────────────────────────────────────────────────────
function BrandStep({ brands, selected, onSelect, loading }) {
  const [search, setSearch] = useState('');
  const filtered = brands.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-3">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      <div className="relative mb-6">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search brand…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-800 outline-none focus:border-[#037166]/40 placeholder-gray-300"
        />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-3">
        {filtered.map(brand => {
          const active = selected?.name === brand.name || selected === brand.name;
          return (
            <button
              key={brand.name || brand}
              onClick={() => onSelect(brand)}
              className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                active
                  ? 'border-[#037166] shadow-lg shadow-[#037166]/10 ring-1 ring-[#037166]'
                  : 'border-gray-100 bg-white hover:border-[#037166]/30 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="h-24 flex items-center justify-center overflow-hidden p-3">
                {(brand.image || brand.logo || brand.brandLogo) ? (
                  <Image
                    src={(brand.image || brand.logo || brand.brandLogo).startsWith('http') 
                      ? (brand.image || brand.logo || brand.brandLogo) 
                      : `https://api.doorstephub.com/${brand.image || brand.logo || brand.brandLogo}`}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                   width={500} height={300} />
                ) : (
                  <div className={`text-xl font-black ${active ? 'text-[#037166]' : 'text-gray-200'}`}>
                    {(brand.name || brand)?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {active && <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#037166] to-[#04a99d]" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 font-bold">No brands found.</div>
        )}
      </div>
    </div>
  );
}

// ─── Service Step ────────────────────────────────────────────────────────────
function ServiceStep({ services, onSelect, loading }) {
  if (loading) return (
    <div className="grid gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-36 rounded-3xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );

  if (services.length === 0) return (
    <div className="py-20 text-center">
      <Cpu size={48} className="text-gray-200 mx-auto mb-4" />
      <p className="text-xl font-bold text-gray-400">No services available for this selection.</p>
      <p className="text-sm text-gray-300 mt-1">Try choosing a different brand or category.</p>
    </div>
  );

  return (
    <div className="grid gap-4">
      {services.map(service => (
        <button
          key={service._id || service.serviceName}
          onClick={() => onSelect(service)}
          className="group w-full rounded-3xl border-2 border-gray-100 bg-white overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#037166]/30 hover:shadow-2xl shadow-md h-[140px]"
        >
          <div className="flex h-full">
            <div className="w-44 flex-shrink-0 h-full bg-gray-50 overflow-hidden">
              {service.image ? (
                <Image
                  src={`https://api.doorstephub.com/${service.image}`}
                  alt={service.serviceName}
                  className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                 width={500} height={300} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wrench size={36} className="text-gray-200" />
                </div>
              )}
            </div>
            <div className="flex-1 p-6 flex flex-col justify-center border-l border-gray-50">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight leading-tight">
                  {service.serviceName}
                </h3>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#037166] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
              <p className="mt-2 text-xs text-gray-400 font-medium line-clamp-2">
                Professional doorstep {service.serviceName?.toLowerCase()} with expert technician visit and transparent pricing.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#037166]/5 text-[#037166] text-[9px] font-black uppercase tracking-widest">
                  {service.isAuthorized ? 'Authorised Service' : 'Premium Service'}
                </span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#037166]/20" />)}
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Service Detail Step ─────────────────────────────────────────────────────
function ServiceDetailStep({ service, category, onBook, loading }) {
  if (loading || !service) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
      <div className="h-40 rounded-3xl bg-gray-100 animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50">
        <div className="grid md:grid-cols-2">
          <div className="h-64 md:h-auto bg-gray-50 overflow-hidden flex items-center justify-center p-8">
            {service.image ? (
              <Image src={`https://api.doorstephub.com/${service.image}`} alt={service.serviceName} className="max-h-full max-w-full object-contain"  width={500} height={300} />
            ) : (
              <Wrench size={64} className="text-gray-200" />
            )}
          </div>
          <div className="p-8 lg:p-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#037166]/10 text-[#037166] text-[10px] font-black uppercase tracking-widest">
                {service.isAuthorized ? 'Authorized Center' : 'Premium Quality'}
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-black text-gray-900">4.9</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4">{service.serviceName}</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              {service.description || `Professional ${service.serviceName?.toLowerCase()} at your doorstep. We provide high-quality repair and maintenance services with genuine spare parts and expert technicians.`}
            </p>

            <AmcServiceCoverage
              serviceId={service._id || service.id}
              categoryId={category?._id || category?.id || service.bookingCategoryId}
              subcategoryId={service.subcategoryId || service.subCategoryId || service.bookingSubcategoryId}
              className="mb-6"
            />

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Shield size={20} className="text-[#037166]" />
                <span className="text-xs font-bold text-gray-700">90 Days Warranty</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Clock size={20} className="text-[#037166]" />
                <span className="text-xs font-bold text-gray-700">60 Min Arrival</span>
              </div>
            </div>

            <button
              onClick={onBook}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-black text-lg shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Book Now
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Features list */}
        <div className="bg-gray-50/50 p-8 border-t border-gray-100 grid sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
             <CheckCircle2 size={18} className="text-[#037166]" />
             <span className="text-sm font-bold text-gray-600">No Hidden Costs</span>
          </div>
          <div className="flex items-center gap-3">
             <CheckCircle2 size={18} className="text-[#037166]" />
             <span className="text-sm font-bold text-gray-600">Genuine Spares</span>
          </div>
          <div className="flex items-center gap-3">
             <CheckCircle2 size={18} className="text-[#037166]" />
             <span className="text-sm font-bold text-gray-600">Expert Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Content ───────────────────────────────────────────────────────
function SelectServiceCatchAllContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slugArray = params?.slug || [];
  
  const citySlug = slugArray[0];
  const categorySlug = slugArray[1];
  const brandSlug = slugArray[2];
  const serviceSlug = slugArray[3];

  const cityNameFromQuery = searchParams.get('city');

  // Determine current step based on URL slugs
  const step = slugArray.length === 4 ? 4 : slugArray.length === 3 ? 3 : slugArray.length === 2 ? 2 : 1;

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [catLoading, setCatLoading] = useState(true);
  const [brandLoading, setBrandLoading] = useState(false);
  const [svcLoading, setSvcLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState(null);
  const [cityLoading, setCityLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);

  // Load city data + categories on mount
  useEffect(() => {
    (async () => {
      try {
        setCityLoading(true);
        setCatLoading(true);

        const [citiesData, catData] = await Promise.allSettled([
          fetchCities(),
          fetchCategories(),
        ]);

        // Resolve city
        if (citiesData.status === 'fulfilled') {
          const match = citiesData.value.find(c => {
            const apiCitySlug = (c.slug || c.name || '').toLowerCase().trim().replace(/\s+/g, '-');
            return apiCitySlug === citySlug?.toLowerCase().trim();
          });
          
          if (match) {
            setSelectedCity(match);
          } else if (cityNameFromQuery) {
             setSelectedCity({ name: cityNameFromQuery, slug: citySlug });
          } else {
            router.push('/appliances');
            return;
          }
        }

        // Set categories and find selected one
        if (catData.status === 'fulfilled') {
          const mappedCats = catData.value.map(c => ({
            ...c,
            image: c.image ? `https://api.doorstephub.com/${c.image}` : null,
          }));
          setCategories(mappedCats);

          if (categorySlug) {
            const match = mappedCats.find(c => c.slug === categorySlug);
            if (match) setSelectedCategory(match);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCityLoading(false);
        setCatLoading(false);
      }
    })();
  }, [citySlug, categorySlug, cityNameFromQuery, router]);

  // Load brands when on step 2, 3 or 4
  useEffect(() => {
    if (step < 2) return;
    (async () => {
      try {
        setBrandLoading(true);
        const data = await fetchAllBrands();
        setBrands(data);

        if (brandSlug) {
          const match = data.find(b => {
             const bSlug = (b.slug || b.name || '').toLowerCase().trim().replace(/\s+/g, '-');
             return bSlug === brandSlug.toLowerCase().trim();
          });
          if (match) setSelectedBrand(match);
        }
      } catch (e) { console.error(e); }
      finally { setBrandLoading(false); }
    })();
  }, [step, brandSlug]);

  // Load services when on step 3 or 4
  useEffect(() => {
    if (step < 3 || !selectedBrand) return;
    (async () => {
      try {
        setSvcLoading(true);
        const brandName = selectedBrand?.name || selectedBrand;

        const [apiResult, authResult] = await Promise.allSettled([
          fetchServicesByBrand(brandName),
          fetchAuthorizedServices(),
        ]);

        let apiServices = apiResult.status === 'fulfilled' ? apiResult.value : [];
        let authServices = [];

        if (authResult.status === 'fulfilled' && Array.isArray(authResult.value)) {
          authServices = authResult.value
            .filter(s => {
              const brandMatch = s.brandName?.toLowerCase().trim() === brandName?.toLowerCase().trim();
              const catMatch = !selectedCategory?.name || (
                Array.isArray(s.categoryName)
                  ? s.categoryName.some(c => c?.toLowerCase() === selectedCategory.name?.toLowerCase())
                  : s.categoryName?.toLowerCase() === selectedCategory?.name?.toLowerCase()
              );
              return brandMatch && catMatch;
            })
            .map(s => ({
              _id: s._id,
              serviceName: s.name,
              image: s.mainImage,
              slug: s.slug,
              brandId: s.brandId,
              categoryId: Array.isArray(s.categoryId) ? s.categoryId[0] : s.categoryId,
              isAuthorized: true,
              description: s.seoDescription || s.description,
            }));
        }

        const combined = [...apiServices, ...authServices];
        const unique = Array.from(new Map(combined.map(i => [i.serviceName, i])).values());
        setServices(unique);

        if (serviceSlug) {
          const match = unique.find(s => {
             const sSlug = s.slug || s.serviceName?.toLowerCase().replace(/\s+/g, '-');
             return sSlug === serviceSlug.toLowerCase().trim();
          });
          if (match) setSelectedService(match);
        }
      } catch (e) { console.error(e); setServices([]); }
      finally { setSvcLoading(false); }
    })();
  }, [step, selectedBrand, selectedCategory, serviceSlug]);

  const handleSelectCategory = (cat) => {
    router.push(`/appliances/repair-service/${citySlug}/${cat.slug}`);
  };

  const handleSelectBrand = (brand) => {
    const bSlug = (brand.slug || brand.name || '').toLowerCase().trim().replace(/\s+/g, '-');
    router.push(`/appliances/repair-service/${citySlug}/${categorySlug}/${bSlug}`);
  };

  const handleSelectService = (service) => {
    const sSlug = service.slug || service.serviceName?.toLowerCase().replace(/\s+/g, '-');
    router.push(resolveBookNowNavigationPath(sSlug, citySlug));
  };

  const handleBookNow = () => {
     setModalOpen(true);
  };

  const stepTitles = [
    { label: 'Step 1', title: 'Choose Service Category', sub: 'What type of appliance do you need serviced?' },
    { label: 'Step 2', title: 'Select Appliance Brand', sub: `Category: ${selectedCategory?.name || '—'}` },
    { label: 'Step 3', title: 'Available Services', sub: `${selectedCategory?.name || ''} · ${selectedBrand?.name || selectedBrand || '—'}` },
    { label: 'Step 4', title: 'Service Details', sub: 'Review the details and book your service appointment.' }
  ];

  const current = stepTitles[step - 1];

  if (cityLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#037166]" />
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Top header bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              // Always use browser back for true step-by-step navigation
              router.back();
            }}
            className="w-10 h-10 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-500 hover:border-[#037166]/30 hover:text-[#037166] transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
            <MapPin size={14} className="text-[#037166]" />
            <span className="text-[#037166]">{selectedCity?.name}</span>
            <span className="text-gray-300">·</span>
            <span>Appliance Repair</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
        {/* Step bar - detail counts as step 3 visually for consistency */}
        <StepBar step={step === 4 ? 3 : step} />

        {/* Step title */}
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#037166] mb-2">{current.label}</p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">{current.title}</h1>
          <p className="mt-2 text-gray-400 font-medium">{current.sub}</p>
        </div>

        {/* Breadcrumb trail pills */}
        {step >= 2 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => router.push(`/appliances/repair-service/${citySlug}`)}
              className="px-4 py-2 rounded-full border border-[#037166]/20 bg-[#037166]/5 text-[#037166] text-xs font-black uppercase tracking-wider hover:bg-[#037166]/10 transition-all"
            >
              {selectedCategory?.name || categorySlug}
            </button>
            {step >= 3 && (
              <button
                onClick={() => router.push(`/appliances/repair-service/${citySlug}/${categorySlug}`)}
                className="px-4 py-2 rounded-full border border-[#037166]/20 bg-[#037166]/5 text-[#037166] text-xs font-black uppercase tracking-wider hover:bg-[#037166]/10 transition-all"
              >
                {selectedBrand?.name || selectedBrand || brandSlug}
              </button>
            )}
            {step >= 4 && (
              <button
                className="px-4 py-2 rounded-full border border-[#037166]/20 bg-[#037166]/10 text-[#037166] text-xs font-black uppercase tracking-wider"
              >
                {selectedService?.serviceName || serviceSlug}
              </button>
            )}
          </div>
        )}

        {/* Step content */}
        <div>
          {step === 1 && (
            <CategoryStep
              categories={categories}
              selected={selectedCategory}
              onSelect={handleSelectCategory}
              loading={catLoading}
            />
          )}
          {step === 2 && (
            <BrandStep
              brands={brands}
              selected={selectedBrand}
              onSelect={handleSelectBrand}
              loading={brandLoading}
            />
          )}
          {step === 3 && (
            <ServiceStep
              services={services}
              onSelect={handleSelectService}
              loading={svcLoading}
            />
          )}
          {step === 4 && (
            <ServiceDetailStep
               service={selectedService}
               category={selectedCategory}
               onBook={handleBookNow}
               loading={svcLoading}
            />
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedCity={selectedCity}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand?.name || selectedBrand}
        selectedService={selectedService}
      />
    </main>
  );
}

export default function SelectServiceCatchAllPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#037166]" /></div>}>
      <SelectServiceCatchAllContent />
    </Suspense>
  );
}


