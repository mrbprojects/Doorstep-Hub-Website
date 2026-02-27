import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Shield, Clock, Search } from 'lucide-react';
import { ServicePreviewCard } from '@/components/appliances/ServicePreviewCard';

export function Hero({ onViewServices, onBookService }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchCategoriesFromAPI(latitude.toString(), longitude.toString());
            },
            () => {
              fetchWithDefaultLocation();
            }
          );
        } else {
          fetchWithDefaultLocation();
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setIsLoading(false);
      }
    };

    const fetchCategoriesFromAPI = async (lattitude, longitude) => {
      try {
        const body = lattitude && longitude ? { lattitude, longitude } : {};
        const response = await fetch(
          'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getallcategorys',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const mappedCategories = result.data.map((item) => ({
            title: item.name,
            image: `https://api.doorstephub.com/${item.image}`,
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

    const fetchWithDefaultLocation = async () => {
      await fetchCategoriesFromAPI('17.4391296', '78.4433152'); // Hyderabad
    };

    fetchCategories();
  }, []);

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
