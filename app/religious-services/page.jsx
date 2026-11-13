'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';
import dynamic from 'next/dynamic';
import { KnowledgeSection } from '@/components/landing/KnowledgeSection';
import { AppDownload } from '@/components/landing/AppDownload';
import ReligiousLandingHero from '@/components/religious/ReligiousLandingHero';
import SacredServiceCategoriesSection from '@/components/religious/SacredServiceCategoriesSection';
import TrendingServicesSection from '@/components/religious/TrendingServicesSection';
import HowItWorksSection from '@/components/religious/HowItWorksSection';

const ReligiousQuestionnaireModal = dynamic(() => import('@/components/religious/ReligiousQuestionnaireModal').then(m => m.ReligiousQuestionnaireModal), { ssr: false });

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
  const { location } = useLocationContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [latestServices, setLatestServices] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';
  const RELIGIOUS_SERVICE_SLUG = 'religious-services';

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
        "name": "Sacred Pooja Services",
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

      {/* 1. HERO SECTION - Sacred Services Devotional Redesign */}
      <ReligiousLandingHero
        categories={categories}
        categoriesLoading={categoriesLoading}
        onOpenCategory={(category) => {
          const target = category.slug || category._id;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('religious_category', JSON.stringify({ name: category.name }));
          }
          router.push(`/religious-services/${target}`);
        }}
        onViewAll={() => router.push('/religious-services/category')}
      />

      {/* 2. CORE SERVICE CATEGORIES - Sacred Service Categories Redesign */}
      <SectionReveal>
        <div id="sacred-categories">
          <SacredServiceCategoriesSection
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
          />
        </div>
      </SectionReveal>

      {/* 3. TRENDING & POPULAR SERVICES */}
      <SectionReveal delay={0.1}>
        <TrendingServicesSection
          services={featuredServices.length > 0 ? featuredServices : latestServices.length > 0 ? latestServices : services}
          loading={featuredLoading && latestLoading && loading}
          onOpenService={(service) => {
            const target = service.slug || service._id;
            router.push(`/religious-services/${target}`);
          }}
          onBookNow={(service) => {
            const target = service.slug || service._id;
            router.push(`/religious-services/${target}`);
          }}
        />
      </SectionReveal>

      {/* 4. HOW IT WORKS */}
      <SectionReveal delay={0.2}>
        <HowItWorksSection />
      </SectionReveal>

      {/* Help Center Section - Religious Services Articles */}
      <KnowledgeSection vertical="religious" showNewsletter={false} className="py-6 sm:py-8 md:py-10" />

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

      {/* Mobile App Download Section (Placed immediately above Footer) */}
      <AppDownload />

      {/* Religious Book Modal */}
      <ReligiousQuestionnaireModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

