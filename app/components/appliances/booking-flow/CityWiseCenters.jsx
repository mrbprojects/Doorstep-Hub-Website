'use client';

import React, { useState } from 'react';
import { MapPin, Search, Check, ArrowRight } from 'lucide-react';

export function CityWiseCenters({ cities, selectedCity, onSelectCity, searchQuery, onSearchChange, loading }) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Local filtering is now disabled in favor of API search, 
  // but we keep the variable name to minimize changes to the JSX
  const filteredCities = cities;
  const visibleCities = isExpanded ? filteredCities : (filteredCities || []).slice(0, 8);

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
    <section id="centers" className="relative max-w-[1400px] mx-auto px-6 lg:px-8 py-20 bg-white">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="font-bold  tracking-[0.3em] text-[#037166]">City Wise Doorstep Hub Services</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl text-gray-900 leading-tight">
            Choose Your <span className="text-[#037166]">City</span>
          </h2>
        </div>
        {filteredCities && filteredCities.length > 8 && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-white font-black text-xs tracking-widest uppercase transition-all duration-300 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:opacity-90 px-8 py-3.5 rounded-full hover:shadow-xl shadow-md hover:-translate-y-0.5 transform"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-[2.5rem]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#037166]"></div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCities && visibleCities.length > 0 ? (
            visibleCities.map((city) => {
              const active = selectedCity?.name === city.name;
              return (
                <button
                  key={city.id || city.name}
                  onClick={() => onSelectCity(city)}
                  className={`group rounded-3xl border overflow-hidden text-left transition-all duration-500 hover:-translate-y-2 h-[130px] sm:h-[150px] w-full ${active
                      ? "border-[#037166] bg-white shadow-2xl shadow-[#037166]/20 ring-1 ring-[#037166]"
                      : "border-gray-100 bg-white hover:border-[#037166]/30 shadow-xl shadow-gray-200/40"
                    }`}
                >
                  <div className="flex items-stretch h-full">
                    {/* Image Area - Fits card height */}
                    <div className={`w-32 sm:w-40 h-full flex-shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-105`}>
                      {city.icon ? (
                        <img loading="lazy" decoding="async" src={city.icon} alt={city.name} className="w-full h-full object-contain object-center" />
                      ) : (
                        <div className="w-full h-full bg-[#037166]/5 flex items-center justify-center">
                          <MapPin className="text-[#037166]" size={32} />
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xl font-black text-[#037166] leading-tight tracking-tight">{city.name}</h3>
                        </div>
                        <p className="mt-2 text-sm font-bold leading-tight text-gray-500 uppercase tracking-tight line-clamp-1">
                          {city.area}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-[10px] sm:text-xs font-black text-[#037166] min-w-0">
                          <span className="line-clamp-1">{city.centers} Authorised Centers</span>
                        </p>
                        {active ? (
                          <span className="inline-flex items-center justify-center rounded-full p-1.5 bg-[#037166] text-white shadow-md shadow-[#037166]/40">
                            <Check className="w-6 h-6" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all bg-[#037166]/10 text-[#037166] group-hover:bg-[#037166] group-hover:text-white">
                            Book Services
                            <ArrowRight className="w-3 h-3" />
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
