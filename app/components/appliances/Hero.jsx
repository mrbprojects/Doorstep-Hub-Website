import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Shield, Clock, Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { ServicePreviewCard } from '@/components/appliances/ServicePreviewCard';
import { useLocationContext } from '@/context/LocationContext';

export function Hero({ onViewServices, onBookService }) {
  const router = useRouter();
  const { location, loading: locationLoading } = useLocationContext();
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
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a]" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#037166] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-15" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-[#037166]/30 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#04a99d]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] to-[#ff6b35] bg-clip-text text-transparent font-medium">Trusted by 50,000+ customers</h6>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold mb-6 italic text-white">
            Expert Home Services
            <br />
            <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
              At Your Doorstep
            </span>
          </h1>


          {/* Subheadline */}
          <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Professional repair and maintenance services for all your home needs.
            Book verified experts in minutes.
          </p>

          {/* CTA Buttons - Separated and Rounded */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button
              onClick={onBookService}
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#037166]/50 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2 text-white">
                Book a Service Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#04a99d] to-[#037166] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={onViewServices}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full glass-button-premium border border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-[#037166]/50 transition-all hover:scale-105"
            >
              <span className="text-white">
                Find Services
              </span>
              <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
            </button>

          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Shield, label: 'Verified & Insured Professionals', desc: 'All verified & Insured' },
              { icon: Clock, label: 'Same Day Service', desc: 'Book In 60 Seconds' },
              { icon: Sparkles, label: '30-90 Days Warranty', desc: 'On All Services' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#037166]/50 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h6 className="font-semibold text-white mb-1">{item.label}</h6>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {!location && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md max-w-2xl mx-auto"
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

