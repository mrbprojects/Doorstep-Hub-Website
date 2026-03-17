'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Flame, Home as HomeIcon, User,
  Calendar, Shield, Award, Heart,
  MapPin, Star, Clock, CheckCircle, ArrowRight, Zap,
  Mountain, Waves, Wind
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocationContext } from '@/context/LocationContext';
import { ReligiousQuestionnaireModal } from '@/components/religious/ReligiousQuestionnaireModal';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Section wrapper with scroll reveal
function SectionReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
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

  const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';

  // Set the correct serviceId in localStorage on mount to ensure consistency
  useEffect(() => {
    try {
      localStorage.setItem('selectedService', JSON.stringify({
        id: RELIGIOUS_SERVICE_ID,
        name: 'Religious Services'
      }));
    } catch (e) {
      console.error('Error setting selectedService in localStorage:', e);
    }
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

        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services', {
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
        const serviceId = RELIGIOUS_SERVICE_ID;

        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId })
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
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/featured_religious_services');
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
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/latest_religious_services');
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


  return (
    <div className="min-h-screen bg-[var(--off-white)]">

      {/* 1. HERO SECTION - Calm & Divine with Animated Elements */}
      <section className="relative min-h-[110vh] flex items-center overflow-hidden">
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
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * 100,
                y: Math.random() * 100
              }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [
                  Math.random() * 100,
                  Math.random() * -100,
                  Math.random() * 100
                ],
                x: [
                  Math.random() * 100,
                  Math.random() * -50,
                  Math.random() * 100
                ]
              }}
              transition={{
                duration: 8 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
              className="absolute rounded-full blur-sm"
              style={{
                width: 3 + Math.random() * 5,
                height: 3 + Math.random() * 5,
                backgroundColor: i % 2 === 0 ? 'var(--saffron)' : 'var(--warm-gold)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}

          {/* Glowing Sparkles - Diya-like Light Effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0, 1.2, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 6
              }}
              className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
            >
              <div className="h-2 w-2 bg-[var(--warm-gold)] rounded-full blur-md shadow-lg shadow-[var(--warm-gold)]" />
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="container relative mx-auto px-4 py-20 mt-10 z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/80 backdrop-blur-sm px-5 py-2 border border-[var(--saffron)]/30 shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-[var(--saffron)]" />
              <h6 className="text-sm font-medium text-[var(--temple-red)]">Trusted by 50,000+ Devotees</h6>
            </motion.div>

            {/* Centered Sacred Om Symbol */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8 text-7xl text-[var(--warm-gold)] drop-shadow-[0_0_20px_rgba(255,191,0,0.5)] flex justify-center"
              style={{ fontFamily: 'serif' }}
            >
            </motion.div>

            {/* Main Headline with Background Om */}
          {/* Main Headline with Background Om */}
<div className="relative mb-12">
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0.12, 0.2, 0.12], // Increased from 0.04-0.08 to 0.12-0.2
      scale: [1, 1.05, 1],
    }}
    transition={{ 
      duration: 6, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none -z-10 text-[15rem] md:text-[25rem] text-[var(--saffron)] font-serif leading-none"
  >
    ॐ
  </motion.div>
  <motion.h1
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.9, delay: 0.5 }}
    className="text-5xl md:text-7xl font-bold text-[var(--deep-charcoal)] leading-tight relative z-10"
  >
    Book Trusted Religious &{' '}
    <span className="bg-gradient-to-r from-[var(--saffron)] via-[var(--temple-red)] to-[var(--vermilion)] bg-clip-text text-transparent">
      Spiritual Services
    </span>
  </motion.h1>
</div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {/* Primary CTA with Glow Pulse */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 153, 51, 0.3)',
                    '0 0 40px rgba(255, 153, 51, 0.5)',
                    '0 0 20px rgba(255, 153, 51, 0.3)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="rounded-lg inline-block"
              >
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="lg"
                  className="relative bg-gradient-to-r from-[var(--saffron)] via-[var(--warm-gold)] to-[var(--temple-red)] text-white hover:opacity-90 shadow-2xl px-10 py-6 text-lg font-semibold overflow-hidden group"
                >
                  {/* Shine Sweep Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Book a Religious Service</span>
                  <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Secondary CTA */}
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[var(--saffron)] text-[var(--saffron)] hover:bg-[var(--saffron)]/10 px-10 py-6 text-lg font-semibold bg-white/80 backdrop-blur-sm"
                onClick={() => router.push('/religious-services/category')}
              >
                Explore Services
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-[var(--muted-foreground)]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[var(--sacred-teal)]" />
                <span>Verified Priests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[var(--sacred-teal)]" />
                <span>Authentic Rituals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[var(--sacred-teal)]" />
                <span>Instant Booking</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CORE SERVICE CATEGORIES */}
      <SectionReveal>
        <section id="sacred-categories" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-4">
                Sacred Service Categories
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Choose from our comprehensive range of spiritual services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoriesLoading ? (
                // Skeleton or Loading
                <div className="col-span-4 flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin" />
                </div>
              ) : categories.length > 0 ? (
                categories.map((category, index) => (
                  <motion.div
                    key={category._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => router.push(`/religious-services/category/${category._id}?name=${encodeURIComponent(category.name)}`)}
                    className="group cursor-pointer"
                  >
                    <Card className="h-full border-2 border-transparent hover:border-[var(--saffron)]/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Full image area */}
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-orange-100 to-red-50">
                        {category.image ? (
                          <img
                            src={`https://api.doorstephub.com/${category.image}`}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        {/* Fallback gradient shown when no image or image fails */}
                        <div
                          className={`${category.image ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-orange-500 to-red-600`}
                        >
                          <Sparkles className="h-14 w-14 text-white/80" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        {/* Category name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-bold text-white drop-shadow-lg group-hover:text-[var(--saffron)] transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                          {category.description || 'Explore our sacred services'}
                        </p>
                        <Button variant="ghost" className="text-[var(--saffron)] hover:text-[var(--temple-red)] p-0 h-auto font-medium pointer-events-none text-sm">
                          View Services →
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                // Fallback to static if API returns nothing (or show empty state)
                <div className="col-span-4 text-center">No categories found.</div>
              )}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* 3. ASTROLOGY & CONSULTATION (FEATURED) */}
      <SectionReveal delay={0.2}>
        <section className="py-20 bg-gradient-to-b from-[var(--soft-cream)] to-[var(--off-white)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 cursor-pointer group" onClick={() => {
              router.push('/religious-services/all-services');
            }}>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-4 group-hover:text-[var(--saffron)] transition-colors">
                Astrology & Religious Consultation
                <ArrowRight className="inline-block ml-2 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Expert guidance for your spiritual and life decisions
              </p>
            </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {featuredLoading ? (
    <div className="col-span-4 flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin" />
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
        onClick={() => router.push(`/religious-services/service/${service._id}`)}
      >
        <CardContent className="p-6 h-full flex flex-col">
          {/* Name and Image Side by Side */}
          <div className="flex items-center gap-3 mb-4">
            {/* Image Circle */}
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--saffron)]/10 to-[var(--temple-red)]/10 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
              {service.image ? (
                <img
                  src={`https://api.doorstephub.com/${service.image}`}
                  alt={service.serviceName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center"><svg class="h-8 w-8 text-[var(--saffron)]" ...></svg></div>';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-[var(--saffron)]" />
                </div>
              )}
            </div>
            
            {/* Name */}
            <h3 className="text-lg font-semibold text-[var(--deep-charcoal)] group-hover:text-[var(--saffron)] transition-colors line-clamp-2 flex-1">
              {service.serviceName || `${service.firstName} ${service.lastName}`}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-3" title={service.bio || ''}>
            {service.bio?.replace(/<[^>]+>/g, '') || 'Expert religious services.'}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
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

      <SectionReveal delay={0.3}>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-2">
                  Available Services
                </h2>
                <p className="text-lg text-[var(--muted-foreground)]">
                  Browse our verified spiritual services
                </p>
              </div>
              {services.length > 0 && (
                <div className="mt-4 md:mt-0">
                  <Badge variant="outline" className="border-[var(--saffron)]/20 text-[var(--saffron)] px-4 py-1.5 rounded-full bg-[var(--soft-cream)] font-semibold">
                    {services.length} Total Services Found
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {!location && !loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[var(--soft-cream)] rounded-3xl border border-dashed border-[var(--saffron)]/30">
                  <MapPin className="h-16 w-16 text-[var(--saffron)] mb-6 opacity-50 animate-bounce" />
                  <h3 className="text-2xl font-bold text-[var(--deep-charcoal)] mb-3">Divine Presence Near You</h3>
                  <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8 px-6">
                    To show you verified priests and rituals available in your city, please set your location.
                  </p>
                  <Button
                    onClick={() => detectLocation()}
                    className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white px-10 py-6 rounded-2xl text-lg shadow-xl shadow-[var(--saffron)]/20"
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
                      className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer h-full border border-gray-100 hover:border-[var(--saffron)]/30"
                      onClick={() => router.push(`/religious-services/service/${service._id}`)}
                    >
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                        <img
                          src={service.image ? `https://api.doorstephub.com/${service.image}` : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'}
                          alt={service.business_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-[var(--sacred-teal)]/10 text-[var(--sacred-teal)] text-[9px] uppercase font-bold tracking-wider w-fit">Verified Service</Badge>
                            {/* <span className="text-[9px] font-bold text-green-600 flex items-center gap-1 uppercase tracking-tighter">
                              <CheckCircle className="h-2.5 w-2.5" /> Cash on Delivery
                            </span> */}
                          </div>
                          <div className="flex items-center text-sm font-semibold text-[var(--deep-charcoal)]">
                            <Star className="h-3 w-3 fill-[var(--warm-gold)] text-[var(--warm-gold)] mr-1" />
                            {service.avgRating || 4.8}
                          </div>
                        </div>
                        <h3 className="text-base font-bold text-[var(--deep-charcoal)] mb-1.5 group-hover:text-[var(--saffron)] transition-colors line-clamp-1">
                          {service.business_name || `${service.firstName} ${service.lastName}`}
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] mb-4 line-clamp-2 h-8">
                          {service.description || service.bio || 'Expert religious services for your sacred needs.'}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 italic font-medium">Starting from</span>
                            <span className="text-xl font-bold text-[var(--saffron)] leading-none">₹{(service.startingAt || service.BasePrice || service.minFare || 1000).toLocaleString()}</span>
                          </div>
                          <Button size="sm" className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white h-8 px-4 text-xs font-semibold rounded-lg shadow-sm">
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin mb-4" />
                  <p className="text-[var(--muted-foreground)] animate-pulse">Seeking Divine Services...</p>
                </div>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 text-5xl">🕉️</div>
                  <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-2">No Services Found Nearby</h3>
                  <p className="text-[var(--muted-foreground)]">Please try another location for verified priests and poojas.</p>
                </div>
              )}
            </div>

            {services.length > 8 && (
              <div className="mt-16 text-center">
                <Button
                  onClick={() => router.push('/religious-services/all-services')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-[var(--saffron)] text-[var(--saffron)] hover:bg-[var(--saffron)] hover:text-white px-10 py-7 text-lg font-bold rounded-2xl transition-all duration-300 group"
                >
                  View All Services
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </SectionReveal>

      {/* 5. TRUST & AUTHENTICITY */}
      <SectionReveal delay={0.4}>
        <section className="py-20 bg-gradient-to-br from-[var(--soft-cream)] via-[var(--off-white)] to-[var(--warm-beige)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-4">
                Why Trust Us
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Your spiritual journey in safe hands
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                  className="text-center"
                >
                  <div className={`mb-4 mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} p-4 shadow-lg`}>
                    <item.icon className="h-full w-full text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
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
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-4">
                Popular Rituals & Poojas
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Trending and commonly booked spiritual services
              </p>
            </div>

            <div className="mx-auto w-full">
              {latestLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin" />
                </div>
              ) : (
                <Slider {...sliderSettings} className="px-2 pb-10">
                  {latestServices.slice(0, 6).map((ritual, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.03 }}
                      className="px-3"
                    >
                      <Card className="overflow-hidden group cursor-pointer border-2 border-transparent hover:border-[var(--saffron)]/30 transition-all flex flex-col h-full" onClick={() => router.push(`/religious-services/service/${ritual._id}`)}>
                        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                          <img
                            src={ritual.image ? `https://api.doorstephub.com/${ritual.image}` : 'https://images.unsplash.com/photo-1599030859770-940e6a970d4d?auto=format&fit=crop&w=600&q=80'}
                            alt={ritual.serviceName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                          <div className="hidden absolute inset-0 items-center justify-center">
                            <Sparkles className="h-12 w-12 text-[var(--saffron)]" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                        <CardContent className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-1 group-hover:text-[var(--saffron)] transition-colors line-clamp-1">
                            {ritual.serviceName || `${ritual.firstName} ${ritual.lastName}`}
                          </h3>

                          {/* <div className="text-[10px] font-bold text-green-600 flex items-center gap-1 uppercase tracking-tighter mb-4">
                            <CheckCircle className="h-3 w-3" /> Cash on Delivery Available
                          </div> */}

                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 italic font-medium">Starts from</span>
                              <span className="text-xl font-bold text-[var(--saffron)]">
                                ₹{ritual.startingAt || ritual.serviceBookingCost || 1000}
                              </span>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[var(--saffron)] hover:text-[var(--temple-red)] hover:bg-[var(--saffron)]/5">
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
        <section className="py-20 bg-gradient-to-b from-[var(--soft-cream)] to-[var(--off-white)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-4">
                How It Works
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Simple steps to book your spiritual service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
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
                  className="relative text-center"
                >
                  <div className="mb-4 mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-[var(--saffron)] to-[var(--temple-red)] flex items-center justify-center text-2xl font-bold text-white shadow-lg relative">
                    {step.step}
                    {index < 3 && (
                      <div className="hidden md:block absolute left-full top-1/2 w-full h-0.5 bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)]/30" />
                    )}
                  </div>
                  <div className="mb-3 mx-auto h-12 w-12 rounded-xl bg-[var(--saffron)]/10 p-2.5">
                    <step.icon className="h-full w-full text-[var(--saffron)]" />
                  </div>
                  <h5 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-2">
                    {step.title}
                  </h5>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* 8. FINAL DEVOTIONAL CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)] via-[var(--temple-red)] to-[var(--vermilion)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center relative"
        >
          <Sparkles className="h-16 w-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Begin Your Sacred Journey Today
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Connect with verified spiritual guides and experience authentic rituals performed with devotion
          </p>
          <Button size="lg" onClick={() => setIsModalOpen(true)} className="bg-white text-[var(--temple-red)] hover:bg-white/90 shadow-2xl px-10 py-6 text-lg font-semibold">
            Book a Religious Service
            <ArrowRight className="ml-2 h-5 w-5" />
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
