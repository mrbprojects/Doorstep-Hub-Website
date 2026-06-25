'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Shield, Zap, Star, Search, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { ServicePreviewCard } from '@/components/appliances/ServicePreviewCard';
import { useLocationContext } from '@/context/LocationContext';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';

const DEFAULT_APP_LINKS = {
  ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236',
  android:
    'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
};

const TRUST_FEATURES = [
  { icon: Shield, label: 'Verified & Insured Professionals', desc: 'All verified & Insured' },
  { icon: Zap, label: 'Same Day Service Available', desc: 'Book In 60 Seconds' },
  { icon: Star, label: '30-90 Days Service Warranty On Repairs', desc: 'On All Services' },
];

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
    <section className="relative min-h-[50vh] overflow-hidden pt-24 pb-8">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fafc] to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.14)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-white/80 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-white/85 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#037166]/30 bg-[#037166]/10 px-4 py-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#037166]" />
            <h6 className="bg-gradient-to-r from-[#037166] to-[#ff6b35] bg-clip-text text-sm font-medium text-transparent">
              Trusted by 50,000+ customers
            </h6>
          </div>

          <h1 className="mb-4 text-[2.1rem] font-bold italic leading-[1.05] text-[#0f172a] sm:text-5xl lg:text-[3.8rem]">
            <span className="block sm:inline">Expert Home Services</span>
            <span className="hidden sm:inline">
              <br />
            </span>
            <span className="block text-[#037166]">At Your Doorstep</span>
          </h1>

          <p className="mx-auto mb-7 hidden max-w-3xl text-base leading-relaxed text-gray-700 sm:block sm:text-lg">
            Fast and reliable home appliance repair at your doorstep. Get expert service for ACs, TVs,
            refrigerators, washing machines, geysers, and more. Book trusted technicians in minutes.
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

          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={globalSettings?.playStore || globalSettings?.customerAndroidAppLink || DEFAULT_APP_LINKS.android}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-36 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl xs:h-14 xs:w-44"
              title="Get it on Google Play"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/andriod1.png"
                alt="Google Play"
                className="h-full w-full object-cover opacity-95 brightness-0 invert transition-opacity hover:opacity-100"
              />
            </a>

            <a
              href={globalSettings?.appStore || globalSettings?.customerIosAppLink || DEFAULT_APP_LINKS.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-36 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl xs:h-14 xs:w-44"
              title="Download on the App Store"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/apple2.png"
                alt="App Store"
                className="h-full w-full object-cover opacity-95 brightness-0 invert transition-opacity hover:opacity-100"
              />
            </a>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {TRUST_FEATURES.map((item, i) => (
              <div
                key={i}
                className="flex flex-row items-center gap-3 rounded-2xl border border-[#d6e5e2] bg-white/80 p-3 backdrop-blur-sm transition-all hover:border-[#037166]/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#037166]/30 bg-gradient-to-br from-[#037166]/20 to-[#025951]/20">
                  <item.icon className="h-5 w-5 text-[#037166]" />
                </div>
                <div className="text-left">
                  <h6 className="mb-1 text-[15px] font-semibold text-[#0f172a]">{item.label}</h6>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {!location && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#d6e5e2] bg-white/80 p-6 backdrop-blur-md"
            >
              <MapPin className="mx-auto mb-4 h-12 w-12 text-[#037166] opacity-50" />
              <h3 className="mb-2 text-xl font-bold text-[#0f172a]">Service Availability</h3>
              <p className="mb-6 text-gray-500">Please select your location to see featured categories and services available in your area.</p>
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

