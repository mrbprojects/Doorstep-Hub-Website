'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Sparkles, Award, TrendingUp, Crown, CloudFog, HandHeart, Coffee, Flame, Droplets, Scissors, Palette, Wind } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function RecommendedSpaSalon() {
  const router = useRouter();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1280);

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);
  
  const handleStoreClick = (store) => {
    if (store.isDummy) return;
    router.push(`/spa-salon/${store.slug || store.id}`);
  };

  const amenityIcons = {
    'Steam room or sauna': CloudFog,
    'Steam room': CloudFog,
    'Sauna': Flame,
    'Hot towel service': HandHeart,
    'Relaxation lounges': Coffee,
    'Complimentary beverages': Coffee,
    'Robes & slippers': Crown,
    'Lockers & secure storage': Award,
    'Lockers & secure storage for personal items': Award,
    'Haircut': Scissors,
    'Hair Coloring': Palette,
    'Styling': Wind,
    'Facial': Sparkles,
    'Massage': HandHeart,
    'Premium Products': Droplets,
  };

  // Fetch featured spa stores from API
  useEffect(() => {
    const fetchFeaturedSpaStores = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/featured_spa_stores`);
        const data = await response.json();

        if (data.success && data.stores && data.stores.length > 0) {
          const mappedStores = data.stores.map((store, index) => {
            let displayedAmenities = [];

            if (store.amenities && store.amenities.length > 0) {
              displayedAmenities = store.amenities.map(a => a.title || a);
            } else {
              displayedAmenities = (store.otherAmenities || "")
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(item => {
                  const lower = item.toLowerCase();
                  return item.length > 0 &&
                    !lower.includes("amenities") &&
                    !lower.includes("relaxation & comfort") &&
                    !item.trim().endsWith(":");
                });
            }

            // Limit to top 4 amenities
            if (displayedAmenities.length > 4) {
              displayedAmenities = displayedAmenities.slice(0, 4);
            }

            // Fallback if still empty
            if (displayedAmenities.length === 0) {
              displayedAmenities = ['Premium Services', 'Expert Therapists', 'Relaxation Lounge', 'Hygienic Environment'];
            }

            return {
              id: store._id,
              slug: store.slug,
              name: store.storeName || `${store.firstName} ${store.lastName}`,
              category: 'Premium Spa & Salon',
              rating: 4.8,
              reviews: '500+',
              price: store.startingAt ? `₹${store.startingAt}` : '$$',
              image: store.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.image}` : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY3OTU0MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
              badge: index === 0 ? 'Top Rated' : 'Trending',
              highlights: displayedAmenities,
              description: store.bio,
              isDummy: false
            };
          });
          setFeatured(mappedStores);
        } else {
          // Fallback to original hardcoded data - expanded to 4 items
          setFeatured([
            {
              id: 'dummy-1',
              name: 'Royal Glow Spa',
              category: 'Premium Spa',
              rating: 4.9,
              reviews: '1.2K',
              price: '$$$',
              image: 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY3OTU0MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
              badge: 'Top Rated',
              highlights: ['VIP Lounge', 'Expert Therapists', 'Premium Products'],
              isDummy: true
            },
            {
              id: 'dummy-2',
              name: 'Elegance Hair Studio',
              category: 'Luxury Salon',
              rating: 4.8,
              reviews: '980',
              price: '$$$',
              image: 'https://images.unsplash.com/photo-1675034741696-fa9551c31bb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGhhaXJjdXQlMjBiZWF1dHl8ZW58MXx8fHwxNzY4MDI2NzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
              badge: 'Trending',
              highlights: ['Celebrity Stylists', 'Latest Trends', 'Exclusive Brands'],
              isDummy: true
            },
            {
              id: 'dummy-3',
              name: 'Zenith Wellness Retreat',
              category: 'Luxury Spa',
              rating: 4.9,
              reviews: '1.5K',
              price: '$$$',
              image: 'https://images.unsplash.com/photo-1578631618866-c4e99113bbce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjByZXRyZWF0fGVufDF8fHwxNzY3OTU0MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
              badge: 'Top Rated',
              highlights: ['Holistic Treatments', 'Organic Products', 'Private Suites'],
              isDummy: true
            },
            {
              id: 'dummy-4',
              name: 'Velvet Touch Salon',
              category: 'Premium Salon',
              rating: 4.7,
              reviews: '850',
              price: '$$',
              image: 'https://images.unsplash.com/photo-1606851732918-bfec4a081ec8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNiYWxheSUyMGhhaXJ8ZW58MXx8fHwxNzY4MDI2NzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
              badge: 'Trending',
              highlights: ['Signature Styles', 'Premium Colors', 'Express Services'],
              isDummy: true
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching featured spa stores:', err);
        // Fallback to original hardcoded data - expanded to 4 items
        setFeatured([
          {
            id: 'dummy-1',
            name: 'Royal Glow Spa',
            category: 'Premium Spa',
            rating: 4.9,
            reviews: '1.2K',
            price: '$$$',
            image: 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY3OTU0MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
            badge: 'Top Rated',
            highlights: ['VIP Lounge', 'Expert Therapists', 'Premium Products'],
            isDummy: true
          },
          {
            id: 'dummy-2',
            name: 'Elegance Hair Studio',
            category: 'Luxury Salon',
            rating: 4.8,
            reviews: '980',
            price: '$$$',
            image: 'https://images.unsplash.com/photo-1675034741696-fa9551c31bb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGhhaXJjdXQlMjBiZWF1dHl8ZW58MXx8fHwxNzY4MDI2NzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
            badge: 'Trending',
            highlights: ['Celebrity Stylists', 'Latest Trends', 'Exclusive Brands'],
            isDummy: true
          },
          {
            id: 'dummy-3',
            name: 'Zenith Wellness Retreat',
            category: 'Luxury Spa',
            rating: 4.9,
            reviews: '1.5K',
            price: '$$$',
            image: 'https://images.unsplash.com/photo-1578631618866-c4e99113bbce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjByZXRyZWF0fGVufDF8fHwxNzY3OTU0MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
            badge: 'Top Rated',
            highlights: ['Holistic Treatments', 'Organic Products', 'Private Suites'],
            isDummy: true
          },
          {
            id: 'dummy-4',
            name: 'Velvet Touch Salon',
            category: 'Premium Salon',
            rating: 4.7,
            reviews: '850',
            price: '$$',
            image: 'https://images.unsplash.com/photo-1606851732918-bfec4a081ec8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNiYWxheSUyMGhhaXJ8ZW58MXx8fHwxNzY4MDI2NzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
            badge: 'Trending',
            highlights: ['Signature Styles', 'Premium Colors', 'Express Services'],
            isDummy: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedSpaStores();
  }, []);

  // Auto-scroller logic
  const scrollRef = React.useRef(null);
  const shouldDesktopScroll = isDesktop && featured.length > 6;
  useEffect(() => {
    if (loading || featured.length === 0 || !shouldDesktopScroll) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const cards = Array.from(scrollRef.current.querySelectorAll('[data-scroll-card="spa-salon"]'));

        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const nextCard = cards.find((card) => card.offsetLeft > scrollLeft + 5);
          scrollRef.current.scrollTo({
            left: nextCard ? nextCard.offsetLeft : 0,
            behavior: 'smooth'
          });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, featured, shouldDesktopScroll]);

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden">
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#d4af37] to-white bg-clip-text text-transparent">
              Recommended Spa & Salon
            </h2>
          </div>
          <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 xl:mx-0 xl:px-0">
            <div className="flex min-w-max gap-4 xl:min-w-0 xl:grid xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-[228px] shrink-0 animate-pulse xl:w-auto">
                <div className="bg-gray-800 h-64 rounded-3xl" />
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/35 rounded-full blur-[170px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/25 rounded-full blur-[170px]"
        />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-[#d4af37]/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            < Crown className="w-4 h-4 text-[#d4af37]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-transparent font-medium">
              Luxury Glow World
            </h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-transparent">
              Recommended Spa & Salon
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Premium destinations handpicked for the ultimate pampering experience
          </p>
        </motion.div>

        {/* Featured Cards - Horizontal Scroller */}
        <div
          ref={scrollRef}
          className={`overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4 xl:mx-0 ${shouldDesktopScroll ? 'xl:px-0' : 'xl:px-0 xl:overflow-visible'}`}
        >
          <div className={`flex min-w-max gap-4 snap-x snap-mandatory ${shouldDesktopScroll ? '' : 'xl:min-w-0 xl:grid xl:grid-cols-6 xl:snap-none'}`}>
          {featured.map((place, index) => (
            <motion.div
              key={place.id || index}
              data-scroll-card="spa-salon"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.7 }}
              className={`group relative w-[228px] shrink-0 snap-start cursor-pointer ${shouldDesktopScroll ? '' : 'xl:w-auto'}`}
              onClick={() => handleStoreClick(place)}
            >
              {/* Premium Card - Original sizing preserved */}
              <div className="relative h-full overflow-hidden rounded-2xl border-2 border-[#037166]/30 bg-gradient-to-br from-[#1a1a1a] via-[#1a1510] to-[#0f0f0f]">
                {/* Top Badge */}
                <div className="absolute top-0 left-1/2 z-20 flex -translate-x-1/2 items-center space-x-2 whitespace-nowrap rounded-lg rounded-t-none border border-t-0 border-[#037166]/30 bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] px-5 py-1 shadow-lg backdrop-blur-md">
                  <Award className="w-3 h-3 text-white" />
                  <span className="text-xs font-bold !text-white uppercase tracking-wider block">{place.badge}</span>
                </div>

                {/* Image with Luxury Overlay - Original height preserved */}
                <div className="relative h-44 overflow-hidden">
                  <ImageWithFallback
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />

                  {/* Premium Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />


                  {/* Rating Badge - Bottom Left Flush */}
                  {/* <div className="absolute bottom-0 left-0 z-20">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border border-white/10">
                      <Sparkles className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
                      <span className="text-sm font-bold text-white">{place.rating}</span>
                    </div>
                  </div> */}


                </div>

                {/* Content - Original spacing preserved */}
                <div className="relative z-10 -mt-10 p-4">
                  {/* Main Info Card */}
                  <motion.div
                    className="mb-4 flex h-[220px] flex-col rounded-2xl border border-[#037166]/30 bg-[#1a1a1a]/90 p-3 shadow-xl backdrop-blur-xl"
                  >
                    <div className="mb-2 min-h-[48px]">
                      <h6 className="mb-1 bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-[10px] font-semibold uppercase tracking-[0.18em] text-transparent">
                        {place.category}
                      </h6>
                      <h4 className="line-clamp-2 w-full bg-gradient-to-r from-[#037166] via-[#d4af37] to-[#037166] bg-clip-text text-[15px] font-bold leading-tight text-transparent" title={place.name}>
                        {place.name}
                      </h4>
                    </div>

                    {/* Rating Space */}


                    {/* Price & Action Card - Matches PG Styling */}
                    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-[#037166]/20 bg-[#037166]/5 p-2">
                      {/* Left: Price */}
                      <div>
                        <h6 className="mb-0.5 font-ubuntu text-[9px] text-gray-400">
                          Starting at
                        </h6>
                        <div className="font-ubuntu text-[11px] font-bold text-[#6D1357]">
                          {place.price}
                        </div>
                      </div>

                      <div>
                        <div className="whitespace-nowrap rounded-full bg-[#297A70] px-3 py-1.5 text-[9px] font-semibold shadow-lg">
                          <span className="!text-white">
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    {/* Highlights (Amenities) */}
                    <div className="mt-auto grid grid-cols-2 gap-2">
                      {place.highlights.map((highlight, idx) => {
                        const Icon = amenityIcons[highlight] || Sparkles;
                        return (
                          <div key={idx} className="flex h-[36px] items-center space-x-1.5 rounded-lg border border-[#037166]/10 bg-[#1a1a1a]/50 px-2 py-1.5">
                            <Icon className="h-3 w-3 shrink-0 text-[#d4af37]" />
                            <span className="line-clamp-1 text-[9px] text-gray-300">{highlight}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Description */}
                    {/* {!place.isDummy && place.description && (
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-4 mt-3 border-t border-[#037166]/20 pt-3">
                        {place.description}
                      </p>
                    )} */}
                  </motion.div>


                </div>

                {/* Premium Glow Effect */}
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Premium Stats - Original layout preserved */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Crown, label: 'Premium Partners', value: '50K+' },
            { icon: Award, label: 'Quality Certified', value: '100%' },
            { icon: Sparkles, label: 'Satisfied Clients', value: '15K+' },
            { icon: TrendingUp, label: 'Growth Rate', value: '250%' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-gradient-to-br from-[#1a1a1a]/60 to-[#1a1510]/60 backdrop-blur-sm border border-[#037166]/20 rounded-2xl text-center"
            >
              <stat.icon className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div> */}
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




