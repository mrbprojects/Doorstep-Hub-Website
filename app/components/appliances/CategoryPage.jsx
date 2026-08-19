'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { getCityReviewers } from '@/lib/applianceRepairSlugs';
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
    <div className="relative h-[160px] rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border-2 border-white/10 overflow-hidden flex items-stretch animate-pulse">
      {/* Image area skeleton */}
      <div className="flex-shrink-0 w-28 md:w-40 bg-white/5" />
      {/* Content area skeleton */}
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-center space-y-3">
        <div className="h-6 w-3/4 bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/5 rounded" />
        <div className="h-4 w-24 bg-white/10 rounded mt-2" />
      </div>
    </div>
  );
}

const getCleanSubcategoryDescription = (sub) => {
  if (sub?.title && !sub.title.toLowerCase().includes('near me')) return sub.title;
  if (!sub?.description) return "Professional service by verified and experienced technicians";
  const cleanText = String(sub.description).replace(/<[^>]*>?/gm, '').trim();
  const isKeywordDump = cleanText.toLowerCase().includes('near me') || (cleanText.match(/,/g) || []).length > 3;
  if (isKeywordDump) {
    return `Professional ${sub.name || 'repair'} services by verified doorstep technicians.`;
  }
  return cleanText || "Professional service by verified and experienced technicians";
};

export function CategoryPage({ slug, initialData }) {
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
    detectedCity: null,
    categoryTitle: '',
    categoryDescription: '',
    categoryFaqs: []
  });
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);

  // Fetch app links from global settings
  useEffect(() => {
    const fetchAppLinks = async () => {
      try {
        const res = await fetch('https://devapis.doorstephub.com/v1/dhubApi/app/get_global_settings');
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
    const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
    const subCategorySlug = subCategory.slug || generateSlug(subCategory.name) || subCategory._id;
    const catSlug = categoryMetadata.slug || slug;
    if (catSlug) {
      router.push(`/${catSlug}/${subCategorySlug}`);
    } else {
      router.push(`/${subCategorySlug}`);
    }
  };

  const handleBack = () => {
    router.push('/appliances');
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      // Use initialData if provided and valid
      if (initialData && initialData.success && Array.isArray(initialData.data)) {
        setSubCategories(initialData.data);
        if (initialData.image) setCategoryImage(initialData.image);
        setCategoryMetadata({
          categoryName: initialData.categoryName || '',
          slug: initialData.slug || initialData.categorySlug || slug, // Use API slug if available, else prop
          totalCount: initialData.totalCount || initialData.data.length,
          detectedCity: initialData.detectedCity,
          categoryTitle: initialData.categoryTitle || initialData.title || '',
          categoryDescription: initialData.categoryDescription || initialData.description || '',
          categoryFaqs: initialData.categoryFaqs || initialData.faqs || []
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
        const response = await fetch('https://devapis.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getsubcategorysbycategoryid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: slug
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subcategories');
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          let filteredData = data.data;

          // Extra safety: If the API returns a huge list (> 20), it might be returning all subcategories.
          // In that case, we should filter client-side if we have the category name or slug.
          if (data.data.length > 20 && (data.categoryName || slug)) {
            const targetName = data.categoryName || slug.replace(/-/g, ' ');
            filteredData = data.data.filter(item =>
              (item.categoryName && item.categoryName.toLowerCase() === targetName.toLowerCase()) ||
              (item.categorySlug && item.categorySlug === slug)
            );
          }

          setSubCategories(filteredData);

          // Set category metadata from API response
          if (data.image) {
            setCategoryImage(data.image);
          }

          setCategoryMetadata({
            categoryName: data.categoryName || '',
            slug: data.slug || data.categorySlug || slug, // Use API slug if available, else prop
            totalCount: data.totalCount || filteredData.length,
            detectedCity: data.detectedCity,
            categoryTitle: data.categoryTitle || data.title || '',
            categoryDescription: data.categoryDescription || data.description || '',
            categoryFaqs: data.categoryFaqs || data.faqs || []
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

  // Auto-correct URL if slug doesn't match canonical slug (e.g. "AC Repair" vs "ac-repair")
  useEffect(() => {
    if (categoryMetadata.slug && slug && categoryMetadata.slug !== slug) {
      router.replace(`/${categoryMetadata.slug}`);
    }
  }, [categoryMetadata.slug, slug, router]);

  console.log("CategoryPage Render State:", {
    categoryMetadata,
    subCategoriesCount: subCategories.length,
    subCategoriesFaqs: subCategories.map(s => ({ name: s.name, faqs: s.faqs }))
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen pt-24 sm:pt-28 bg-[#f8fafc]"
    >
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
      <section className="relative py-12 overflow-hidden border-b border-[#dbe7e4]">
        {/* Category Image Background (if available from API) */}
        {categoryImage && (
          <div className="absolute inset-0 z-0">
            <img loading="lazy" decoding="async"
              src={`https://devapis.doorstephub.com/${categoryImage}`}
              alt={categoryMetadata.categoryName}
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          </div>
        )}

        {/* Subtle Teal Gradient Background Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#037166] to-[#04a99d]"
          style={{ opacity: theme.accentOpacity }}
        />

        {/* Animated glow orb - category specific intensity */}
        <motion.div initial={false}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [theme.glowIntensity * 0.5, theme.glowIntensity, theme.glowIntensity * 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-[#037166] rounded-full blur-[120px] pointer-events-none"
        />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          {/* Back Button + Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6"
          >
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#cfe1de] text-[#334155] hover:bg-white hover:border-[#037166]/40 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#64748b]">
              <button onClick={handleBack} className="hover:text-white/80 transition-colors">Home</button>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[#334155]">Services</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[#037166] truncate max-w-[120px] sm:max-w-none">{categoryMetadata.categoryName}</span>
            </div>
          </motion.div>

          {/* Category Header - Full Width Layout */}
          <div className="w-full flex justify-center">
            {/* Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3 leading-tight w-full text-center">
                {categoryMetadata.categoryTitle || categoryMetadata.categoryName}
              </h1>
              {(categoryMetadata.categoryDescription || theme.description) && (
                <p className="text-[12px] md:text-base text-[#475569] leading-relaxed mb-6 w-full text-center max-w-4xl">
                  {categoryMetadata.categoryDescription || theme.description}
                </p>
              )}

              {/* Trust Badges - Horizontal */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#d6e5e2]">
                  <Shield className="w-4 h-4 text-[#037166]" />
                  <h6 className="text-sm text-[#334155]">Verified Professionals</h6>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#d6e5e2]">
                  <Zap className="w-4 h-4 text-[#037166]" />
                  <h6 className="text-sm text-[#334155]">Same-Day Available</h6>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#d6e5e2]">
                  <Award className="w-4 h-4 text-[#037166]" />
                  <h6 className="text-sm text-[#334155]">30-90 Days Warranty</h6>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subcategories Section - Redesigned Layout */}
      <section className="py-16 relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {categoryMetadata.categoryName || "Choose Your Service"}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Select the specific service type you need
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 self-start sm:self-auto">
                <TrendingUp className="w-4 h-4 text-[#037166] flex-shrink-0" />
                <span>{categoryMetadata.totalCount || subCategories.length} services available</span>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          ) : subCategories.length === 0 ?
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
            >
              <div className="text-white/40 mb-4">
                <Users className="w-12 h-12 mx-auto opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No specific services found</h3>
              <p className="text-white/50">We're expanding our services in this category. Check back soon!</p>
            </motion.div>
            :
            <>
              {/* Most Popular Subcategories - Up to featuredCount */}
              {subCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-[#037166] text-[#037166]" />
                    <h3 className="text-lg font-semibold text-gray-900">Most Popular</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {subCategories.map((subCategory, index) => (
                      <motion.div
                        key={subCategory._id || `featured-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        whileHover={{ y: -6 }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        onClick={() => handleSubCategoryClick(subCategory)}
                        className="group cursor-pointer relative h-40 sm:h-44 md:h-48 w-full"
                      >
                        <div className="relative w-full h-full rounded-2xl bg-white border border-slate-200 hover:border-[#037166]/60 transition-all duration-300 overflow-hidden flex items-stretch shadow-sm hover:shadow-md">
                          {/* Left Side: Fixed Image Container */}
                          <div className="relative w-28 sm:w-36 md:w-40 shrink-0 h-full overflow-hidden bg-slate-100">
                            {subCategory.image ? (
                              <img loading="lazy" decoding="async"
                                src={`https://devapis.doorstephub.com/${subCategory.image}`}
                                alt={subCategory.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center">
                                <svg
                                  className="w-10 h-10 text-white/80"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-extrabold text-[#037166] shadow-sm uppercase tracking-wider">
                              Popular
                            </span>
                          </div>

                          {/* Right Side: Content Container */}
                          <div className="p-3.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-between h-full bg-white">
                            <div>
                              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 mb-1 group-hover:text-[#037166] transition-colors line-clamp-1">
                                {subCategory.name}
                              </h3>
                              <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                                {getCleanSubcategoryDescription(subCategory)}
                              </p>
                            </div>

                            {/* Footer CTA */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#037166]/10 text-[#037166] font-bold text-[11px] sm:text-xs group-hover:bg-[#037166] group-hover:text-white transition-all">
                                View Services
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* All Other Subcategories - Compact Grid (Remaining) */}


              {/* FAQ Section */}
              {(() => {
                const allFaqs = [
                  ...(categoryMetadata.categoryFaqs || []),
                  ...subCategories.flatMap(sub => sub.faqs || [])
                ].filter(faq => faq && (faq.question || faq.title) && (faq.answer || faq.description));
                return allFaqs.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 pt-8 border-t border-[#e2ecea]"
                  >
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Frequently Asked Questions
                      </h3>
                      <p className="text-gray-600">
                        Got questions? We've got answers.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-start">
                      {allFaqs.slice(0, 9).map((faq, index) => (
                        <div
                          key={index}
                          className={`border rounded-2xl overflow-hidden transition-all duration-300 ${faqActiveIndex === index
                              ? 'bg-white border-[#037166]/50 shadow-md shadow-[#037166]/5'
                              : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                            }`}
                        >
                          <button
                            onClick={() => setFaqActiveIndex(faqActiveIndex === index ? null : index)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                          >
                            <span className="text-base font-semibold text-gray-900 leading-tight">
                              {faq.question || faq.title}
                            </span>
                            <span className="text-[#037166] flex-shrink-0">
                              <svg
                                className={`w-5 h-5 transition-transform duration-300 ${faqActiveIndex === index ? 'rotate-180' : ''
                                  }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {faqActiveIndex === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-[#f1f5f9] pt-3.5">
                                  {faq.answer || faq.description}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null;
              })()}

            </>
          }
        </div>
      </section>

      {/* Customer Reviews & Ratings Standalone Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3.5 sm:gap-4">
            <div className="max-w-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                Customer Reviews & Ratings in {categoryMetadata?.detectedCity || 'Kakinada'}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Verified customer feedback for {categoryMetadata?.categoryName || 'Water Purifier Repair Services'} in {categoryMetadata?.detectedCity || 'Kakinada'}.
              </p>
            </div>
            <div className="hidden sm:inline-flex flex-wrap items-center gap-2 sm:gap-2.5 bg-emerald-50/80 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-[#037166]/20 self-start sm:self-auto shrink-0 shadow-sm">
              <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-black text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                4.8<span className="text-gray-400 font-medium text-[10px] sm:text-xs">/5.0</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 hidden xs:inline-block" />
              <span className="text-gray-600 font-semibold text-xs sm:text-sm whitespace-nowrap">
                1,240 Verified Reviews
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getCityReviewers(categoryMetadata?.detectedCity || 'Kakinada', categoryMetadata?.categoryName || 'Water Purifier Repair Services').map((rev, index) => (
              <div
                key={index}
                className="bg-white border border-[#e2e8f0] hover:border-[#037166]/40 p-6 rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#037166]/10 text-[#037166] font-bold flex items-center justify-center text-sm">
                        {rev.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{rev.name}</h4>
                        <p className="text-xs text-gray-400">{rev.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "{rev.body}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#037166] font-medium">
                  <span>Verified Booking</span>
                  <span>{categoryMetadata?.detectedCity || 'Kakinada'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

