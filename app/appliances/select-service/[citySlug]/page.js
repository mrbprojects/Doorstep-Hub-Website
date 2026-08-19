'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Wrench, Search, Loader2, MapPin, Snowflake, Monitor, Tv, Waves, Droplets, Flame, Microwave, CheckCircle2 } from 'lucide-react';
import { fetchCategories, fetchCities } from '@/lib/api';

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

function CategoryPageContent() {
  const router = useRouter();
  const params = useParams();
  const citySlug = params.citySlug;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cities, cats] = await Promise.all([fetchCities(), fetchCategories()]);
        
        const match = cities.find(c => (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') === citySlug.toLowerCase());
        setSelectedCity(match || { name: citySlug, slug: citySlug });
        
        setCategories(cats.map(c => ({
          ...c,
          image: c.image ? `https://devapis.doorstephub.com/${c.image}` : null,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [citySlug]);

  const filtered = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

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
            <span>Appliance Repair</span>
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
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {selectedCity?.title || "Choose Service Category"}
          </h1>
          <p className="mt-2 text-gray-400 font-medium">
            {selectedCity?.description || "What type of appliance do you need serviced?"}
          </p>
        </div>

        <div className="relative mb-8">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-800 outline-none focus:border-[#037166]/40"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(cat => {
            const Icon = CATEGORY_ICONS[cat.slug] || Wrench;
            return (
              <button
                key={cat.slug}
                onClick={() => router.push(`/appliances/repair-service/${citySlug}/${cat.slug}`)}
                className="group relative rounded-xl border-2 border-gray-100 bg-white overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#037166]/30 hover:shadow-xl shadow-md"
              >
                <div className="h-44 overflow-hidden bg-gray-50">
                  {cat.image ? (
                    <img loading="lazy" decoding="async" src={cat.image} alt={cat.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wrench size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center gap-3 bg-white">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-[#037166]/10 group-hover:text-[#037166]">
                    <Icon size={16} />
                  </div>
                  <p className="text-sm font-bold tracking-tight truncate text-gray-800">{cat.name}</p>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#037166] opacity-90 group-hover:opacity-100">
                    Explore
                    <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#037166]" /></div>}>
      <CategoryPageContent />
    </Suspense>
  );
}

