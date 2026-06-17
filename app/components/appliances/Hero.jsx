'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Shield, Clock, Search, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { ServicePreviewCard } from '@/components/appliances/ServicePreviewCard';
import { useLocationContext } from '@/context/LocationContext';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';

export function Hero({ onViewServices, onBookService }) {
  const router = useRouter();
  const { location, loading: locationLoading } = useLocationContext();
  const { globalSettings } = useGlobalSettings() || {};
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!location?.lat || !location?.lng) {
        setIsLoading(false); // Stop loading, display placeholder or empty state
        return;
      }

      setIsLoading(true);
      try {
        const body = {
          lattitude: location.lat.toString(),
          longitude: location.lng.toString()
        };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const mappedCategories = result.data.map((item) => ({
            title: item.name,
            image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}`,
            _id: item._id,
            status: item.status,
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };



    fetchCategories();
  }, [location?.lat, location?.lng]);

  return (
    <section className="relative min-h-[50vh] pt-24 pb-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a]" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#037166] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-15" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-[#037166]/30 mb-5">
            <div className="w-2 h-2 rounded-full bg-[#04a99d]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] to-[#ff6b35] bg-clip-text text-transparent font-medium">Trusted by 50,000+ customers</h6>
          </div>

          {/* Main Headline */}
          <h1 className="text-[2.1rem] leading-[1.05] sm:text-5xl lg:text-[3.8rem] font-bold mb-4 italic text-white">
            <span className="block sm:inline">
              Expert Home Services
            </span>
            <span className="hidden sm:inline">
              <br />
            </span>
            <span className="block text-[#037166]">
              At Your Doorstep
            </span>
          </h1>


          {/* Subheadline */}
          <p className="text-base sm:text-lg text-gray-400 mb-7 leading-relaxed max-w-3xl mx-auto">
Fast and reliable home appliance repair at your doorstep. Get expert service for ACs, TVs, refrigerators, washing machines, geysers, and more. Book trusted technicians in minutes.


          </p>

          {/* CTA Buttons - Separated and Rounded */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={onBookService}
              className="group relative px-7 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-semibold text-base overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#037166]/50 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2 text-white">
                Book a Service Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#04a99d] to-[#037166] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={onViewServices}
              className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/80 border-2 border-[#037166] text-black font-semibold text-base transition-all hover:scale-105 hover:bg-white"
            >
              <span className="text-black">
                Find Services
              </span>
              <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform text-black" />
            </button>

          </div>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <motion.a
              href={globalSettings?.appStore || '#'}
              target={globalSettings?.appStore ? '_blank' : undefined}
              rel={globalSettings?.appStore ? 'noopener noreferrer' : undefined}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex h-[44px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] px-3 shadow-xl shadow-[#037166]/20"
              title="Download on the App Store"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/apple2.png"
                alt="App Store"
                className="h-11 object-contain !invert !brightness-[3]"
              />
            </motion.a>

            <motion.a
              href={globalSettings?.playStore || '#'}
              target={globalSettings?.playStore ? '_blank' : undefined}
              rel={globalSettings?.playStore ? 'noopener noreferrer' : undefined}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex h-[44px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] px-3 shadow-xl shadow-[#037166]/20"
              title="Get it on Google Play"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/andriod1.png"
                alt="Google Play"
                className="h-11 object-contain !invert !brightness-[3]"
              />
            </motion.a>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {[
              { icon: Shield, label: 'Verified & Insured Professionals', desc: 'All verified & Insured' },
              { icon: Clock, label: 'Same Day Service Available', desc: 'Book In 60 Seconds' },
              { icon: Sparkles, label: '30-90 Days Service Warranty On Repairs', desc: 'On All Services' },
            ].map((item, i) => (
              <div key={i} className="flex flex-row items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#037166]/50 transition-all">
                <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center">
                  <item.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="text-left">
                  <h6 className="font-semibold text-white text-[15px] mb-1">{item.label}</h6>
                  <p className="text-xs text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {!location && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md max-w-2xl mx-auto"
            >
              <MapPin className="w-12 h-12 text-[#04a99d] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Service Availability</h3>
              <p className="text-gray-400 mb-6">Please select your location to see featured categories and services available in your area.</p>
              <button
                onClick={() => document.querySelector('[data-location-trigger]')?.click()}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold hover:shadow-lg transition-all"
              >
                Set Your Location
              </button>
            </motion.div>
          )}
        </div>

        {/* Service Preview Cards */}

      </div>

      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

