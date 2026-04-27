'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Star,
  Award,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Smartphone,
  X,
  Download,
  TicketCheck
} from 'lucide-react';

// Default theme settings
const defaultTheme = {
  accentOpacity: 0.15,
  glowIntensity: 0.3,
  description: 'Professional repair and maintenance services by certified technicians',
  stats: [
    { label: 'Average Rating', value: '4.9', icon: Star },
    { label: 'Completed Jobs', value: '10K+', icon: CheckCircle },
    { label: 'Expert Technicians', value: '200+', icon: Award },
  ],
};

// Popular subcategories (first 3 are featured)
const featuredCount = 3;

// Skeleton Loader Component
function CategorySkeleton() {
  return (
    <div className="relative h-full p-8 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

      {/* Icon Skeleton */}
      <div className="w-16 h-16 rounded-xl bg-white/10 mb-6 animate-pulse" />

      {/* Text Skeletons */}
      <div className="space-y-3">
        <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Button Skeleton */}
      <div className="mt-6 flex items-center gap-2">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function CategoryPage({ slug, initialData, onBack }) {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryImage, setCategoryImage] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appLinks, setAppLinks] = useState({
    android: 'https://play.google.com/store/apps/details?id=com.doorstephub.customer',
    ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236'
  });
  const [categoryMetadata, setCategoryMetadata] = useState({
    categoryName: '',
    totalCount: 0,
    detectedCity: null
  });

  // Fetch app links from global settings
  useEffect(() => {
    const fetchAppLinks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
        const data = await res.json();
        if (data.success && data.policy) {
          setAppLinks({
            android: data.policy.customerAndroidAppLink || appLinks.android,
            ios: data.policy.customerIosAppLink || appLinks.ios
          });
        }
      } catch (e) { /* use defaults */ }
    };
    fetchAppLinks();
  }, []);

  // Use default theme settings
  const theme = defaultTheme;

  const handleSubCategoryClick = (subCategory) => {
    const subCategorySlug = subCategory.slug || subCategory._id;
    router.push(`/${subCategorySlug}`);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/appliance-repair-services');
    }
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      // Use initialData if provided and valid
      if (initialData && initialData.success && Array.isArray(initialData.data)) {
        setSubCategories(initialData.data);
        if (initialData.image) setCategoryImage(initialData.image);
        setCategoryMetadata({
          categoryName: initialData.categoryName || '',
          slug: initialData.slug || initialData.categorySlug || slug,
          totalCount: initialData.totalCount || initialData.data.length,
          detectedCity: initialData.detectedCity
        });
        setLoading(false);
        return;
      }

      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: slug })
        });

        if (!response.ok) throw new Error('Failed to fetch subcategories');

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          let filteredData = data.data;
          if (data.data.length > 20 && (data.categoryName || slug)) {
            const targetName = data.categoryName || slug.replace(/-/g, ' ');
            filteredData = data.data.filter(item =>
              (item.categoryName && item.categoryName.toLowerCase() === targetName.toLowerCase()) ||
              (item.categorySlug && item.categorySlug === slug)
            );
          }
          setSubCategories(filteredData);
          if (data.image) setCategoryImage(data.image);
          setCategoryMetadata({
            categoryName: data.categoryName || '',
            slug: data.slug || data.categorySlug || slug,
            totalCount: data.totalCount || filteredData.length,
            detectedCity: data.detectedCity
          });
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [slug, initialData]);

  useEffect(() => {
    if (!loading && subCategories.length === 0) {
      router.replace('/appliance-repair-services');
    }
  }, [loading, subCategories, router]);

  // Auto-correct URL if slug doesn't match canonical slug
  useEffect(() => {
    if (categoryMetadata.slug && slug && categoryMetadata.slug !== slug) {
      router.replace(`/${categoryMetadata.slug}`);
    }
  }, [categoryMetadata.slug, slug, router]);

  // Generate ItemList Schema for Category SEO
  const schemaData = subCategories.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": categoryMetadata.categoryName || "Repair Services",
    "description": `Professional ${categoryMetadata.categoryName} services available in ${categoryMetadata.detectedCity || 'your city'}.`,
    "itemListElement": subCategories.map((sub, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": sub.name,
      "url": typeof window !== 'undefined' ? `${window.location.origin}/${sub.slug || sub._id}` : ""
    }))
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen pt-20 bg-gradient-to-b from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a]"
    >
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      
      {/* App Download Modal */}
      <AnimatePresence>
        {showAppModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAppModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#037166] to-[#04a99d]" />
              <button
                onClick={() => setShowAppModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#037166]/30">
                  <TicketCheck className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Get the App</h3>
                <p className="text-white/60 text-sm mb-1 leading-relaxed">
                  To <span className="text-[#04a99d] font-semibold">raise a support ticket</span> or <span className="text-[#04a99d] font-semibold">track your order</span>, please download the Doorstep Hub app.
                </p>
                <p className="text-white/40 text-xs mb-7">Available on Android & iOS</p>

                <div className="flex flex-col gap-3">
                  <a
                    href={appLinks.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#037166]/50 rounded-2xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#037166]/20 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#04a99d]">
                        <path d="M3.18 23.76c.3.17.65.24 1.04.21l12.4-12.4L3.18.24C2.88.41 2.67.73 2.67 1.2v21.6c0 .47.21.79.51.96zM16.62 12l2.2 2.2-2.9 1.67L3.6 23.4l13.02-11.4zM16.62 12L3.6.6l12.32 7.53 2.9 1.67L16.62 12zM19.5 13.8l-1.24.71L16.62 12l1.64-1.51 1.24.71c.63.36.63 1.44 0 1.8z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Download on</p>
                      <p className="text-white font-bold text-sm">Google Play</p>
                    </div>
                    <Download className="w-4 h-4 text-white/30 group-hover:text-[#04a99d] ml-auto transition-colors" />
                  </a>

                  <a
                    href={appLinks.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#037166]/50 rounded-2xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#037166]/20 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#04a99d]">
                        <path d="M17.05 20.28c-.98.95-2.05 1.78-3.19 1.76-1.14-.02-1.5-.72-2.82-.72-1.32 0-1.74.7-2.82.74-1.14.04-2.26-.88-3.26-1.87-2.02-1.99-3.57-5.59-1.55-9.1C4.4 9.1 6.5 7.85 8.42 7.82c1.44-.03 2.8.96 3.68.96.88 0 2.54-1.2 4.26-1.03.72.03 2.73.29 4.02 2.18-.1.06-2.4 1.4-2.38 4.19.03 3.32 2.92 4.51 2.95 4.52-.02.05-.46 1.58-1.6 3.2v-.01zM12.03 7.25c-.02-2.3 2.12-4.26 4.38-4.25-.01 2.37-2.22 4.36-4.38 4.25z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Download on the</p>
                      <p className="text-white font-bold text-sm">App Store</p>
                    </div>
                    <Download className="w-4 h-4 text-white/30 group-hover:text-[#04a99d] ml-auto transition-colors" />
                  </a>
                </div>

                <p className="mt-5 text-white/30 text-[11px]">Free to download · Instant access to support</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Hero Section with Breadcrumb */}
      <section className="relative py-12 overflow-hidden border-b border-white/5">
        {categoryImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${categoryImage}`}
              alt={categoryMetadata.categoryName}
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-[#037166] to-[#04a99d]" style={{ opacity: theme.accentOpacity }} />

        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [theme.glowIntensity * 0.5, theme.glowIntensity, theme.glowIntensity * 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-[#037166] rounded-full blur-[120px]"
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-6">
            <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <button onClick={handleBack} className="hover:text-white/80">Home</button>
              <ChevronRight className="w-4 h-4" />
              <span>Services</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#037166]">{categoryMetadata.categoryName}</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{categoryMetadata.categoryName}</h1>
              <p className="text-lg text-white/70 leading-relaxed mb-6">{theme.description}</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"><Shield className="w-4 h-4 text-[#037166]" /><span className="text-sm text-white/80">Verified Professionals</span></div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"><Zap className="w-4 h-4 text-[#037166]" /><span className="text-sm text-white/80">Same-Day Available</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subcategories Section */}
      <section className="py-16 relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Service</h2>
                <p className="text-white/60">Select the specific service type you need</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <TrendingUp className="w-4 h-4 text-[#037166]" />
                {categoryMetadata.totalCount || subCategories.length} services available
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <CategorySkeleton key={i} />)}
            </div>
          ) : subCategories.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">No specific services found</h3>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {subCategories.map((subCategory, index) => (
                <motion.div
                  key={subCategory._id || index}
                  whileHover={{ y: -8 }}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  className="group cursor-pointer relative rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-[#037166]/50 overflow-hidden"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img src={subCategory.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${subCategory.image}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800'} alt={subCategory.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h4 className="text-xl font-bold text-white group-hover:text-[#04a99d] transition-colors">{subCategory.name}</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm text-[#04a99d] font-semibold">
                      <span>View Services</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 bg-gradient-to-r from-[#037166]/10 to-[#04a99d]/5 border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Need Help Choosing?</h3>
                <p className="text-white/60">Our experts can recommend the best service for your needs</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowAppModal(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-semibold">
                  <Smartphone className="w-4 h-4" />
                  Track Order
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
