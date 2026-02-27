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

export function CategoryPage({ category, categoryId }) {
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
    categoryName: category,
    totalCount: 0,
    detectedCity: null
  });

  // Fetch app links from global settings
  useEffect(() => {
    const fetchAppLinks = async () => {
      try {
        const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/get_global_settings');
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
    router.push(`/appliances/listing/${subCategory._id}?category=${encodeURIComponent(category)}&name=${encodeURIComponent(subCategory.name)}`);
  };

  const handleBack = () => {
    router.push('/services');
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getsubcategorysbycategoryid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categoryId: categoryId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subcategories');
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setSubCategories(data.data);

          // Set category metadata from API response
          if (data.image) {
            setCategoryImage(data.image);
          }

          setCategoryMetadata({
            categoryName: data.categoryName || category,
            totalCount: data.totalCount || data.data.length,
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
  }, [categoryId, category]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen pt-20 bg-gradient-to-b from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a]"
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
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#037166] to-[#04a99d]" />
              <button
                onClick={() => setShowAppModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 text-center">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#037166]/30">
                  <TicketCheck className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Get the App</h3>
                <p className="text-white/60 text-sm mb-1 leading-relaxed">
                  To <span className="text-[#04a99d] font-semibold">raise a support ticket</span> or <span className="text-[#04a99d] font-semibold">track your order</span>, please download the Doorstep Hub app.
                </p>
                <p className="text-white/40 text-xs mb-7">Available on Android & iOS</p>

                {/* App Store Buttons */}
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
        {/* Category Image Background (if available from API) */}
        {categoryImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={`https://api.doorstephub.com/${categoryImage}`}
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
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [theme.glowIntensity * 0.5, theme.glowIntensity, theme.glowIntensity * 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-[#037166] rounded-full blur-[120px]"
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Back Button + Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-white/10 hover:border-[#037166]/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/50">
              <button onClick={handleBack} className="hover:text-white/80 transition-colors">Home</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white/80">Services</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#037166]">{categoryMetadata.categoryName || category}</span>
            </div>
          </motion.div>

          {/* Category Header - Horizontal Layout */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {categoryMetadata.categoryName || category}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed mb-6">
                {theme.description}
              </p>

              {/* Trust Badges - Horizontal */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <Shield className="w-4 h-4 text-[#037166]" />
                  <h6 className="text-sm text-white/80">Verified Professionals</h6>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <Zap className="w-4 h-4 text-[#037166]" />
                  <h6 className="text-sm text-white/80">Same-Day Available</h6>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <Award className="w-4 h-4 text-[#037166]" />
                  <h6 className="text-sm text-white/80">30-90 Days Warranty</h6>
                </div>
              </div>
            </motion.div>

            {/* Right: Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-3 gap-4"
            >

            </motion.div>
          </div>
        </div>
      </section>

      {/* Subcategories Section - Redesigned Layout */}
      <section className="py-16 relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Choose Your Service
                </h2>
                <p className="text-white/60">
                  Select the specific service type you need
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <TrendingUp className="w-4 h-4 text-[#037166]" />
                {categoryMetadata.totalCount || subCategories.length} services available
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
                    <h3 className="text-lg font-semibold text-white">Most Popular</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {subCategories.slice(0, Math.min(subCategories.length, featuredCount)).map((subCategory, index) => (
                      <motion.div
                        key={subCategory._id || `featured-${index}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -8 }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        onClick={() => handleSubCategoryClick(subCategory)}
                        className="group cursor-pointer relative h-full"
                      >
                        <div className="relative h-full rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border-2 border-white/10 hover:border-[#037166]/50 backdrop-blur-sm transition-all duration-300 overflow-hidden flex items-stretch">
                          {/* Popular Badge */}


                          {/* Background glow on hover */}
                          <AnimatePresence>
                            {hoveredIndex === index && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 bg-gradient-to-br from-[#037166]/20 to-[#04a99d]/10"
                              />
                            )}
                          </AnimatePresence>

                          {/* Image Background if available (low opacity) */}
                          {subCategory.image && (
                            <div className="absolute inset-0 z-0">
                              <img
                                src={`https://api.doorstephub.com/${subCategory.image}`}
                                alt={subCategory.name}
                                className="w-fit h-fit object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
                            </div>
                          )}

                          {/* Icon/Image */}
                          <div className="relative z-10 flex-shrink-0 w-28 md:w-40 bg-white/5">
                            {subCategory.image ? (
                              <div className="w-full h-full overflow-hidden">
                                <img
                                  src={`https://api.doorstephub.com/${subCategory.image}`}
                                  alt={subCategory.name}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg
                                  className="w-10 h-10 md:w-12 md:h-12 text-white"
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
                          </div>

                          {/* Content */}
                          <div className="relative z-10 flex-1 min-w-0 p-4 md:p-6 flex flex-col justify-center">
                            <h4 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 group-hover:text-[#04a99d] transition-colors truncate">
                              {subCategory.name}
                            </h4>
                            <p className="text-white/60 text-sm mb-3 md:mb-4 leading-relaxed line-clamp-2">
                              Professional service by verified and experienced technicians
                            </p>

                            {/* Price */}


                            {/* CTA */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#04a99d] font-semibold text-sm">
                                View Services
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </div>

                            </div>
                          </div>

                          {/* Hover glow border */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                            className="absolute inset-0 rounded-xl border-2 border-[#037166] pointer-events-none"
                            style={{ boxShadow: '0 0 15px rgba(3, 113, 102, 0.5)' }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* All Other Subcategories - Compact Grid (Remaining) */}


              {/* Bottom CTA Strip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-16 pt-8 border-t border-white/5"
              >
                <div className="bg-gradient-to-r from-[#037166]/10 to-[#04a99d]/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Need Help Choosing?
                      </h3>
                      <p className="text-white/60">
                        Our experts can recommend the best service for your needs
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowAppModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-[#037166]/50 transition-all whitespace-nowrap"
                      >
                        <TicketCheck className="w-4 h-4 text-[#04a99d]" />
                        Raise A Ticket
                      </button>
                      <button
                        onClick={() => setShowAppModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-semibold hover:shadow-lg hover:shadow-[#037166]/30 transition-all whitespace-nowrap"
                      >
                        <Smartphone className="w-4 h-4" />
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          }
        </div>
      </section>
    </motion.div>
  );
}
