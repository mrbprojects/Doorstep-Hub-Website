'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Flame, User,
  Calendar, Shield, Award, Heart,
  MapPin, Star, CheckCircle, ArrowRight,
  Mountain, Waves, Wind
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocationContext } from '@/context/LocationContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import dynamic from 'next/dynamic';
import { CategorySubcategorySection } from '@/components/shared/CategorySubcategorySection';
import { KnowledgeSection } from '@/components/landing/KnowledgeSection';

const ReligiousQuestionnaireModal = dynamic(() => import('@/components/religious/ReligiousQuestionnaireModal').then(m => m.ReligiousQuestionnaireModal), { ssr: false });

// Pre-computed stable particle data (avoids Math.random() during render → hydration mismatch)
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  x0: 20 + (i * 37) % 60,
  y0: 10 + (i * 53) % 80,
  yA: -30 - (i * 17) % 70,
  yB: 10 + (i * 29) % 90,
  xA: -25 - (i * 11) % 25,
  xB: 20 + (i * 13) % 80,
  duration: 8 + (i * 7) % 10,
  delay: (i * 3) % 5,
  size: 3 + (i * 2) % 5,
  isEven: i % 2 === 0,
  left: `${5 + (i * 8.3) % 90}%`,
  top: `${5 + (i * 9.1) % 90}%`,
}));

const SPARKLES = Array.from({ length: 8 }, (_, i) => ({
  duration: 3 + (i * 4) % 4,
  delay: (i * 6) % 6,
  left: `${20 + (i * 10.3) % 60}%`,
  top: `${20 + (i * 11.7) % 60}%`,
}));

// Section wrapper with scroll reveal
function SectionReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}





export default function ReligiousServicesPage() {
  const router = useRouter();
  const { location, detectLocation } = useLocationContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [latestServices, setLatestServices] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(null);

  const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';
  const RELIGIOUS_SERVICE_SLUG = 'religious-services';

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  useEffect(() => {
    // No auto-detect, let user trigger or context handle
  }, [location]);

  // Set the correct serviceId in localStorage on mount to ensure consistency
  useEffect(() => {
    try {
      localStorage.setItem('selectedService', JSON.stringify({
        id: RELIGIOUS_SERVICE_ID,
        slug: RELIGIOUS_SERVICE_SLUG,
        name: 'Religious Services'
      }));
    } catch (e) {
      console.error('Error setting selectedService in localStorage:', e);
    }
  }, []);

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
        const data = await response.json();
        if (data.success && data.data) {
          setGlobalSettings(data.data);
        }
      } catch (error) {
        console.error("Error fetching global settings:", error);
      }
    };

    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        if (!location) {
          setLoading(false);
          return;
        }
        const lat = location.lat;
        const lng = location.lng;

        const serviceId = RELIGIOUS_SERVICE_ID;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lattitude: lat, longitude: lng, serviceId })
        });
        const data = await response.json();
        if (data.success && data.professionalServices) {
          setServices(data.professionalServices);
        }
      } catch (error) {
        console.error('Error fetching religious services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [location]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId: RELIGIOUS_SERVICE_ID })
        });
        const data = await response.json();
        if (data.success && data.category) {
          setCategories(data.category);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Featured Religious Services
  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/featured_religious_services`);
        const data = await response.json();
        if (data.success) {
          setFeaturedServices(data.services || []);
        }
      } catch (error) {
        console.error("Error fetching featured religious services:", error);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeaturedServices();
  }, []);

  // Fetch Latest Religious Services (Popular Rituals)
  useEffect(() => {
    const fetchLatestServices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_religious_services`);
        const data = await response.json();
        if (data.success) {
          setLatestServices(data.services || []);
        }
      } catch (error) {
        console.error("Error fetching latest religious services:", error);
      } finally {
        setLatestLoading(false);
      }
    };
    fetchLatestServices();
  }, []);


  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": "Trusted Religious & Spiritual Services",
        "description": "Book verified priests for authentic rituals, poojas, and spiritual consultations. Trusted by thousands of devotees.",
        "provider": {
          "@type": "Organization",
          "name": "Doorstep Hub",
          "url": "https://doorstephub.com"
        },
        "areaServed": {
          "@type": "Country",
          "name": "India"
        }
      },
      {
        "@type": "ItemList",
        "name": "Sacred Service Categories",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Pooja Services" },
          { "@type": "ListItem", "position": 2, "name": "Rituals & Ceremonies" },
          { "@type": "ListItem", "position": 3, "name": "Astrology Consultation" },
          { "@type": "ListItem", "position": 4, "name": "Spiritual Guidance" }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* 1. HERO SECTION - Calm & Divine with Animated Elements */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Vertical Gradient Background: White â†’ Saffron â†’ Deep Maroon */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FFF8E7] to-[#8B4513]/30" />

        {/* Floating Religious Motifs - Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Left Side Elements (Earth & Fire) */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{
              opacity: [0.15, 0.22, 0.15],
              y: [0, 30, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[25%] left-[10%] text-[var(--saffron)] flex flex-col items-center drop-shadow-[0_0_15px_rgba(255,153,51,0.2)]"
          >
            <Mountain className="h-32 w-32 opacity-70" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-50">Pritvi</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{
              opacity: [0.18, 0.28, 0.18],
              y: [0, -30, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[25%] left-[15%] text-[var(--temple-red)] flex flex-col items-center drop-shadow-[0_0_20px_rgba(139,26,26,0.3)]"
          >
            <Flame className="h-32 w-32 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-50">Agni</span>
          </motion.div>

          {/* Right Side Elements (Water & Air) */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{
              opacity: [0.15, 0.22, 0.15],
              y: [0, -40, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[25%] right-[10%] text-[var(--sacred-teal)] flex flex-col items-center drop-shadow-[0_0_15px_rgba(3,113,102,0.2)]"
          >
            <Waves className="h-32 w-32 opacity-70" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-50">Jal</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{
              opacity: [0.12, 0.2, 0.12],
              y: [0, 40, 0],
              x: [100, 120, 100]
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-[25%] right-[15%] text-sky-400 flex flex-col items-center drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            <Wind className="h-28 w-28 opacity-70" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-50">Vayu</span>
          </motion.div>

          {/* Floating Particles - Gold/Saffron Dots */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: p.x0, y: p.y0 }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [p.y0, p.yA, p.yB],
                x: [p.x0, p.xA, p.xB]
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay
              }}
              className="absolute rounded-full blur-sm pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.isEven ? 'var(--saffron)' : 'var(--warm-gold)',
                left: p.left,
                top: p.top,
              }}
            />
          ))}

          {/* Glowing Sparkles - Diya-like Light Effects */}
          {SPARKLES.map((s, i) => (
            <motion.div
              key={`sparkle-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0, 1.2, 0]
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: s.delay
              }}
              className="absolute"
              style={{ left: s.left, top: s.top }}
            >
              <div className="h-2 w-2 bg-[var(--warm-gold)] rounded-full blur-md shadow-lg shadow-[var(--warm-gold)]" />
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="container relative mx-auto px-4 pt-20 sm:pt-24 pb-6 sm:pb-8 z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-3 sm:mb-4 inline-flex items-center space-x-2 rounded-full bg-white/85 backdrop-blur-sm px-4 py-1.5 sm:px-5 sm:py-2 border border-[var(--saffron)]/30 shadow-md"
            >
              <Sparkles className="h-4 w-4 text-[var(--saffron)]" />
              <h6 className="text-xs sm:text-sm font-medium text-[var(--temple-red)]">Trusted by 50,000+ Devotees</h6>
            </motion.div>

            {/* Main Headline with Background Om */}
            <div className="relative mb-4 sm:mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.12, 0.2, 0.12],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none -z-10 text-[9rem] sm:text-[14rem] md:text-[20rem] text-[var(--saffron)] font-serif leading-none"
              >
                ॐ
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--deep-charcoal)] leading-tight relative z-10"
              >
                Book Trusted Religious &{' '}
                <span className="bg-gradient-to-r from-[var(--saffron)] via-[var(--temple-red)] to-[var(--vermilion)] bg-clip-text text-transparent">
                  Spiritual Services
                </span>
              </motion.h1>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col items-center gap-3 justify-center"
            >
              {/* Primary CTA with Glow Pulse */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(255, 153, 51, 0.25)',
                    '0 0 30px rgba(255, 153, 51, 0.45)',
                    '0 0 15px rgba(255, 153, 51, 0.25)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="rounded-xl inline-block"
              >
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="lg"
                  className="relative bg-gradient-to-r from-[var(--saffron)] via-[var(--warm-gold)] to-[var(--temple-red)] text-white hover:opacity-90 shadow-xl px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base md:text-lg font-semibold overflow-hidden group rounded-xl"
                >
                  {/* Shine Sweep Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Book a Religious Service</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Alternative - Traditional Religious Theme */}
              <div className="relative flex flex-wrap justify-center gap-2.5 sm:gap-3 mt-1">
                {/* Google Play Button */}
                <motion.a
                  href={globalSettings?.playStore || "#"}
                  target={globalSettings?.playStore ? "_blank" : undefined}
                  rel={globalSettings?.playStore ? "noopener noreferrer" : undefined}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-28 sm:w-34 h-9 sm:h-11 rounded-2xl bg-[#DF5D31] shadow-md hover:shadow-lg transition-all overflow-hidden group"
                  title="Get it on Google Play"
                >
                  <Image 
                    src="/andriod1.png" 
                    alt="Google Play" 
                    className="h-full w-full object-cover brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity" 
                   width={500} height={300} />
                </motion.a>

                {/* App Store Button */}
                <motion.a
                  href={globalSettings?.appStore || "#"}
                  target={globalSettings?.appStore ? "_blank" : undefined}
                  rel={globalSettings?.appStore ? "noopener noreferrer" : undefined}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-28 sm:w-34 h-9 sm:h-11 rounded-2xl bg-[#DF5D31] shadow-md hover:shadow-lg transition-all overflow-hidden group"
                  title="Download on the App Store"
                >
                  <Image 
                    src="/apple2.png" 
                    alt="App Store" 
                    className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
                   width={500} height={300} />
                </motion.a>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-[var(--muted-foreground)]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--sacred-teal)] shrink-0" />
                <span>Verified Priests</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--sacred-teal)] shrink-0" />
                <span>Authentic Rituals</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--sacred-teal)] shrink-0" />
                <span>Instant Booking</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CORE SERVICE CATEGORIES */}
      <SectionReveal>
        <div id="sacred-categories">
          <CategorySubcategorySection
            categories={categories}
            categoriesLoading={categoriesLoading}
            isLocationReady={true}
            onViewAll={() => router.push('/religious-services/category')}
            onOpenCategory={(category) => {
              const target = category.slug || category._id;
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('religious_category', JSON.stringify({ name: category.name }));
              }
              router.push(`/religious-services/${target}`);
            }}
            onSubcategoryClick={(subCategory) => router.push(`/religious-services/${subCategory.slug || subCategory._id}`)}
            fetchSubcategoriesForCategory={async (category) => {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  categorySlug: category.slug,
                  serviceSlug: 'rituals-and-religious-services',
                }),
              });
              const data = await response.json();
              return data.success && Array.isArray(data.data) ? data.data : [];
            }}
            theme={{
              eyebrow: 'Sacred',
              title: 'Sacred Service Categories',
              description: 'Browse divine categories on the left and open the exact ritual or spiritual service you want on the right.',
              viewAllLabel: 'View all',
              paddingClass: 'py-8 sm:py-12 lg:py-14',
              headerMarginClass: 'mb-6 sm:mb-8',
              sectionClass: 'bg-gradient-to-b from-white via-[var(--soft-cream)] to-[var(--off-white)]',
              eyebrowClass: 'text-[var(--saffron)]',
              titleClass: 'text-[var(--deep-charcoal)]',
              descriptionClass: 'text-[var(--muted-foreground)]',
              viewAllClass: 'text-[var(--saffron)] hover:text-[var(--temple-red)]',
              locationBoxClass: 'border border-[var(--saffron)]/20 bg-white/90',
              locationIconClass: 'text-[var(--saffron)]/60',
              locationTitleClass: 'text-[var(--deep-charcoal)]',
              locationButtonClass: 'bg-[var(--saffron)] text-white hover:bg-[var(--temple-red)]',
              mutedCardClass: 'border border-orange-100 bg-white/90',
              categoryCardClass: 'border-orange-100 bg-white hover:border-[var(--saffron)]/30 hover:bg-gradient-to-r hover:from-[#fffaf0] hover:to-white',
              activeCategoryCardClass: 'border-[var(--saffron)]/35 bg-gradient-to-r from-[#fff4df] via-white to-[#fff9ef] shadow-[0_20px_40px_rgba(255,153,51,0.14)]',
              thumbClass: 'border-orange-100 bg-[#fffaf3]',
              activeThumbClass: 'border-[var(--saffron)]/30 bg-white shadow-sm',
              categoryTextClass: 'text-[var(--deep-charcoal)]',
              activeCategoryTextClass: 'text-[var(--saffron)]',
              categoryAccentTextClass: 'text-[var(--saffron)]',
              countTextClass: 'text-[var(--muted-foreground)]',
              arrowClass: 'bg-[#faf7f2] text-[#b7a89a] group-hover:bg-gradient-to-r group-hover:from-[var(--saffron)] group-hover:to-[var(--temple-red)] group-hover:text-white',
              activeArrowClass: 'bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white shadow-[0_10px_24px_rgba(255,153,51,0.28)]',
              gridCardHeightClass: 'h-[190px]',
              gridFallbackClass: 'bg-gradient-to-br from-[#ffe3bf] to-[#ffd1c2]',
              gridOverlayClass: 'bg-gradient-to-t from-[rgba(64,24,0,0.92)] via-[rgba(64,24,0,0.3)] to-transparent',
              showMoreClass: 'border-[var(--saffron)]/25 text-[var(--saffron)] hover:bg-[var(--soft-cream)]',
              emptyBoxClass: 'border border-orange-100 bg-white',
              emptyTitleClass: 'text-[var(--deep-charcoal)]',
              emptyTextClass: 'text-[var(--muted-foreground)]',
            }}
          />
        </div>
      </SectionReveal>

      {/* 3. ASTROLOGY & CONSULTATION (FEATURED) */}
      <SectionReveal delay={0.2}>
        <section className="py-8 sm:py-12 md:py-14 bg-gradient-to-b from-[var(--soft-cream)] to-[var(--off-white)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8 cursor-pointer group" onClick={() => {
              router.push('/religious-services/all-services');
            }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-2 sm:mb-3 group-hover:text-[var(--saffron)] transition-colors">
                Astrology & Religious Consultation
                <ArrowRight className="inline-block ml-2 h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-2 transition-transform" />
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[var(--muted-foreground)]">
                Expert guidance for your spiritual and life decisions
              </p>
            </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {featuredLoading ? (
    <div className="col-span-4 flex items-center justify-center py-12 sm:py-16">
      <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin" />
    </div>
  ) : featuredServices.slice(0, 4).map((service, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <Card
        className="h-full bg-white hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={() => {
                        const target = service.slug || service._id;
                        router.push(`/religious-services/${target}`);
                      }}
      >
        <CardContent className="p-4 sm:p-5 h-full flex flex-col">
          {/* Name and Image Side by Side */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            {/* Image Circle */}
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--saffron)]/10 to-[var(--temple-red)]/10 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
              {service.image ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}`}
                  alt={service.serviceName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center"><svg class="h-8 w-8 text-[var(--saffron)]" ...></svg></div>';
                  }}
                 width={500} height={300} />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--saffron)]" />
                </div>
              )}
            </div>
            
            {/* Name */}
            <h3 className="text-base sm:text-lg font-semibold text-[var(--deep-charcoal)] group-hover:text-[var(--saffron)] transition-colors line-clamp-2 flex-1">
              {service.serviceName || `${service.firstName} ${service.lastName}`}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4 line-clamp-3" title={service.bio || ''}>
            {service.bio?.replace(/<[^>]+>/g, '') || 'Expert religious services.'}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[var(--saffron)] tracking-wider">
              <span className="text-[11px] italic font-bold text-[var(--saffron)] tracking-wider">Starting at</span> ₹{service.startingAt || service.serviceBookingCost}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ))}
</div>
          </div>
        </section>
      </SectionReveal>

      {/* 4. AVAILABLE SERVICES */}
      <SectionReveal delay={0.3}>
        <section className="py-8 sm:py-12 md:py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-1 sm:mb-1.5">
                  Available Services
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-[var(--muted-foreground)]">
                  Browse our verified spiritual services
                </p>
              </div>
              {services.length > 0 && (
                <div className="mt-3 md:mt-0">
                  <Badge variant="outline" className="border-[var(--saffron)]/20 text-[var(--saffron)] px-3.5 py-1 rounded-full bg-[var(--soft-cream)] font-semibold text-xs sm:text-sm">
                    {services.length} Total Services Found
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {!location && !loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 bg-[var(--soft-cream)] rounded-2xl border border-dashed border-[var(--saffron)]/30">
                  <MapPin className="h-12 w-12 sm:h-14 sm:w-14 text-[var(--saffron)] mb-4 opacity-50 animate-bounce" />
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--deep-charcoal)] mb-2">Divine Presence Near You</h3>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] text-center max-w-md mb-6 px-4">
                    To show you verified priests and rituals available in your city, please set your location.
                  </p>
                  <Button
                    onClick={() => detectLocation()}
                    className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base shadow-md shadow-[var(--saffron)]/20"
                  >
                    Find My Location
                  </Button>
                </div>
              ) : services.length > 0 ? (
                services.slice(0, 8).map((service, i) => (
                  <motion.div
                    key={service._id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: (i % 4) * 0.1 }}
                  >
                    <Card
                      className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer h-full border border-gray-100 hover:border-[var(--saffron)]/30 flex flex-col"
                      onClick={() => {
                        const target = service.slug || service._id;
                        router.push(`/religious-services/${target}`);
                      }}
                    >
                      <div className="relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                        <Image
                          src={service.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}` : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'}
                          alt={service.business_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         width={500} height={300} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-[var(--sacred-teal)]/10 text-[var(--sacred-teal)] text-[9px] uppercase font-bold tracking-wider w-fit">Verified Service</Badge>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm font-semibold text-[var(--deep-charcoal)]">
                            <Star className="h-3 w-3 fill-[var(--warm-gold)] text-[var(--warm-gold)] mr-1" />
                            {service.avgRating || 4.8}
                          </div>
                        </div>
                        <h3 className="text-base font-bold text-[var(--deep-charcoal)] mb-1 group-hover:text-[var(--saffron)] transition-colors line-clamp-1">
                          {service.business_name || `${service.firstName} ${service.lastName}`}
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2 h-8">
                          {service.description || service.bio || 'Expert religious services for your sacred needs.'}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 italic font-medium">Starting from</span>
                            <span className="text-lg sm:text-xl font-bold text-[var(--saffron)] leading-none">₹{(service.startingAt || service.BasePrice || service.minFare || 1000).toLocaleString('en-IN')}</span>
                          </div>
                          <Button size="sm" className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white h-7 sm:h-8 px-3.5 sm:px-4 text-xs font-semibold rounded-lg shadow-sm">
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin mb-3" />
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] animate-pulse">Seeking Divine Services...</p>
                </div>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="mb-3 text-4xl sm:text-5xl">🕉️</div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--deep-charcoal)] mb-1.5">No Services Found Nearby</h3>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">Please try another location for verified priests and poojas.</p>
                </div>
              )}
            </div>

            {services.length > 8 && (
              <div className="mt-8 sm:mt-10 text-center">
                <Button
                  onClick={() => router.push('/religious-services/all-services')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-[var(--saffron)] text-[var(--saffron)] hover:bg-[var(--saffron)] hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 group"
                >
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </SectionReveal>

      {/* 5. TRUST & AUTHENTICITY */}
      <SectionReveal delay={0.4}>
        <section className="py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[var(--soft-cream)] via-[var(--off-white)] to-[var(--warm-beige)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-2">
                Why Trust Us
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[var(--muted-foreground)]">
                Your spiritual journey in safe hands
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {[
                { icon: Shield, title: 'Verified Priests', desc: 'Background checked & qualified', color: 'from-blue-500 to-cyan-500' },
                { icon: Award, title: 'Years of Experience', desc: 'Decades of combined expertise', color: 'from-orange-500 to-amber-500' },
                { icon: CheckCircle, title: 'Authentic Rituals', desc: 'Following vedic traditions', color: 'from-green-500 to-emerald-500' },
                { icon: Heart, title: '50,000+ Devotees', desc: 'Trusted by thousands', color: 'from-pink-500 to-rose-500' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-orange-100/60 shadow-xs"
                >
                  <div className={`mb-2.5 sm:mb-3 mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${item.color} p-3 sm:p-3.5 shadow-md`}>
                    <item.icon className="h-full w-full text-white" />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-[var(--deep-charcoal)] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* 6. POPULAR RITUALS & POOJAS */}
      <SectionReveal delay={0.5}>
        <section className="py-8 sm:py-12 md:py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-2">
                Popular Rituals & Poojas
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[var(--muted-foreground)]">
                Trending and commonly booked spiritual services
              </p>
            </div>

            <div className="mx-auto w-full">
              {latestLoading ? (
                <div className="flex items-center justify-center py-12 sm:py-16">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin" />
                </div>
              ) : (
                <Slider {...sliderSettings} className="px-1 sm:px-2 pb-4 sm:pb-6">
                  {latestServices.slice(0, 6).map((ritual, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02 }}
                      className="px-2 sm:px-3"
                    >
                      <Card className="overflow-hidden group cursor-pointer border border-gray-100 hover:border-[var(--saffron)]/30 transition-all flex flex-col h-full shadow-xs hover:shadow-md" onClick={() => router.push(`/religious-services/${ritual.slug || ritual._id}`)}>
                        <div className="relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                          <Image
                            src={ritual.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${ritual.image}` : 'https://images.unsplash.com/photo-1599030859770-940e6a970d4d?auto=format&fit=crop&w=600&q=80'}
                            alt={ritual.serviceName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                           width={500} height={300} />
                          <div className="hidden absolute inset-0 items-center justify-center">
                            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--saffron)]" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                        <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-[var(--deep-charcoal)] mb-1 group-hover:text-[var(--saffron)] transition-colors line-clamp-1">
                            {ritual.serviceName || `${ritual.firstName} ${ritual.lastName}`}
                          </h3>

                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 italic font-medium">Starts from</span>
                              <span className="text-lg sm:text-xl font-bold text-[var(--saffron)]">
                                ₹{ritual.startingAt || ritual.serviceBookingCost || 1000}
                              </span>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[var(--saffron)] hover:text-[var(--temple-red)] hover:bg-[var(--saffron)]/5 text-xs sm:text-sm px-2.5">
                              View Details →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Slider>
              )}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* 7. HOW IT WORKS */}
      <SectionReveal delay={0.6}>
        <section className="py-8 sm:py-12 md:py-14 bg-gradient-to-b from-[var(--soft-cream)] to-[var(--off-white)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-2">
                How It Works
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[var(--muted-foreground)]">
                Simple steps to book your spiritual service
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {[
                { step: '1', icon: Calendar, title: 'Choose Category', desc: 'Select from our services' },
                { step: '2', icon: Sparkles, title: 'Select Ritual', desc: 'Pick your ceremony' },
                { step: '3', icon: User, title: 'Choose Priest', desc: 'Select verified expert' },
                { step: '4', icon: CheckCircle, title: 'Book & Relax', desc: 'Confirm with confidence' }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative text-center p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-orange-100/60 shadow-xs"
                >
                  <div className="mb-2 sm:mb-3 mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-[var(--saffron)] to-[var(--temple-red)] flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-md relative">
                    {step.step}
                    {index < 3 && (
                      <div className="hidden md:block absolute left-full top-1/2 w-full h-0.5 bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)]/30" />
                    )}
                  </div>
                  <div className="mb-2 mx-auto h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[var(--saffron)]/10 p-2 sm:p-2.5">
                    <step.icon className="h-full w-full text-[var(--saffron)]" />
                  </div>
                  <h5 className="text-sm sm:text-base font-semibold text-[var(--deep-charcoal)] mb-1">
                    {step.title}
                  </h5>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Help Center Section - Religious Services Articles */}
      <KnowledgeSection vertical="religious" showNewsletter={false} className="py-8 sm:py-12 md:py-14" />

      {/* 8. FINAL DEVOTIONAL CTA */}
      <section className="relative py-10 sm:py-14 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)] via-[var(--temple-red)] to-[var(--vermilion)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center relative"
        >
          <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-white/80 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
            Begin Your Sacred Journey Today
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Connect with verified spiritual guides and experience authentic rituals performed with devotion
          </p>
          <Button size="lg" onClick={() => setIsModalOpen(true)} className="bg-white text-[var(--temple-red)] hover:bg-white/90 shadow-xl px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-xl">
            Book a Religious Service
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Religious Book Modal */}
      <ReligiousQuestionnaireModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

