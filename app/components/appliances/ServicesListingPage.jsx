'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, DollarSign, Filter, X, Zap, RotateCcw, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';
import DOMPurify from 'dompurify';

export function ServicesListingPage({ category, subCategory, subCategoryId, childCategoryId, slug, onBack }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('services');
  const [filterOpen, setFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('rating')) || 0);
  const [services, setServices] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location, detectWithGPS } = useLocationContext();

  const [allCategories, setAllCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorySubcats, setCategorySubcats] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcats, setLoadingSubcats] = useState({});
  const fetchedCatsRef = useRef(new Set());
  const autoExpandedForRef = useRef(null);

  const [pageTitle, setPageTitle] = useState(subCategory || '');
  const [categoryName, setCategoryName] = useState(category || '');
  const [isWrongUrl, setIsWrongUrl] = useState(false);

  const renderServiceDescription = (description) => {
    if (!description) return null;
    return (
      <div
        className="service-listing-rich-text text-white/60 text-[11px] mb-4 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
      />
    );
  };

  useEffect(() => {
    if (subCategory) setPageTitle(subCategory);
    if (category) setCategoryName(category);
  }, [category, subCategory]);

  const handleRatingChange = (rating) => {
    const newRating = rating === minRating ? 0 : rating;
    setMinRating(newRating);
    const params = new URLSearchParams(searchParams.toString());
    if (newRating > 0) params.set('rating', newRating.toString());
    else params.delete('rating');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    setMinRating(0);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('rating');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchServices = async () => {
      if ((!subCategoryId && !childCategoryId && !slug) || !location?.lat || !location?.lng) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let resolvedSubcategoryId = subCategoryId;
        if (slug && !subCategoryId && !childCategoryId && category) {
          const subCatRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: category })
          });
          const subCatData = await subCatRes.json();
          if (subCatData.success && subCatData.data) {
            const matchedSubCat = subCatData.data.find(s => s.slug === slug || s.name?.toLowerCase().replace(/\s+/g, '-') === slug);
            if (matchedSubCat) {
              resolvedSubcategoryId = matchedSubCat._id;
              setPageTitle(matchedSubCat.name);
            } else setIsWrongUrl(true);
          } else setIsWrongUrl(true);
        }

        let apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/services_by_subcategory`;
        let body = { lattitude: location.lat, longitude: location.lng };
        if (resolvedSubcategoryId) body.subcategoryId = resolvedSubcategoryId;
        else if (childCategoryId) {
          apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/services_by_childcategory`;
          body.childcategoryId = childCategoryId;
        }

        if (minRating > 0) body.minRating = minRating;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.success) {
          setServices(data.dhubServices || []);
          setCenters(data.nearByServiceCenters || []);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [subCategoryId, childCategoryId, slug, category, location?.lat, location?.lng, minRating]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      if (!location?.lat || !location?.lng) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lattitude: location.lat, longitude: location.lng })
        });
        const data = await response.json();
        if (data.success && data.data) setAllCategories(data.data);
      } catch (e) {}
    };
    fetchAllCategories();
  }, [location?.lat, location?.lng]);

  const fetchSubcategories = async (catId, catSlug) => {
    if (fetchedCatsRef.current.has(catId) || categorySubcats[catId]) return;
    fetchedCatsRef.current.add(catId);
    setLoadingSubcats(prev => ({ ...prev, [catId]: true }));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: catSlug })
      });
      const data = await response.json();
      if (data.success) setCategorySubcats(prev => ({ ...prev, [catId]: data.data }));
    } catch (e) {} finally {
      setLoadingSubcats(prev => ({ ...prev, [catId]: false }));
    }
  };

  useEffect(() => {
    if (allCategories.length > 0 && category) {
      const activeCat = allCategories.find(c => c.slug === category || c.name === category);
      if (activeCat && autoExpandedForRef.current !== activeCat._id) {
        autoExpandedForRef.current = activeCat._id;
        setExpandedCategory(activeCat._id);
        fetchSubcategories(activeCat._id, activeCat.slug);
      }
    }
  }, [allCategories, category]);

  const handleCategoryExpand = (catId) => {
    if (expandedCategory === catId) {
      setExpandedCategory(null);
      return;
    }
    const cat = allCategories.find(c => c._id === catId);
    setExpandedCategory(catId);
    if (cat) fetchSubcategories(catId, cat.slug);
  };

  const filteredServices = services.filter(s => minRating === 0 || parseFloat(s.rating || 0) >= minRating);
  const filteredCenters = centers.filter(c => minRating === 0 || parseFloat(c.rating || 0) >= minRating);

  if (isWrongUrl) {
    return (
      <div className="min-h-screen bg-[#0A0F0E] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Service Not Found</h2>
          <button onClick={() => router.push('/appliance-repair-services')} className="px-6 py-2 bg-[#037166] text-white rounded-lg">Browse All Services</button>
        </motion.div>
      </div>
    );
  }

  const schemaData = activeTab === 'services' && filteredServices.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${pageTitle} Services in ${location?.city || 'Your Area'}`,
    "description": `List of professional ${pageTitle} repair and maintenance services.`,
    "itemListElement": filteredServices.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": service.name,
      "url": typeof window !== 'undefined' ? `${window.location.origin}/${service.slug || service._id}` : ""
    }))
  } : activeTab === 'centers' && filteredCenters.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${pageTitle} Service Centers in ${location?.city || 'Your Area'}`,
    "description": `Nearby authorized ${pageTitle} service centers.`,
    "itemListElement": filteredCenters.map((center, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": center.business_name || center.name,
      "url": typeof window !== 'undefined' ? `${window.location.origin}/service-list/${center.slug || center._id}` : ""
    }))
  } : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-20">
      {schemaData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />}
      
      <div className="z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{pageTitle}</h1>
          <p className="text-white/80">{categoryName} • Professional Services</p>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('services')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'services' ? 'text-white border-b-2 border-white' : 'text-white/70'}`}>All Services</button>
            <button onClick={() => setActiveTab('centers')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'centers' ? 'text-white border-b-2 border-white' : 'text-white/70'}`}>Nearby Centers</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 flex gap-8">
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-white/10">
            <h4 className="text-xl font-bold text-white mb-6">Filters</h4>
            <div className="space-y-2">
              {allCategories.map(cat => (
                <div key={cat._id}>
                  <button onClick={() => handleCategoryExpand(cat._id)} className="w-full flex justify-between items-center px-3 py-2 text-white/70 hover:text-white">
                    <span>{cat.name}</span>
                    {expandedCategory === cat._id ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                  </button>
                  {expandedCategory === cat._id && categorySubcats[cat._id] && (
                    <div className="pl-4 space-y-1">
                      {categorySubcats[cat._id].map(sub => (
                        <button key={sub._id} onClick={() => router.push(`/${sub.slug || sub._id}`)} className="w-full text-left px-3 py-1 text-sm text-white/50 hover:text-white">{sub.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeTab === 'services' ? (
            filteredServices.map(service => (
              <div key={service._id} onClick={() => router.push(`/${service.slug || service._id}`)} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:border-[#037166]">
                <img src={service.mainImage ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400'} alt={service.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h4 className="text-white font-bold mb-2 group-hover:text-[#04a99d]">{service.name}</h4>
                  <div className="flex items-center gap-1 text-[#04a99d]"><Star className="w-4 h-4 fill-current"/><span>{service.rating}</span></div>
                  <button className="w-full mt-4 py-2 bg-[#037166] text-white rounded-lg">Book Now</button>
                </div>
              </div>
            ))
          ) : (
            filteredCenters.map(center => (
              <div key={center._id} onClick={() => router.push(`/service-list/${center.slug || center._id}`)} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:border-[#037166]">
                <img src={center.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${center.image}` : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'} alt={center.business_name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h4 className="text-white font-bold mb-2 group-hover:text-[#04a99d]">{center.business_name}</h4>
                  <p className="text-white/60 text-sm mb-4"><MapPin className="w-4 h-4 inline mr-1"/>{center.address}</p>
                  <button className="w-full py-2 bg-[#037166] text-white rounded-lg">Visit Center</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
