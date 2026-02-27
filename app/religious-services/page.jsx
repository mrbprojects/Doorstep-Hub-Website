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
  MapPin, Star, Clock, CheckCircle, ArrowRight, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocationContext } from '@/context/LocationContext';
import { ReligiousQuestionnaireModal } from '@/components/religious/ReligiousQuestionnaireModal';

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
  const { location, detectWithIP } = useLocationContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!location) {
      detectWithIP().catch(err => console.log("Auto detect failed", err));
    }
  }, [location]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const userLocationData = localStorage.getItem('user_location_data');
        const locationData = userLocationData ? JSON.parse(userLocationData) : null;
        const lat = locationData?.lat || 17.3850;
        const lng = locationData?.lng || 78.4867;

        // Get religious services serviceId from localStorage, fallback to hardcoded ID
        const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';
        let serviceId = RELIGIOUS_SERVICE_ID;
        try {
          const savedService = localStorage.getItem('selectedService');
          if (savedService) {
            const parsed = JSON.parse(savedService);
            if (parsed?.id) serviceId = parsed.id;
          }
        } catch (e) { /* use fallback */ }

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
        const selectedService = localStorage.getItem('selectedService');
        let serviceId = null;
        if (selectedService) {
          try {
            const serviceData = JSON.parse(selectedService);
            serviceId = serviceData.id;
          } catch (e) { console.log('Error parsing selectedService'); }
        }

        // Only fetch if we have a valid serviceId — do NOT fallback to PG Hostels ID
        if (!serviceId) {
          setCategoriesLoading(false);
          return;
        }

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

  return (
    <div className="min-h-screen bg-[var(--off-white)]">

      {/* 1. HERO SECTION - Calm & Divine with Animated Elements */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Vertical Gradient Background: White â†’ Saffron â†’ Deep Maroon */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FFF8E7] to-[#8B4513]/30" />

        {/* Floating Religious Motifs - Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Om Symbol - Top Left */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0.08, 0.12, 0.08],
              y: [100, 0, 100],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-[10%] text-9xl text-[var(--saffron)]"
            style={{ fontFamily: 'serif' }}
          >
            à¥
          </motion.div>

          {/* Lotus - Top Right */}
          <motion.div
            initial={{ opacity: 0, y: 150 }}
            animate={{
              opacity: [0.06, 0.1, 0.06],
              y: [150, 50, 150],
              rotate: [0, -8, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-32 right-[15%]"
          >
            <Sparkles className="h-32 w-32 text-[var(--temple-red)]" />
          </motion.div>

          {/* Flame - Bottom Left */}
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{
              opacity: [0.07, 0.11, 0.07],
              y: [-100, 0, -100],
              rotate: [0, 10, 0]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute bottom-40 left-[20%]"
          >
            <Flame className="h-28 w-28 text-[var(--saffron)]" />
          </motion.div>

          {/* Star - Middle Right */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{
              opacity: [0.05, 0.09, 0.05],
              y: [80, 20, 80],
              rotate: [0, -12, 0]
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 6
            }}
            className="absolute top-1/2 right-[8%]"
          >
            <Star className="h-24 w-24 text-[var(--sacred-teal)]" />
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

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-[var(--deep-charcoal)] leading-tight"
            >
              Book Trusted Religious &{' '}
              <span className="bg-gradient-to-r from-[var(--saffron)] via-[var(--temple-red)] to-[var(--vermilion)] bg-clip-text text-transparent">
                Spiritual Services
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="text-xl md:text-2xl text-[var(--muted-foreground)] mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              Astrology consultations, poojas, homams, and sacred ceremonies â€” all in one place.
            </motion.p>

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
            <div className="mb-12 cursor-pointer group" onClick={() => {
              const el = document.getElementById('sacred-categories');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-4 group-hover:text-[var(--saffron)] transition-colors">
                Astrology & Religious Consultation
                <ArrowRight className="inline-block ml-2 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Expert guidance for your spiritual and life decisions
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {[
                { title: 'Muhurtham Fixing', desc: 'Auspicious time selection', icon: Clock, services: 12 },
                { title: 'Dosham Remedies', desc: 'Solutions for astrological issues', icon: Shield, services: 8 },
                { title: 'Astrology Consultation', desc: 'Personalized horoscope reading', icon: User, services: 15 },
                { title: 'Horoscope Services', desc: 'Birth chart creation & analysis', icon: Sparkles, services: 10 }
              ].map((subcategory, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="min-w-[280px]"
                >
                  <Card
                    className="h-full bg-white hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--saffron)]/10 to-[var(--temple-red)]/10 p-2.5 group-hover:scale-110 transition-transform">
                        <subcategory.icon className="h-full w-full text-[var(--saffron)]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-2 group-hover:text-[var(--saffron)] transition-colors">
                        {subcategory.title}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mb-4">
                        {subcategory.desc}
                      </p>
                      <Badge className="bg-[var(--saffron)]/10 text-[var(--saffron)] hover:bg-[var(--saffron)]/20">
                        {subcategory.services} Services
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* 4. AVAILABLE RELIGIOUS SERVICES (TABS) */}
      <SectionReveal delay={0.3}>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="services" className="w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-2">
                    Available Services
                  </h2>
                  <p className="text-lg text-[var(--muted-foreground)]">
                    Browse our verified spiritual services
                  </p>
                </div>
                <TabsList className="w-full md:w-auto mt-4 md:mt-0 grid grid-cols-2 bg-[var(--soft-cream)]">
                  <TabsTrigger value="services" className="data-[state=active]:bg-[var(--saffron)] data-[state=active]:text-white">
                    All Services
                  </TabsTrigger>
                  <TabsTrigger value="centers" className="data-[state=active]:bg-[var(--saffron)] data-[state=active]:text-white">
                    Nearby Centers
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="services">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.length > 0 ? (
                    services.map((service, i) => (
                      <Card
                        key={service._id || i}
                        className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
                        onClick={() => router.push(`/religious-services/service/${service._id}`)}
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                          <img
                            src={service.logo ? `https://api.doorstephub.com/${service.logo}` : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'}
                            alt={service.business_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-[var(--sacred-teal)]/10 text-[var(--sacred-teal)]">Priest / Service</Badge>
                            <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                              <Star className="h-4 w-4 fill-[var(--warm-gold)] text-[var(--warm-gold)] mr-1" />
                              {service.avgRating || 4.8}
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-2 group-hover:text-[var(--saffron)] transition-colors">
                            {service.business_name || `${service.firstName} ${service.lastName}`}
                          </h3>
                          <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                            {service.description || service.bio || 'Expert religious services.'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-[var(--saffron)]">₹{(service.BasePrice || service.minFare || 1000).toLocaleString()}</span>
                            <Button size="sm" className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white">
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : loading ? (
                    <div className="col-span-full flex items-center justify-center py-20">
                      <div className="w-10 h-10 border-4 border-[var(--saffron)]/20 border-t-[var(--saffron)] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-20 text-gray-500">
                      No services found nearby.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="centers">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="hover:shadow-lg transition-shadow">
                      <div className="h-32 bg-gradient-to-br from-[var(--saffron)] to-[var(--temple-red)] flex items-center justify-center">
                        <HomeIcon className="h-16 w-16 text-white/90" />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-[var(--deep-charcoal)] mb-3">
                          Sri Venkateswara Temple
                        </h3>
                        <div className="space-y-2 text-sm text-[var(--muted-foreground)] mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-[var(--sacred-teal)]" />
                            2.5 km away
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-2 fill-[var(--warm-gold)] text-[var(--warm-gold)]" />
                            4.9 (256 reviews)
                          </div>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-2 text-[var(--saffron)]" />
                            25 years experience
                          </div>
                        </div>
                        <Button variant="outline" className="w-full border-[var(--saffron)] text-[var(--saffron)] hover:bg-[var(--saffron)] hover:text-white">
                          View Center
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Diwali Lakshmi Pooja', category: 'Festival', price: '₹3,500', img: 'https://images.unsplash.com/photo-1605289355680-75fb41239154?auto=format&fit=crop&w=600&q=80' },
                { title: 'Ganapathi Homam', category: 'Homam', price: '₹5,000', img: 'https://images.unsplash.com/photo-1599030859770-940e6a970d4d?auto=format&fit=crop&w=600&q=80' },
                { title: 'Wedding Ceremony', category: 'Life Event', price: '₹15,000', img: 'https://images.unsplash.com/photo-1583939411023-14783179e581?auto=format&fit=crop&w=600&q=80' },
                { title: 'Satyanarayan Pooja', category: 'Pooja', price: '₹2,500', img: 'https://images.unsplash.com/photo-1604423882544-6f5e8a6e0b8c?auto=format&fit=crop&w=600&q=80' },
                { title: 'Navagraha Pooja', category: 'Pooja', price: '₹4,000', img: 'https://images.unsplash.com/photo-1598618589929-b1433d05cfc6?auto=format&fit=crop&w=600&q=80' },
                { title: 'Vastu Shanti', category: 'Ceremony', price: '₹6,500', img: 'https://images.unsplash.com/photo-1545987796-200677720281?auto=format&fit=crop&w=600&q=80' }
              ].map((ritual, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className="overflow-hidden group cursor-pointer border-2 border-transparent hover:border-[var(--saffron)]/30 transition-all" onClick={() => setIsModalOpen(true)}>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={ritual.img}
                        alt={ritual.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                      <div className="hidden absolute inset-0 bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)] items-center justify-center">
                        <Sparkles className="h-12 w-12 text-[var(--saffron)]" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <CardContent className="p-5">
                      <Badge className="mb-3 bg-[var(--sacred-teal)]/10 text-[var(--sacred-teal)]">
                        {ritual.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-2">
                        {ritual.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[var(--saffron)]">{ritual.price}</span>
                        <Button size="sm" variant="ghost" className="text-[var(--saffron)] hover:text-[var(--temple-red)]">
                          View Details →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
