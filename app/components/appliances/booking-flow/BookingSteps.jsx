import React from 'react';
import { ChevronRight, Wrench } from 'lucide-react';
import { fetchServicesByBrand, fetchAuthorizedServices, fetchNearestAuthorizedServices } from '@/lib/api';

export function BookingSteps({ 
  selectedCity, 
  categories,
  brands,
  selectedCategory, 
  selectedBrand, 
  onSelectCategory, 
  onSelectBrand, 
  onSelectService 
}) {
  const [services, setServices] = React.useState([]);
  const [loadingServices, setLoadingServices] = React.useState(false);
  const [showAllBrands, setShowAllBrands] = React.useState(false);
  const [selectedServiceCard, setSelectedServiceCard] = React.useState(null);

  const displayedBrands = showAllBrands ? brands : brands.slice(0, 4);

  React.useEffect(() => {
    async function loadServices() {
      if (!selectedBrand) return;
      
      try {
        setLoadingServices(true);
        const cityLat = selectedCity?.lat || selectedCity?.lattitude;
        const cityLng = selectedCity?.lng || selectedCity?.longitude;
        
        console.log("Fetching services for brand:", selectedBrand, "at location:", cityLat, cityLng);
        
        const [apiResult, authResult] = await Promise.allSettled([
          fetchServicesByBrand(selectedBrand),
          cityLat && cityLng 
            ? fetchNearestAuthorizedServices(cityLat, cityLng)
            : fetchAuthorizedServices()
        ]);

        let apiServices = [];
        if (apiResult.status === 'fulfilled') {
          apiServices = apiResult.value;
        }

        let brandAuthorized = [];
        if (authResult.status === 'fulfilled' && Array.isArray(authResult.value)) {
          brandAuthorized = authResult.value
            .filter(s => {
              const selectedBrandNorm = selectedBrand?.toLowerCase().trim();
              const selectedCategoryNorm = selectedCategory?.name?.toLowerCase().trim();
              const selectedCityNorm = selectedCity?.name?.toLowerCase().trim();

              const brandMatch = s.brandName?.toLowerCase().trim() === selectedBrandNorm;

              const categoryMatch = !selectedCategoryNorm || (
                Array.isArray(s.categoryName)
                  ? s.categoryName.some(cat => cat?.toLowerCase().trim() === selectedCategoryNorm)
                  : s.categoryName?.toLowerCase().trim() === selectedCategoryNorm
              );

              const cityMatch = !selectedCityNorm || (
                Array.isArray(s.cityName)
                  ? s.cityName.some(city => city?.toLowerCase().trim() === selectedCityNorm)
                  : s.cityName?.toLowerCase().trim() === selectedCityNorm
              );

              return brandMatch && categoryMatch && cityMatch;
            })
            .map(s => ({
              _id: s._id,
              serviceName: s.name,
              image: s.mainImage,
              slug: s.slug,
              brandId: s.brandId,
              categoryId: Array.isArray(s.categoryId) ? s.categoryId[0] : s.categoryId,
              isAuthorized: true,
              description: s.seoDescription || s.description
            }));
          console.log(`Found ${brandAuthorized.length} authorized services for ${selectedBrand} in ${selectedCategory?.name}`);
        } else if (authResult.status === 'rejected') {
          console.error("Authorized services fetch failed:", authResult.reason);
        }

        // Fallback: if no exact brand-match authorized services, still show
        // category+city-matched authorized services so the section isn't empty.
        if (brandAuthorized.length === 0 && authResult.status === 'fulfilled' && Array.isArray(authResult.value)) {
          const selectedCategoryNorm = selectedCategory?.name?.toLowerCase().trim();
          const selectedCityNorm = selectedCity?.name?.toLowerCase().trim();

          brandAuthorized = authResult.value
            .filter(s => {
              const categoryMatch = !selectedCategoryNorm || (
                Array.isArray(s.categoryName)
                  ? s.categoryName.some(cat => cat?.toLowerCase().trim() === selectedCategoryNorm)
                  : s.categoryName?.toLowerCase().trim() === selectedCategoryNorm
              );

              const cityMatch = !selectedCityNorm || (
                Array.isArray(s.cityName)
                  ? s.cityName.some(city => city?.toLowerCase().trim() === selectedCityNorm)
                  : s.cityName?.toLowerCase().trim() === selectedCityNorm
              );

              return categoryMatch && cityMatch;
            })
            .map(s => ({
              _id: s._id,
              serviceName: s.name,
              image: s.mainImage,
              slug: s.slug,
              brandId: s.brandId,
              categoryId: Array.isArray(s.categoryId) ? s.categoryId[0] : s.categoryId,
              isAuthorized: true,
              description: s.seoDescription || s.description
            }));
        }

        // Combine and remove duplicates based on name
        // Keep authorized services as the final winner in duplicates
        // so required booking IDs (brandId/categoryId) are preserved.
        const combined = [...apiServices, ...brandAuthorized];
        const unique = Array.from(new Map(combined.map(item => [item.serviceName, item])).values());
        
        setServices(unique);
      } catch (error) {
        console.error("Unexpected error in loadServices:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [selectedBrand, selectedCategory, selectedCity]);

  return (
    <section id="booking" className="relative max-w-[1400px] mx-auto px-6 lg:px-8 pb-24">
      <div className="rounded-[3rem] bg-white border border-gray-100 p-6 shadow-2xl shadow-gray-200/50 lg:p-12">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[2.5rem] bg-gray-50 border border-gray-100 p-8 shadow-inner">
            <p className="font-black uppercase tracking-[0.3em] text-[#037166] text-xs">Step 2</p>
            <h2 className="mt-4 text-3xl font-black text-gray-900 tracking-tight leading-tight">Choose Service Category</h2>
            <p className="mt-4 leading-relaxed text-gray-500 font-medium text-sm">Select the appliance category to see available brands and specialized service options.</p>

            <div className="mt-10 grid gap-4">
              {categories.map((category) => {
                const active = selectedCategory?.slug === category.slug;
                return (
                  <button 
                    key={category.slug} 
                    onClick={() => onSelectCategory(category)} 
                    className={`flex items-center justify-between rounded-2xl border-2 h-[90px] overflow-hidden text-left transition-all duration-300 group ${
                      active 
                        ? "border-[#037166] bg-white shadow-xl shadow-[#037166]/10 text-[#037166]" 
                        : "border-gray-50 bg-white text-gray-600 hover:border-[#037166]/30 hover:shadow-lg hover:shadow-gray-200/40"
                    }`}
                  >
                    <div className="flex items-center h-full gap-6">
                      <div className="w-28 h-full bg-white overflow-hidden flex-shrink-0 border-r border-gray-100/50">
                        {category.image ? (
                          <img loading="lazy" decoding="async" 
                            src={category.image} 
                            alt={category.name} 
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Wrench size={32} />
                          </div>
                        )}
                      </div>
                      <span className="font-black text-base uppercase tracking-wider">
                        {category.name}
                      </span>
                    </div>
                    <div className="pr-8">
                      <ChevronRight size={20} className={`transition-transform duration-300 ${active ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="py-2">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center mb-10">
              <div>
                <p className="font-black uppercase tracking-[0.3em] text-[#037166] text-xs">Step 3</p>
                <h2 className="mt-2 text-4xl font-black text-gray-900 tracking-tight">Select Appliance Brand</h2>
              </div>
              <div className="rounded-2xl bg-[#037166]/5 border border-[#037166]/10 px-5 py-2.5 text-xs font-black text-[#037166] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#037166] animate-pulse" />
                {selectedCity?.name} / {selectedCategory?.name}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              {displayedBrands.map((brand) => {
                const active = selectedBrand === brand;
                return (
                  <button 
                    key={brand} 
                    onClick={() => onSelectBrand(brand)} 
                    className={`rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-all border-2 ${
                      active 
                        ? "bg-[#037166] text-white border-[#037166] shadow-xl shadow-[#037166]/30" 
                        : "bg-white text-gray-500 border-gray-100 hover:border-[#037166]/30 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
              
              {!showAllBrands && brands.length > 4 && (
                <button 
                  onClick={() => setShowAllBrands(true)}
                  className="rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-all border-2 border-dashed border-[#037166]/30 text-[#037166] hover:bg-[#037166]/5 hover:border-[#037166]"
                >
                  + {brands.length - 4} More
                </button>
              )}
            </div>

            <div className="mt-16 min-h-[400px] relative">
              {loadingServices && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem]">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#037166]"></div>
                </div>
              )}

              <div className="mb-10">
                <p className="font-black uppercase tracking-[0.3em] text-[#037166] text-xs">Step 4</p>
                <h2 className="mt-2 text-4xl font-black text-gray-900 tracking-tight">Available Services</h2>
              </div>

              <div className="mt-6 grid gap-6 grid-cols-1">
                {services.length > 0 ? (
                  services.map((service) => {
                    const isSelected = selectedServiceCard === (service._id || service.serviceName);
                    return (
                    <button
                      key={service._id || service.serviceName}
                      onClick={() => {
                        setSelectedServiceCard(service._id || service.serviceName);
                        onSelectService(service);
                      }}
                      className={`group w-full rounded-[2rem] border-2 bg-white overflow-hidden text-left transition-all duration-500 h-[170px] ${
                        isSelected
                          ? "border-[#037166] shadow-xl shadow-[#037166]/15"
                          : "border-gray-50 hover:-translate-y-1 hover:border-[#037166]/30 hover:shadow-2xl hover:shadow-gray-200/50"
                      }`}
                    >
                      <div className="flex h-full">
                        <div className="w-[42%] min-w-[220px] h-full bg-white flex-shrink-0 relative overflow-hidden">
                          {service.image ? (
                            <img loading="lazy" decoding="async" 
                              src={service.isAuthorized ? `https://devapis.doorstephub.com/${service.image}` : `https://devapis.doorstephub.com/${service.image}`} 
                              alt={service.serviceName} 
                              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Wrench size={40} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 p-6 md:p-7 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="text-xl font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight leading-none">
                              {service.serviceName}
                            </h3>
                            <ChevronRight className="text-gray-300 group-hover:text-[#037166] transition-all duration-300 transform group-hover:translate-x-1" size={18} />
                          </div>
                          <p className="text-xs leading-relaxed text-gray-500 font-medium line-clamp-2">
                            Professional doorstep {service.serviceName.toLowerCase()} with expert technician visit and transparent pricing.
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#037166]/5 text-[#037166] text-[8px] font-black uppercase tracking-widest">
                              {service.isAuthorized ? "Authorized Service" : "Premium Service"}
                            </span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#037166]/20" />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  )})
                ) : !loadingServices && (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-xl font-bold text-gray-400">No services available for this brand.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
