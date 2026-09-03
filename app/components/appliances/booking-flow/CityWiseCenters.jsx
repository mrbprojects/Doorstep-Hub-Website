'use client';

import React, { useState } from 'react';
import { MapPin, Search, Check, ArrowRight } from 'lucide-react';

export function CityWiseCenters({ cities, selectedCity, onSelectCity, searchQuery, onSearchChange, loading }) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Local filtering is now disabled in favor of API search, 
  // but we keep the variable name to minimize changes to the JSX
  const filteredCities = cities;
  const initialCount = 12;
  const visibleCities = isExpanded ? filteredCities : (filteredCities || []).slice(0, initialCount);

  // SEO Schema for City-wise section
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Appliance Repair Service Locations",
    "description": "Professional appliance repair services available in major cities.",
    "itemListElement": (cities || []).slice(0, 20).map((city, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": `Appliance Repair in ${city.name}`,
      "description": `${city.centers} authorized service centers in ${city.name}, ${city.area}`
    }))
  };

  return (
    <section id="centers" className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 bg-white">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="mb-8 sm:mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="font-bold tracking-[0.3em] text-[#037166] text-xs sm:text-sm uppercase">City Wise Doorstep Hub Services</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl text-gray-900 leading-tight">
            Choose Your <span className="text-[#037166]">City</span>
          </h2>
        </div>
        {filteredCities && filteredCities.length > initialCount && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-white font-black text-xs tracking-widest uppercase transition-all duration-300 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:opacity-90 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full hover:shadow-xl shadow-md hover:-translate-y-0.5 transform"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-[2.5rem]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#037166]"></div>
          </div>
        )}

        {/* Responsive Grid: 6 cities per row on desktop (lg/xl) */}
        <div className="grid gap-3.5 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visibleCities && visibleCities.length > 0 ? (
            visibleCities.map((city) => {
              const active = selectedCity?.name === city.name;
              return (
                <button
                  key={city.id || city.name}
                  onClick={() => onSelectCity(city)}
                  className={`group rounded-2xl border overflow-hidden text-left transition-all duration-300 hover:-translate-y-1.5 h-[120px] sm:h-[135px] w-full ${active
                      ? "border-[#037166] bg-white shadow-2xl shadow-[#037166]/20 ring-1 ring-[#037166]"
                      : "border-gray-100 bg-white hover:border-[#037166]/30 shadow-md hover:shadow-xl shadow-gray-200/40"
                    }`}
                >
                  <div className="flex items-stretch h-full">
                    {/* Image Area - Fits card height */}
                    <div className="w-18 sm:w-22 md:w-24 h-full flex-shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-105 p-1.5 flex items-center justify-center">
                      {city.icon ? (
                        <img loading="lazy" decoding="async" src={city.icon} alt={city.name} className="w-full h-full object-contain object-center" />
                      ) : (
                        <div className="w-full h-full bg-[#037166]/5 flex items-center justify-center rounded-xl">
                          <MapPin className="text-[#037166]" size={26} />
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="text-xs sm:text-sm md:text-base font-black text-gray-900 group-hover:text-[#037166] transition-colors leading-tight tracking-tight truncate">
                          {city.name}
                        </h3>
                        <p className="mt-1 text-[10px] sm:text-[11px] font-bold leading-tight text-gray-400 uppercase tracking-tight truncate">
                          {city.area}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-1">
                        {active ? (
                          <span className="inline-flex items-center justify-center rounded-full p-1 bg-[#037166] text-white shadow-md shadow-[#037166]/40">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold whitespace-nowrap transition-all bg-[#037166]/10 text-[#037166] group-hover:bg-[#037166] group-hover:text-white">
                            Book Services
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : !loading && (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl font-bold text-gray-400">No cities found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
