'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';
import { normalizeArticle } from '@/components/help-center/helpCenterData';

// Dedicated high-fidelity reference fallbacks per business vertical
const FALLBACK_BY_VERTICAL = {
  'appliance-repair': [
    {
      id: 'ref-app-1',
      title: 'How to Prepare Your Appliance Before a Technician Visit',
      category: 'APPLIANCE REPAIR',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/How_to_Prepare_Your_Appliance_Before_a_Technician_Visit.webp',
      fallbackImage: '/hero-technician.jpg',
      excerpt: 'Essential tips to prepare your home appliance safely before an expert technician arrives for inspection and repair.',
      slug: 'how-to-prepare-your-appliance-before-a-technician-visit',
      categorySlug: 'appliance-repair',
    },
    {
      id: 'ref-app-2',
      title: 'When Should You Repair or Replace a Home Appliance?',
      category: 'APPLIANCE REPAIR',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/When_Should_You_Repair_or_Replace_a_Home_Appliance.webp',
      fallbackImage: '/hero-technician.jpg',
      excerpt: 'Understand whether it is more cost-effective to repair your existing appliance or invest in a new model.',
      slug: 'when-should-you-repair-or-replace-a-home-appliance',
      categorySlug: 'appliance-repair',
    },
    {
      id: 'ref-app-3',
      title: 'Refrigerator Not Cooling? What You Should Check First',
      category: 'APPLIANCE REPAIR',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/Refrigerator_Not_Cooling_What_You_Should_Check_First.webp',
      fallbackImage: '/hero-technician.jpg',
      excerpt: 'Simple troubleshooting steps for common refrigerator cooling issues before booking a repair technician.',
      slug: 'refrigerator-not-cooling-what-you-should-check-first',
      categorySlug: 'appliance-repair',
    },
    {
      id: 'ref-app-4',
      title: 'Why Is My AC Not Cooling? Common Causes and Solutions',
      category: 'APPLIANCE REPAIR',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/Why_Is_My_AC_Not_Cooling_Common_Causes_and_Solutions.webp',
      fallbackImage: '/hero-technician.jpg',
      excerpt: 'Learn the primary reasons why your air conditioner might not be cooling efficiently and how to fix it.',
      slug: 'why-is-my-ac-not-cooling-common-causes-and-solutions',
      categorySlug: 'appliance-repair',
    },
  ],
  'pooja-religious-services': [
    {
      id: 'ref-rel-1',
      title: 'How Do I Contact the Pandit About Ceremony Requirements?',
      category: 'RELIGIOUS SERVICES',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-2.webp',
      fallbackImage: '/Bharath.png',
      excerpt: 'Learn how to communicate with a pandit after booking, share your ceremony details, and ask questions...',
      slug: 'how-do-i-contact-the-pandit-about-ceremony-requirements',
      categorySlug: 'pooja-religious-services',
    },
    {
      id: 'ref-rel-2',
      title: 'How Do I Book a Housewarming Pooja?',
      category: 'RELIGIOUS SERVICES',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-3.webp',
      fallbackImage: '/Bharath.png',
      excerpt: 'Follow this step-by-step guide to book a Griha Pravesh or Housewarming Pooja on Doorstep Hub with ease.',
      slug: 'how-do-i-book-a-housewarming-pooja',
      categorySlug: 'pooja-religious-services',
    },
    {
      id: 'ref-rel-3',
      title: 'What Should I Prepare Before the Pandit Arrives?',
      category: 'RELIGIOUS SERVICES',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-4.webp',
      fallbackImage: '/Bharath.png',
      excerpt: 'A complete checklist of items, spiritual setup, and important preparations to ensure a smooth pooja service at your home.',
      slug: 'prepare-before-pandit-arrives',
      categorySlug: 'pooja-religious-services',
    },
    {
      id: 'ref-rel-4',
      title: 'How Are Pooja Service Charges Calculated?',
      category: 'RELIGIOUS SERVICES',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-5.webp',
      fallbackImage: '/Bharath.png',
      excerpt: "Understand how pooja service pricing is determined, what's included, and factors that may affect the cost.",
      slug: 'pooja-service-charges',
      categorySlug: 'pooja-religious-services',
    },
  ],
  'spa-salon': [
    {
      id: 'ref-spa-1',
      title: 'Salon Service Safety and Hygiene Tips for Customers',
      category: 'SALON & BEAUTY',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/Salon_Service_Safety_and_Hygiene_Tips_for_Customers.webp',
      fallbackImage: '/spa-pet-women.png',
      excerpt: 'Key safety practices, sanitized tools, and hygiene standards maintained during doorstep salon and beauty treatments.',
      slug: 'salon-safety-hygiene-tips',
      categorySlug: 'salon-beauty-services',
    },
    {
      id: 'ref-spa-2',
      title: 'Pet Grooming Safety Tips Every Owner Should Know',
      category: 'PET CARE',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/Pet_Grooming_Safety_Tips_Every_Owner_Should_Know.webp',
      fallbackImage: '/spa-pet-hero.png',
      excerpt: 'Essential advice for keeping pet grooming stress-free and safe for dogs and cats during home visits.',
      slug: 'pet-grooming-safety-tips',
      categorySlug: 'pet-care-services',
    },
    {
      id: 'ref-spa-3',
      title: 'How Do I Choose a Pet Care Provider?',
      category: 'PET CARE',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/How_Do_I_Choose_a_Pet_Care_Provider.webp',
      fallbackImage: '/spa-pet-hero.png',
      excerpt: 'What to look for when choosing verified pet care and grooming professionals for your furry companions.',
      slug: 'choose-pet-care-provider',
      categorySlug: 'pet-care-services',
    },
    {
      id: 'ref-spa-4',
      title: 'How Do I Book a Salon or Beauty Service on Doorstep Hub?',
      category: 'SALON & BEAUTY',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/How_Do_I_Book_a_Salon_or_Beauty_Service_on_Doorstep_Hub.webp',
      fallbackImage: '/spa-pet-women.png',
      excerpt: 'Simple steps to schedule an at-home salon session, choose services, and connect with certified beauticians.',
      slug: 'book-salon-beauty-service',
      categorySlug: 'salon-beauty-services',
    },
  ],
  'pg-hostel': [
    {
      id: 'ref-pg-1',
      title: 'What Should I Check Before Booking a PG or Hostel?',
      category: 'PG & HOSTEL',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
      fallbackImage: '/categories-hero-bg.jpg',
      excerpt: 'A comprehensive checklist for reviewing rooms, food, wifi, security deposit, and house rules before moving in.',
      slug: 'check-before-booking-pg-hostel',
      categorySlug: 'pg-hostel',
    },
    {
      id: 'ref-pg-2',
      title: 'Understanding PG Security Deposits and Rent Agreements',
      category: 'PG & HOSTEL',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      fallbackImage: '/categories-hero-bg.jpg',
      excerpt: 'Everything you need to know about lease terms, refund policies, maintenance charges, and notice periods.',
      slug: 'pg-security-deposits-agreements',
      categorySlug: 'pg-hostel',
    },
    {
      id: 'ref-pg-3',
      title: 'Essential Amenities Checklist for Student & Working Hostels',
      category: 'PG & HOSTEL',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
      fallbackImage: '/categories-hero-bg.jpg',
      excerpt: 'Key facilities to prioritize including high-speed internet, power backup, hygienic meals, and laundry services.',
      slug: 'essential-amenities-pg-hostel',
      categorySlug: 'pg-hostel',
    },
    {
      id: 'ref-pg-4',
      title: 'Roommate Etiquette and Rules in Shared Accommodations',
      category: 'PG & HOSTEL',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      fallbackImage: '/categories-hero-bg.jpg',
      excerpt: 'Helpful guidelines for respectful living, space sharing, quiet hours, and maintaining common area cleanliness.',
      slug: 'roommate-etiquette-shared-accommodations',
      categorySlug: 'pg-hostel',
    },
  ],
  'buy-sell-old-things': [
    {
      id: 'ref-bs-1',
      title: 'What Should I Do After My Item Is Sold?',
      category: 'BUY & SELL',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/What_Should_I_Do_After_My_Item_Is_Sold-2.webp',
      fallbackImage: '/right-side-image.png',
      excerpt: 'Follow this guide on safely packing, scheduling pickup, and wrapping up transactions once an item is sold.',
      slug: 'sold-item-next-steps',
      categorySlug: 'buy-sell-old-things',
    },
    {
      id: 'ref-bs-2',
      title: 'How Do I Edit or Remove My Used-Item Listing?',
      category: 'BUY & SELL',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/How_Do_I_Edit_or_Remove_My_Used-Item_Listing.webp',
      fallbackImage: '/right-side-image.png',
      excerpt: 'Keeping your listing accurate and updated helps buyers know what is currently available.',
      slug: 'edit-remove-used-item-listing',
      categorySlug: 'buy-sell-old-things',
    },
    {
      id: 'ref-bs-3',
      title: 'How Can Buyers and Sellers Avoid Online Marketplace Scams?',
      category: 'BUY & SELL',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/How_Can_Buyers_and_Sellers_Avoid_Online_Marketplace_Scams.webp',
      fallbackImage: '/right-side-image.png',
      excerpt: 'Important safety practices, payment tips, and verification advice when buying and selling second-hand goods.',
      slug: 'avoid-marketplace-scams',
      categorySlug: 'buy-sell-old-things',
    },
    {
      id: 'ref-bs-4',
      title: 'What Should I Check Before Buying a Used Item?',
      category: 'BUY & SELL',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/What_Should_I_Check_Before_Buying_a_Used_Item.webp',
      fallbackImage: '/right-side-image.png',
      excerpt: 'A practical checklist for inspecting electronics, appliances, and furniture before completing a purchase.',
      slug: 'used-item-buying-checklist',
      categorySlug: 'buy-sell-old-things',
    },
  ],
  // Default diverse reference articles for Home page (1 from each vertical)
  'default': [
    {
      id: 'ref-def-1',
      title: 'How to Prepare Your Appliance Before a Technician Visit',
      category: 'APPLIANCE REPAIR',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/How_to_Prepare_Your_Appliance_Before_a_Technician_Visit.webp',
      fallbackImage: '/hero-technician.jpg',
      excerpt: 'Essential tips to prepare your home appliance safely before an expert technician arrives for inspection and repair.',
      slug: 'how-to-prepare-your-appliance-before-a-technician-visit',
      categorySlug: 'appliance-repair',
    },
    {
      id: 'ref-def-2',
      title: 'How Do I Contact the Pandit About Ceremony Requirements?',
      category: 'RELIGIOUS SERVICES',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-2.webp',
      fallbackImage: '/Bharath.png',
      excerpt: 'Learn how to communicate with a pandit after booking, share your ceremony details, and ask questions...',
      slug: 'how-do-i-contact-the-pandit-about-ceremony-requirements',
      categorySlug: 'pooja-religious-services',
    },
    {
      id: 'ref-def-3',
      title: 'Salon Service Safety and Hygiene Tips for Customers',
      category: 'SALON & BEAUTY',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/Salon_Service_Safety_and_Hygiene_Tips_for_Customers.webp',
      fallbackImage: '/spa-pet-women.png',
      excerpt: 'Key safety practices, sanitized tools, and hygiene standards maintained during doorstep salon and beauty treatments.',
      slug: 'salon-safety-hygiene-tips',
      categorySlug: 'salon-beauty-services',
    },
    {
      id: 'ref-def-4',
      title: 'Pet Grooming Safety Tips Every Owner Should Know',
      category: 'PET CARE',
      readTime: '5 min read',
      image: 'https://api.doorstephub.com/uploads/knowledge_base/Pet_Grooming_Safety_Tips_Every_Owner_Should_Know.webp',
      fallbackImage: '/spa-pet-hero.png',
      excerpt: 'Essential advice for keeping pet grooming stress-free and safe for dogs and cats during home visits.',
      slug: 'pet-grooming-safety-tips',
      categorySlug: 'pet-care-services',
    },
  ],
};

function resolveTargetSlugs(vertical, categorySlug) {
  if (categorySlug) {
    return Array.isArray(categorySlug) ? categorySlug : [categorySlug];
  }
  if (!vertical) return null;
  const v = String(vertical).toLowerCase().trim();
  if (v === 'appliances' || v === 'appliance' || v === 'appliance-repair') {
    return ['appliance-repair'];
  }
  if (v === 'religious' || v === 'religious-services' || v === 'pooja' || v === 'pooja-religious-services') {
    return ['pooja-religious-services'];
  }
  if (v === 'spa-salon' || v === 'spa' || v === 'salon' || v === 'pet' || v === 'petcare') {
    return ['salon-beauty-services', 'pet-care-services'];
  }
  if (v === 'pghostels' || v === 'pg-hostel' || v === 'hostel' || v === 'hostels') {
    return ['pg-hostel'];
  }
  if (v === 'sell-buy' || v === 'buy-sell' || v === 'buy-sell-old-things') {
    return ['buy-sell-old-things'];
  }
  return [v];
}

function getFallbackArticles(targetSlugs) {
  if (!targetSlugs || targetSlugs.length === 0) {
    return FALLBACK_BY_VERTICAL['default'];
  }
  if (targetSlugs.includes('appliance-repair')) {
    return FALLBACK_BY_VERTICAL['appliance-repair'];
  }
  if (targetSlugs.includes('pooja-religious-services')) {
    return FALLBACK_BY_VERTICAL['pooja-religious-services'];
  }
  if (targetSlugs.includes('salon-beauty-services') || targetSlugs.includes('pet-care-services')) {
    return FALLBACK_BY_VERTICAL['spa-salon'];
  }
  if (targetSlugs.includes('pg-hostel')) {
    return FALLBACK_BY_VERTICAL['pg-hostel'];
  }
  if (targetSlugs.includes('buy-sell-old-things')) {
    return FALLBACK_BY_VERTICAL['buy-sell-old-things'];
  }
  return FALLBACK_BY_VERTICAL['default'];
}

function getDefaultMetadata(targetSlugs) {
  if (!targetSlugs || targetSlugs.length === 0) {
    return {
      badgeText: 'HELP CENTER RESOURCES',
      subtitle: 'Explore helpful guides, answers, and service information for Doorstep Hub users.',
      exploreHref: '/help-center',
    };
  }
  if (targetSlugs.includes('appliance-repair')) {
    return {
      badgeText: 'APPLIANCE REPAIR GUIDES',
      subtitle: 'Troubleshooting guides, appliance maintenance advice, and professional repair tips.',
      exploreHref: '/help-center/appliance-repair',
    };
  }
  if (targetSlugs.includes('pooja-religious-services')) {
    return {
      badgeText: 'RELIGIOUS SERVICES GUIDES',
      subtitle: 'Vedic ceremony checklists, samagri preparation, and auspicious pooja insights.',
      exploreHref: '/help-center/pooja-religious-services',
    };
  }
  if (targetSlugs.includes('salon-beauty-services') || targetSlugs.includes('pet-care-services')) {
    return {
      badgeText: 'SPA & PET CARE GUIDES',
      subtitle: 'Hygienic salon tips, beauty maintenance, and doorstep pet care guidelines.',
      exploreHref: '/help-center/salon-beauty-services',
    };
  }
  if (targetSlugs.includes('pg-hostel')) {
    return {
      badgeText: 'PG & HOSTEL GUIDES',
      subtitle: 'Room checklists, rent agreement insights, and hostel living advice.',
      exploreHref: '/help-center/pg-hostel',
    };
  }
  if (targetSlugs.includes('buy-sell-old-things')) {
    return {
      badgeText: 'BUY & SELL GUIDES',
      subtitle: 'Valuation advice, buyer checklists, and safe doorstep transaction tips.',
      exploreHref: '/help-center/buy-sell-old-things',
    };
  }
  return {
    badgeText: 'HELP CENTER RESOURCES',
    subtitle: 'Explore helpful guides, answers, and service information for Doorstep Hub users.',
    exploreHref: '/help-center',
  };
}

export function KnowledgeSection({
  initialArticles,
  categorySlug,
  vertical,
  title,
  subtitle: customSubtitle,
  badgeText: customBadgeText,
  showNewsletter = true,
  showExploreAll = true,
  exploreAllHref,
  className = '',
}) {
  const targetSlugs = resolveTargetSlugs(vertical, categorySlug);
  const metaDefaults = getDefaultMetadata(targetSlugs);
  const fallbackList = getFallbackArticles(targetSlugs);

  const [articles, setArticles] = useState(
    initialArticles && initialArticles.length >= 4 ? initialArticles.slice(0, 4) : fallbackList
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base?limit=100`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0 && isMounted) {
          // Normalize all articles with automatic category detection
          const allNormalized = data.data.map(item => normalizeArticle(item)).filter(Boolean);

          let selectedArticles = [];

          if (targetSlugs && targetSlugs.length > 0) {
            // Landing page specific vertical filtering: only show articles belonging to this vertical!
            const verticalPool = allNormalized.filter(art =>
              art.slug && targetSlugs.includes(art.categorySlug)
            );

            if (verticalPool.length > 0) {
              // Pick up to 4 articles for this vertical
              selectedArticles = verticalPool.slice(0, 4);

              // If fewer than 4 from API, supplement with this vertical's curated fallbacks
              if (selectedArticles.length < 4) {
                const existingSlugs = new Set(selectedArticles.map(a => a.slug));
                for (const fallback of fallbackList) {
                  if (selectedArticles.length >= 4) break;
                  if (!existingSlugs.has(fallback.slug)) {
                    selectedArticles.push(fallback);
                    existingSlugs.add(fallback.slug);
                  }
                }
              }
            } else {
              selectedArticles = fallbackList;
            }
          } else {
            // HOME PAGE ONLY: Show diverse articles across all distinct business verticals (1 from each)
            const grouped = {};
            allNormalized.forEach(art => {
              if (!art.slug) return;
              const cat = art.categorySlug || 'appliance-repair';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(art);
            });

            const availableVerticals = Object.keys(grouped).filter(slug => grouped[slug].length > 0);
            const shuffledVerticals = [...availableVerticals].sort(() => 0.5 - Math.random());

            for (const vSlug of shuffledVerticals) {
              if (selectedArticles.length >= 4) break;
              const pool = grouped[vSlug];
              if (pool && pool.length > 0) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                selectedArticles.push(pool[randomIndex]);
              }
            }

            // Fill remaining slots if < 4
            if (selectedArticles.length < 4) {
              const remaining = allNormalized.filter(
                a => !selectedArticles.some(s => s.slug === a.slug)
              );
              const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
              while (selectedArticles.length < 4 && shuffledRemaining.length > 0) {
                selectedArticles.push(shuffledRemaining.pop());
              }
            }
          }

          const mappedArticles = selectedArticles.map(normalized => ({
            id: normalized.id,
            title: normalized.title,
            category: (normalized.category || 'SERVICE').toUpperCase(),
            readTime: normalized.readTime || '5 min read',
            image: normalized.image,
            fallbackImage: targetSlugs && targetSlugs.includes('pooja-religious-services') ? '/Bharath.png' : '/hero-technician.jpg',
            excerpt: normalized.excerpt,
            slug: normalized.slug,
            categorySlug: normalized.categorySlug || 'appliance-repair',
          }));

          if (isMounted && mappedArticles.length > 0) {
            setArticles(mappedArticles);
          }
        }
      } catch (error) {
        console.error('Error fetching Help Center articles:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticles();
    return () => { isMounted = false; };
  }, [vertical, categorySlug]);

  // Skeleton Card matching the 4-card grid
  const SkeletonCard = () => (
    <div className="bg-white rounded-[20px] border border-gray-100 p-4 shadow-sm animate-pulse flex flex-col justify-between h-[380px]">
      <div>
        <div className="aspect-[16/10] w-full rounded-xl bg-slate-100 mb-4" />
        <div className="h-4 w-28 bg-teal-100/60 rounded-full mb-3" />
        <div className="h-5 w-4/5 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-full bg-slate-50 rounded mb-1" />
        <div className="h-4 w-2/3 bg-slate-50 rounded" />
      </div>
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="h-4 w-16 bg-slate-100 rounded" />
        <div className="w-8 h-8 rounded-full bg-slate-100" />
      </div>
    </div>
  );

  const displayBadgeText = customBadgeText || metaDefaults.badgeText;
  const displaySubtitle = customSubtitle || metaDefaults.subtitle;
  const finalExploreHref = exploreAllHref || metaDefaults.exploreHref;

  const hasCustomPy = className && className.includes('py-');

  return (
    <section id="help-center-resources" className={`relative ${hasCustomPy ? '' : 'py-8 sm:py-10 lg:py-12'} overflow-hidden bg-white ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#008C8008,transparent_50%),radial-gradient(circle_at_bottom_left,#008C8005,transparent_50%)] pointer-events-none" />
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,140,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,140,128,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching Visual Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9F8F6] border border-[#BCE3DE] text-[#008C80] text-xs font-black uppercase tracking-wider mb-2.5 shadow-2xs">
            <BookOpen className="w-4 h-4 text-[#008C80]" />
            <span>{displayBadgeText}</span>
          </div>

          {/* Title: Help Center with mint accent marks */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101828] mb-2 tracking-tight">
            {title ? (
              title
            ) : (
              <>
                Help{' '}
                <span className="relative inline-block text-[#008C80]">
                  Center
                  {/* Playful Mint Brush Accent lines above "Center" */}
                  <span className="absolute -top-3.5 sm:-top-4 -right-1 flex gap-1 pointer-events-none select-none">
                    <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[25deg] transform origin-bottom opacity-90" />
                    <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[45deg] transform origin-bottom opacity-90" />
                  </span>
                </span>
              </>
            )}
          </h2>

          {/* Subtitle */}
          <p className="text-[#475467] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            {displaySubtitle}
          </p>
        </motion.div>

        {/* 4 Cards Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : articles.map((article, index) => {
                const articleUrl = article.slug
                  ? `/help-center/${article.categorySlug || 'appliance-repair'}/${article.slug}`
                  : '/help-center';

                return (
                  <motion.div
                    key={article.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="h-full"
                  >
                    <Link
                      href={articleUrl}
                      className="group bg-white rounded-[20px] border border-[#E4E7EC] hover:border-[#008C80]/50 p-4 flex flex-col justify-between h-full shadow-[0_4px_20px_-2px_rgba(16,24,40,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(0,140,128,0.12)] hover:-translate-y-1 transition-all duration-300 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C80]"
                    >
                      <div>
                        {/* Rounded Article Image */}
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                          <ImageWithFallback
                            src={article.image}
                            alt={article.title}
                            fallbackSrc={article.fallbackImage || '/hero-technician.jpg'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E9F8F6] text-[#008C80] text-[10px] font-extrabold uppercase tracking-wider">
                            {article.category || 'SERVICE'}
                          </span>
                        </div>

                        {/* Article Title */}
                        <h3 className="font-extrabold text-[#101828] text-base leading-snug mb-2 group-hover:text-[#008C80] transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Clean Excerpt (never raw HTML!) */}
                        <p className="text-[#475467] text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Card Footer: Read Time + Action Arrow */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7] text-xs text-[#667085] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#008C80]" />
                          <span>{article.readTime || '5 min read'}</span>
                        </div>

                        {/* Action Arrow Button */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E9F8F6] text-[#008C80] group-hover:bg-[#008C80] group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 shrink-0 shadow-2xs">
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>

        {/* Explore All Button */}
        {showExploreAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-6 sm:mt-8"
          >
            <Link
              href={finalExploreHref}
              className="btn-explore-all inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#008C80] hover:bg-[#006D65] !text-white font-extrabold text-xs sm:text-sm tracking-wider rounded-full shadow-md shadow-[#008C80]/15 hover:shadow-lg hover:scale-105 transition-all group"
              style={{ color: '#ffffff' }}
            >
              <span className="!text-white font-bold" style={{ color: '#ffffff' }}>Explore All</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 !text-white" style={{ color: '#ffffff', stroke: '#ffffff' }} />
            </Link>
          </motion.div>
        )}

        {/* Optional Newsletter Section */}
        {showNewsletter && (
          <div className="mt-8 sm:mt-10">
            <NewsletterWidget />
          </div>
        )}

      </div>
    </section>
  );
}

export default KnowledgeSection;

