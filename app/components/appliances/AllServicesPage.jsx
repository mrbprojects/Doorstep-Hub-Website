'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, MapPin, Zap } from 'lucide-react';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';

export function AllServicesPage({
  onServiceClick,
  onStoreClick,
  onBack,
  selectedCategory,
  selectedSubCategory,
}) {
  const [activeTab, setActiveTab] = useState('services');

  // If category and subcategory are selected, use ServicesListingPage
  if (selectedCategory && selectedSubCategory) {
    return (
      <ServicesListingPage
        category={selectedCategory}
        subCategory={selectedSubCategory}
        onBack={onBack}
        onServiceClick={onServiceClick}
      />
    );
  }

  // Otherwise show All Services page with tabs
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20"
    >
      {/* Header */}
      <section className="sticky top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            All Services
          </motion.h1>
          <p className="text-white/80">Browse all available services and service centers</p>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex gap-2 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('services')}
              className="relative px-6 py-3 text-sm font-medium text-white transition-all"
            >
              All Services
              {activeTab === 'services' && (
                <motion.div
                  layoutId="allServicesTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('centers')}
              className="relative px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-all"
            >
              Nearby Centers
              {activeTab === 'centers' && (
                <motion.div
                  layoutId="allServicesTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'services' ? (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Service cards would go here - for now showing placeholder */}
              {[1, 2, 3, 4, 5, 6].map((id) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: id * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => onServiceClick(id)}
                  className="group cursor-pointer"
                >
                  <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400`}
                        alt="Service"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />

                      {/* Rating Badge - Bottom Left Flush */}
                      <div className="absolute bottom-0 left-0 z-20">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border-t border-r border-white/10">
                          <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                          <span className="text-sm font-bold text-white">4.9</span>
                        </div>
                      </div>

                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Available Now
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors">
                        Expert Service {id}
                      </h4>
                      <p className="text-white/60 text-sm mb-4">Professional service provider</p>
                      <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all">
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="centers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[1, 2, 3, 4].map((id) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: id * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => onStoreClick(id)}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"
                          alt="Center"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/60" />
                      </div>

                      <div className="flex-1 p-6">
                        <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors">
                          Service Center {id}
                        </h4>
                        <p className="text-white/60 text-sm mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          123 Main Street, City
                        </p>
                        <div className="flex items-center gap-1 mb-4">
                          <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                          <span className="text-white font-medium">4.8</span>
                          <span className="text-white/40">(890 reviews)</span>
                        </div>
                        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all">
                          View Center
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
