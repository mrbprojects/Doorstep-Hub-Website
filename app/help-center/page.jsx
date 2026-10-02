'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Tv,
  Scissors,
  PawPrint,
  Building2,
  Flame,
  ShoppingCart,
  ArrowRight,
  Plus,
  Minus,
  MessageCircle,
  Phone,
  Mail,
  Headphones,
  ShieldCheck,
  FileText,
  Truck,
  Award,
  HelpCircle,
  Tag
} from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';

// 6 Core Categories exactly as in the design
const HELP_CATEGORIES = [
  {
    id: 'appliance-repair',
    title: 'Appliance Repair',
    description: 'Guides for TV, AC, Fridge, Washing Machine, Microwave and other appliances.',
    articleCount: 24,
    icon: Tv,
    iconBg: 'bg-rose-100 text-rose-600',
    route: '/help-center/appliance-repair',
  },
  {
    id: 'salon-beauty-services',
    title: 'Salon & Beauty Services',
    description: 'Booking, services, pricing and technician details.',
    articleCount: 12,
    icon: Scissors,
    iconBg: 'bg-pink-100 text-pink-600',
    route: '/help-center/salon-beauty-services',
  },
  {
    id: 'pet-care-services',
    title: 'Pet Care Services',
    description: 'Grooming, vaccination, booking process and care tips.',
    articleCount: 10,
    icon: PawPrint,
    iconBg: 'bg-amber-100 text-amber-600',
    route: '/help-center/pet-care-services',
  },
  {
    id: 'pg-hostel',
    title: 'PG & Hostel',
    description: 'Booking, property details, facilities and policies.',
    articleCount: 8,
    icon: Building2,
    iconBg: 'bg-sky-100 text-sky-600',
    route: '/help-center/pg-hostel',
  },
  {
    id: 'pooja-religious-services',
    title: 'Pooja & Religious Services',
    description: 'Pandit booking, rituals, packages and guidelines.',
    articleCount: 11,
    icon: Flame,
    iconBg: 'bg-amber-100 text-amber-700',
    route: '/help-center/pooja-religious-services',
  },
  {
    id: 'buy-sell-old-things',
    title: 'Buy & Sell Old Things',
    description: 'Posting ads, buying, selling and safety tips.',
    articleCount: 9,
    icon: ShoppingCart,
    iconBg: 'bg-teal-100 text-[#037166]',
    route: '/help-center/buy-sell-old-things',
  },
];

// Popular Step-by-Step Guides exactly as in the design
const POPULAR_GUIDES = [
  {
    id: 'g1',
    category: 'AC REPAIR',
    title: 'Why is My AC Not Cooling? Causes & Solutions',
    description: 'Common reasons for poor cooling and how to fix them.',
    image: '/help-center/guide-ac.jpg',
    route: '/help-center/appliance-repair',
  },
  {
    id: 'g2',
    category: 'REFRIGERATOR',
    title: 'How to Maintain Your Refrigerator for Longer Life',
    description: 'Simple tips to keep your fridge working efficiently.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    route: '/help-center/appliance-repair',
  },
  {
    id: 'g3',
    category: 'WASHING MACHINE',
    title: "Washing Machine Not Spinning? Here's What to Do",
    description: 'Step-by-step troubleshooting guide.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80',
    route: '/help-center/appliance-repair',
  },
  {
    id: 'g4',
    category: 'TV & LAPTOP',
    title: 'LED TV Black Screen – Possible Causes and Fixes',
    description: 'How to identify and fix common screen issues.',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
    route: '/help-center/appliance-repair',
  },
];

// Core FAQs exactly matching the screenshot
const FAQS = [
  {
    question: 'How can I book a service?',
    answer:
      'You can book a service directly through the Doorstep Hub website or mobile app. Simply select your appliance or home service, choose your preferred date and time slot, enter your address, and confirm. A verified technician will arrive at your doorstep on time.',
  },
  {
    question: 'Can I reschedule or cancel my booking?',
    answer:
      'Yes, you can easily reschedule or cancel your appointment free of charge before the technician arrives at your home. Simply go to your Account Dashboard or call our support line at +91 809 695 9696.',
  },
  {
    question: 'Do you provide warranty on repairs?',
    answer:
      'Yes! Most appliance repair services completed by Doorstep Hub verified experts include up to 30 to 90 days service and spare parts warranty depending on the service category.',
  },
  {
    question: 'How are service charges calculated?',
    answer:
      'We follow 100% transparent pricing. Our charges consist of a standard diagnostic inspection fee, plus standardized part/labor rates if you choose to proceed with the repair. No hidden fees or surprise charges.',
  },
  {
    question: 'Are your technicians verified?',
    answer:
      'Yes, 100% of our technicians undergo rigorous identity verification, criminal background checks, and practical skills evaluations to ensure safe, professional service at your home.',
  },
  {
    question: 'In which cities are your services available?',
    answer:
      'Doorstep Hub operates across major metropolitan areas and tier-1/tier-2 cities across India, including Bangalore, Hyderabad, Mumbai, Delhi-NCR, Chennai, Pune, Vizag, and Vijayawada.',
  },
];

const POPULAR_SEARCHES = [
  'Appliance Repair',
  'AMC Plans',
  'Booking Guide',
  'Pricing & Warranty',
  'Technician',
  'Payments',
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // First item open by default

  const { policy: contextPolicy } = useGlobalSettings() || {};
  const supportPhone = contextPolicy?.phone || '+91 809 695 9696';
  const supportEmail = contextPolicy?.email || 'support@doorstephub.com';
  const whatsappClean = String(contextPolicy?.whatsapp || '918096959696').replace(/[^0-9]/g, '');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter(
      (faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const section = document.getElementById('faqs-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePillClick = (term) => {
    setSearchQuery(term);
    const section = document.getElementById('faqs-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col antialiased">
      <Header />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ebf7f5] via-[#f7fcfb] to-white pt-28 pb-14 sm:pt-32 sm:pb-20 border-b border-teal-100/50">
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-[350px] h-[350px] bg-emerald-100/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-left"
            >
              {/* Eyebrow Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 text-[#037166] text-xs font-bold uppercase tracking-wider mb-5">
                <Tag className="w-3.5 h-3.5 text-[#037166]" />
                <span>Doorstep Hub Help Center</span>
              </div>

              {/* H1 Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-gray-900 leading-[1.12] mb-4 tracking-tight">
                How can we <span className="text-[#037166]">help you</span> today?
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-8 max-w-xl leading-relaxed">
                Find answers, guides and step-by-step solutions for appliance repairs, home maintenance, AMC plans, bookings and more.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white rounded-full shadow-lg shadow-teal-950/5 border border-gray-200 p-1.5 sm:p-2 max-w-xl mb-4 focus-within:border-[#037166] focus-within:ring-2 focus-within:ring-[#037166]/20 transition-all"
              >
                <Search className="w-5 h-5 text-gray-400 ml-3.5 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, guides and FAQs..."
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base outline-none pr-3"
                />
                <button
                  type="submit"
                  className="bg-[#037166] hover:bg-[#025a51] text-white px-7 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-gray-800 mr-1">Popular searches:</span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePillClick(term)}
                    className="px-3 py-1 rounded-md bg-white border border-gray-200/90 text-gray-700 text-xs font-medium hover:border-[#037166] hover:text-[#037166] shadow-xs hover:shadow-sm transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white">
                <Image
                  src="/help-center/hero-technician.jpg"
                  alt="Doorstep Hub Verified Appliance Repair Technician"
                  fill
                  priority
                  className="object-cover object-center"
                />

                {/* Floating Benefit Card (Top Right) */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-gray-100 z-20 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
                    <ShieldCheck className="w-4 h-4 text-[#037166]" />
                    <span>Verified Technicians</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
                    <FileText className="w-4 h-4 text-[#037166]" />
                    <span>Transparent Pricing</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
                    <Truck className="w-4 h-4 text-[#037166]" />
                    <span>Doorstep Service</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
                    <Award className="w-4 h-4 text-[#037166]" />
                    <span>Service Warranty</span>
                  </div>
                </div>

                {/* Floating Trust Badge (Bottom Left/Center) */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-teal-100 z-20 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#037166] flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">Trusted Home Services</div>
                    <div className="text-[10px] text-gray-500 font-medium">Professional. Safe. Reliable.</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. BROWSE HELP TOPICS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-[#037166] mb-2">
              BROWSE HELP TOPICS
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2.5 tracking-tight">
              Find the help you need
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Explore help topics by choosing a category below
            </p>
          </div>

          {/* 6 Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {HELP_CATEGORIES.map((cat, index) => {
              const IconComp = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className="h-full"
                >
                  <Link
                    href={cat.route}
                    className="h-full bg-white rounded-2xl border border-gray-200/90 p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-[#037166]/40 transition-all duration-300 group block"
                  >
                    <div>
                      {/* Round Icon */}
                      <div className={`w-14 h-14 rounded-full ${cat.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base mb-2 group-hover:text-[#037166] transition-colors leading-snug">
                        {cat.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                        {cat.description}
                      </p>
                    </div>

                    {/* Bottom Count & Arrow */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-semibold text-gray-600 group-hover:text-[#037166] transition-colors">
                      <span>{cat.articleCount} articles</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. POPULAR GUIDES & ARTICLES
          ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 bg-[#f9fbfb] border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#037166] mb-1">
                POPULAR GUIDES & ARTICLES
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight">
                Step-by-step guides for you
              </h2>
              <p className="text-gray-500 text-sm">
                Read our most helpful articles and tutorials
              </p>
            </div>
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#037166] hover:underline shrink-0"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Article Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_GUIDES.map((guide, idx) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="h-full"
              >
                <Link
                  href={guide.route}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group block"
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={guide.image}
                      alt={guide.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <span className="inline-block bg-[#DEF2EF] text-[#037166] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wider w-fit mb-2.5">
                      {guide.category}
                    </span>
                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug mb-2 group-hover:text-[#037166] transition-colors line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {guide.description}
                    </p>
                    <div className="text-xs font-bold text-[#037166] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FREQUENTLY ASKED QUESTIONS
          ───────────────────────────────────────────────────────────── */}
      <section id="faqs-section" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#e7f6f3] via-[#f1faf8] to-[#e8f6f4] rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-teal-100/70 shadow-sm">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Heading, Button, 3D Character */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#037166] mb-2">
                  <HelpCircle className="w-4 h-4 text-[#037166]" />
                  <span>FREQUENTLY ASKED QUESTIONS</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
                  Quick Answers to Common Questions
                </h2>

                <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-sm leading-relaxed">
                  Get instant answers to the most common questions about Doorstep Hub services.
                </p>

                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === null ? 0 : null)}
                  className="inline-flex items-center gap-2 bg-[#037166] hover:bg-[#025a51] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all mb-6 lg:mb-8"
                >
                  <span>View All FAQs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 3D Character Avatar */}
                <div className="relative w-48 sm:w-56 lg:w-60 h-48 sm:h-56 lg:h-60 mt-auto">
                  <Image
                    src="/help-center/faq-avatar.png"
                    alt="Doorstep Hub Customer Support FAQ Assistant"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Right Column: FAQ Accordion List */}
              <div className="lg:col-span-7 space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <motion.div
                      key={index}
                      initial={false}
                      className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden transition-all duration-200 hover:border-[#037166]/40"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                      >
                        <span className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug">
                          {faq.question}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isOpen ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM SUPPORT & CONTACT CARDS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Chat with Support */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#037166]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#037166] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Chat with Support</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Get quick help from our support team.
                </p>
              </div>
              <a
                href={`https://wa.me/${whatsappClean}?text=Hi%20Doorstep%20Hub%20Support`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#037166] inline-flex items-center gap-1.5 hover:underline"
              >
                <span>Start Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 2: Call Us */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#037166]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#037166] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Call Us</h3>
                <a
                  href="tel:+918096959696"
                  className="text-sm font-black text-[#037166] block mb-1 hover:underline"
                >
                  +91 809 695 9696
                </a>
                <p className="text-xs text-gray-500">Mon - Sat, 9 AM - 7 PM</p>
              </div>
            </div>

            {/* Card 3: Email Support */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#037166]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#037166] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Email Support</h3>
                <a
                  href="mailto:support@doorstephub.com"
                  className="text-sm font-black text-[#037166] block mb-1 hover:underline truncate"
                >
                  support@doorstephub.com
                </a>
                <p className="text-xs text-gray-500">We'll respond within 24 hours.</p>
              </div>
            </div>

            {/* Card 4: Request a Callback */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#037166]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#037166] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Request a Callback</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Prefer a call? We'll call you back at your convenience.
                </p>
              </div>
              <Link
                href="/book-appointment"
                className="text-xs font-bold text-[#037166] inline-flex items-center gap-1.5 hover:underline"
              >
                <span>Request Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
