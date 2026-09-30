'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    HelpCircle,
    BookOpen,
    User,
    Calendar,
    CreditCard,
    ShieldCheck,
    Briefcase,
    Shield,
    Smartphone,
    ArrowRight,
    Plus,
    Minus,
    Headphones,
    MessageCircle,
    CheckCircle2,
    Clock,
    Sparkles,
    ChevronRight,
    ExternalLink,
    Phone,
    Mail,
    Download
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { API_BASE_URL } from '@/config/env';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';

// 8 Core Doorstep Hub Help Topics with D-Hub Teal styling and direct platform routing
const HELP_TOPICS = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Everything you need to know about booking doorstep appliance and home services.',
        articleCount: 12,
        icon: Sparkles,
        bgColor: 'bg-[#DEF2EF]',
        textColor: 'text-[#037166]',
        borderColor: 'border-[#9ecbc3]/40',
        hoverBorder: 'hover:border-[#037166]',
        route: '#faqs-section',
    },
    {
        id: 'account-profile',
        title: 'Account & Profile',
        description: 'Manage your personal profile, addresses, WhatsApp OTP login, and notifications.',
        articleCount: 8,
        icon: User,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        hoverBorder: 'hover:border-[#037166]',
        route: '/account',
    },
    {
        id: 'bookings-services',
        title: 'Bookings & Services',
        description: 'Track technician arrival, reschedule visits, service warranty, and door safety.',
        articleCount: 16,
        icon: Calendar,
        bgColor: 'bg-teal-50',
        textColor: 'text-[#037166]',
        borderColor: 'border-teal-200',
        hoverBorder: 'hover:border-[#037166]',
        route: '/book-appointment',
    },
    {
        id: 'billing-payments',
        title: 'Billing & Payments',
        description: 'Transparent pricing, online payment, Cash on Delivery, GST invoices, and refunds.',
        articleCount: 10,
        icon: CreditCard,
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-200',
        hoverBorder: 'hover:border-[#037166]',
        route: '/terms-conditions',
    },
    {
        id: 'trust-safety',
        title: 'Trust & Safety',
        description: 'Background-verified technicians, standard pricing, 30-day warranty, and data protection.',
        articleCount: 7,
        icon: ShieldCheck,
        bgColor: 'bg-[#DEF2EF]',
        textColor: 'text-[#037166]',
        borderColor: 'border-[#9ecbc3]/40',
        hoverBorder: 'hover:border-[#037166]',
        route: '/privacy-policy',
    },
    {
        id: 'partners-technicians',
        title: 'Partners & Technicians',
        description: 'Become a Doorstep Hub service partner, onboarding steps, provider app, and payouts.',
        articleCount: 14,
        icon: Briefcase,
        bgColor: 'bg-[#037166]/10',
        textColor: 'text-[#037166]',
        borderColor: 'border-[#037166]/20',
        hoverBorder: 'hover:border-[#037166]',
        route: '/service-partner',
    },
    {
        id: 'amc-subscriptions',
        title: 'AMC & Warranty',
        description: 'Annual maintenance contracts, scheduled preventive visits, and spare parts discounts.',
        articleCount: 9,
        icon: Shield,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        hoverBorder: 'hover:border-[#037166]',
        route: '/amc',
    },
    {
        id: 'mobile-app',
        title: 'Mobile App',
        description: 'Download the Doorstep Hub app, live GPS tracking, and real-time technician status.',
        articleCount: 6,
        icon: Smartphone,
        bgColor: 'bg-[#DEF2EF]',
        textColor: 'text-[#037166]',
        borderColor: 'border-[#9ecbc3]/40',
        hoverBorder: 'hover:border-[#037166]',
        route: '#app-download-section',
    },
];

// Fallback Doorstep Hub Curated Guides with D-Hub Teal badge colors
const DEFAULT_GUIDES = [
    {
        id: 'g1',
        title: 'How to schedule a doorstep appliance repair service',
        category: 'APPLIANCE REPAIR',
        categoryColor: 'bg-[#DEF2EF] text-[#037166]',
        readTime: '3 min read',
        summary: 'Learn how to select your brand, pick a convenient time slot, and confirm a verified expert.',
        slug: 'how-to-schedule-appliance-repair',
    },
    {
        id: 'g2',
        title: 'Understanding Doorstep Hub AMC plans & warranty benefits',
        category: 'AMC & WARRANTY',
        categoryColor: 'bg-emerald-100 text-emerald-800',
        readTime: '4 min read',
        summary: 'Protect all home appliances with zero visiting charges, scheduled servicing, and discounted spares.',
        slug: 'amc-plans-benefits',
    },
    {
        id: 'g3',
        title: 'How to track technician arrival in real-time',
        category: 'BOOKINGS',
        categoryColor: 'bg-teal-100 text-teal-800',
        readTime: '2 min read',
        summary: 'Use the live map in your customer account to see technician location and estimated arrival time.',
        slug: 'track-technician-arrival',
    },
    {
        id: 'g4',
        title: 'Pricing transparency: Diagnostic fee & rate card explained',
        category: 'BILLING & PRICING',
        categoryColor: 'bg-[#DEF2EF] text-[#037166]',
        readTime: '3 min read',
        summary: 'See our standard inspection charges, repair estimates, and 100% upfront quote policy.',
        slug: 'pricing-and-rate-card',
    },
];

// Core Doorstep Hub FAQs
const DEFAULT_FAQS = [
    {
        question: 'What is Doorstep Hub?',
        answer: 'Doorstep Hub is India\'s trusted home and appliance service platform delivering professional repair, maintenance, and AMC services at your doorstep with verified technicians.',
        category: 'getting-started',
    },
    {
        question: 'What services does Doorstep Hub offer?',
        answer: 'We provide repair and maintenance for washing machines, refrigerators, air conditioners, microwave ovens, televisions, water purifiers, electrical work, plumbing, painting, and AMC plans.',
        category: 'getting-started',
    },
    {
        question: 'How do I book a service technician?',
        answer: 'You can book directly through our website or mobile app by selecting your appliance/service, entering your address and phone number, and choosing your preferred visit time slot.',
        category: 'bookings-services',
    },
    {
        question: 'Are Doorstep Hub technicians verified and trained?',
        answer: 'Yes! Every technician undergoes a stringent background check, identity verification, and hands-on skill assessment before being dispatched to customer doorsteps.',
        category: 'trust-safety',
    },
    {
        question: 'What is the diagnostic / visiting inspection fee?',
        answer: 'We charge a nominal visiting fee for technician inspection. If you proceed with the repair service recommended by the technician, the inspection fee is often adjusted into the total bill.',
        category: 'billing-payments',
    },
    {
        question: 'Do repairs come with a service warranty?',
        answer: 'Yes. Most appliance repairs completed by Doorstep Hub verified experts include up to 30 to 90 days service and spare parts warranty depending on the service category.',
        category: 'trust-safety',
    },
    {
        question: 'What payment modes are accepted?',
        answer: 'We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net Banking, and wallet payments after the service is satisfactorily completed.',
        category: 'billing-payments',
    },
    {
        question: 'How does the Doorstep Hub AMC contract work?',
        answer: 'Our Annual Maintenance Contract (AMC) covers routine preventive servicing, priority technician dispatch, and discounts on replacement spare parts throughout the contract term.',
        category: 'amc-subscriptions',
    },
    {
        question: 'Can I reschedule or cancel my service booking?',
        answer: 'Yes, you can easily reschedule or cancel your appointment free of charge before the technician arrives at your premises from your Account Dashboard or by contacting support.',
        category: 'bookings-services',
    },
    {
        question: 'How can I register as a Service Partner or Vendor?',
        answer: 'Technicians and service centers can visit our "Become a Service Partner" portal, complete registration, and submit documents. Once approved by admin, you will receive customer leads.',
        category: 'partners-technicians',
    },
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTopic, setActiveTopic] = useState(null);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [faqs, setFaqs] = useState(DEFAULT_FAQS);
    const [guides, setGuides] = useState(DEFAULT_GUIDES);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Active App Download Tab ('customer' | 'partner')
    const [selectedAppTab, setSelectedAppTab] = useState('customer');

    // Context Global Settings
    const { policy: contextPolicy } = useGlobalSettings() || {};

    // Fetch live FAQs, Knowledge Base articles, and Global Settings from the Admin backend
    useEffect(() => {
        const fetchHelpData = async () => {
            try {
                // 1. Fetch FAQs from Admin API
                const faqRes = await fetch(`${API_BASE_URL}/app/products/faqs?applicationType=customer%20app`).catch(() => null);
                if (faqRes && faqRes.ok) {
                    const faqData = await faqRes.json();
                    if (faqData?.success && Array.isArray(faqData.data) && faqData.data.length > 0) {
                        const adminFaqs = faqData.data.map((item) => ({
                            question: item.question || item.title || item.faqQuestion,
                            answer: item.answer || item.description || item.faqAnswer,
                            category: item.category || 'general',
                        })).filter(f => f.question && f.answer);

                        if (adminFaqs.length > 0) {
                            setFaqs([...adminFaqs, ...DEFAULT_FAQS.filter(df => !adminFaqs.some(af => af.question.toLowerCase() === df.question.toLowerCase()))]);
                        }
                    }
                }

                // 2. Fetch Knowledge Base from Admin API
                const kbRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/knowledge-base`).catch(() => null);
                if (kbRes && kbRes.ok) {
                    const kbData = await kbRes.json();
                    if (kbData?.success && Array.isArray(kbData.data) && kbData.data.length > 0) {
                        const adminGuides = kbData.data.slice(0, 4).map((item, idx) => ({
                            id: item._id || `admin-${idx}`,
                            title: item.title,
                            category: item.subcategoryId?.name || item.categoryId?.name || 'GUIDE',
                            categoryColor: 'bg-[#DEF2EF] text-[#037166]',
                            readTime: item.readTime ? `${item.readTime} min read` : '3 min read',
                            summary: item.summary ? item.summary.replace(/<[^>]*>?/gm, '').substring(0, 110) + '...' : (item.description?.substring(0, 110) || '') + '...',
                            slug: item.slug || '',
                        }));
                        if (adminGuides.length > 0) {
                            setGuides(adminGuides);
                        }
                    }
                }

                // 3. Fetch Global Settings for Live Support Info
                const settingsRes = await fetch(`${API_BASE_URL}/app/get_global_settings`).catch(() => null);
                if (settingsRes && settingsRes.ok) {
                    const sData = await settingsRes.json();
                    if (sData?.policy) {
                        setSettings(sData.policy);
                    }
                }
            } catch (err) {
                console.warn('Error fetching live help data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHelpData();
    }, []);

    // Merge policy from context and direct API
    const activePolicy = settings || contextPolicy || {};

    // Dynamic Support Contact details from Admin Global Settings
    const supportPhone = activePolicy?.phone || '+91 888 668 8666';
    const supportEmail = activePolicy?.email || 'support@doorstephub.com';
    const rawWhatsapp = activePolicy?.whatsapp || activePolicy?.phone || '918886688666';
    const whatsappClean = String(rawWhatsapp).replace(/[^0-9]/g, '');

    // Dynamic Mobile App Links controlled by Admin Panel
    const customerAndroidLink = activePolicy?.customerAndroidAppLink
        || activePolicy?.playStore
        || 'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share';

    const customerIosLink = activePolicy?.customerIosAppLink
        || activePolicy?.appStore
        || 'https://apps.apple.com/in/app/doorstep-hub/id6475340236';

    const partnerAndroidLink = activePolicy?.vendorAndroidAppLink
        || activePolicy?.partnerAndroidAppLink
        || 'https://play.google.com/store/apps/details?id=com.doorstephub.partner';

    const partnerIosLink = activePolicy?.vendorIosAppLink
        || activePolicy?.partnerIosAppLink
        || 'https://apps.apple.com/in/app/doorstep-hub-partner/id6475340237';

    // Currently active download links depending on selected tab
    const activePlayStoreLink = selectedAppTab === 'customer' ? customerAndroidLink : partnerAndroidLink;
    const activeAppStoreLink = selectedAppTab === 'customer' ? customerIosLink : partnerIosLink;

    // Filter FAQs based on Search Query and Selected Topic
    const filteredFaqs = useMemo(() => {
        return faqs.filter((faq) => {
            const matchesSearch =
                !searchQuery ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTopic =
                !activeTopic ||
                faq.category === activeTopic ||
                (activeTopic === 'getting-started' && /how|what|book/i.test(faq.question)) ||
                (activeTopic === 'billing-payments' && /pay|price|fee|cod|gst|refund/i.test(faq.question)) ||
                (activeTopic === 'trust-safety' && /warranty|verify|safe|trained/i.test(faq.question)) ||
                (activeTopic === 'partners-technicians' && /partner|technician|vendor/i.test(faq.question)) ||
                (activeTopic === 'amc-subscriptions' && /amc|contract/i.test(faq.question));

            return matchesSearch && matchesTopic;
        });
    }, [faqs, searchQuery, activeTopic]);

    // Split FAQs into 2 columns for the responsive 2-column grid
    const { leftColFaqs, rightColFaqs } = useMemo(() => {
        const left = [];
        const right = [];
        filteredFaqs.forEach((faq, index) => {
            if (index % 2 === 0) left.push({ ...faq, globalIndex: index });
            else right.push({ ...faq, globalIndex: index });
        });
        return { leftColFaqs: left, rightColFaqs: right };
    }, [filteredFaqs]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const section = document.getElementById('faqs-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTopicClick = (topicId) => {
        if (activeTopic === topicId) {
            setActiveTopic(null);
        } else {
            setActiveTopic(topicId);
            const section = document.getElementById('faqs-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
            <Header />

            {/* ========================================================= */}
            {/* 1. HERO SECTION (D-Hub Signature Colors)                  */}
            {/* ========================================================= */}
            <section className="relative overflow-visible bg-gradient-to-b from-white via-[#f0f9f8] to-[#F8FAFC] pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 border-b border-[#037166]/15">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        
                        {/* Left Column: Heading & Search Bar */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* D-Hub Pill Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DEF2EF] border border-[#9ecbc3] text-[#037166] text-xs font-black tracking-wider uppercase shadow-2xs">
                                <Sparkles className="w-3.5 h-3.5 text-[#037166]" />
                                Doorstep Hub Help Center
                            </div>

                            {/* Main Title with D-Hub Gradient */}
                            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.12]">
                                How can we <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">help you</span> today?
                            </h1>

                            <p className="text-slate-600 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
                                Find answers, guides and step-by-step solutions for doorstep appliance repairs, home maintenance, and AMC subscriptions.
                            </p>

                            {/* Search Form with D-Hub Focus Ring and Gradient Button */}
                            <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
                                <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-[#037166]/10 border border-slate-200 p-2 focus-within:border-[#037166] focus-within:ring-2 focus-within:ring-[#037166]/20 transition-all">
                                    <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search for articles, guides and FAQs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full text-slate-900 placeholder:text-slate-400 text-sm sm:text-base bg-transparent border-0 outline-none px-2 py-2"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#025951] hover:to-[#037166] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-[#037166]/25 shrink-0"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>

                            {/* Popular Searches Pills */}
                            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                                <span className="text-slate-500 font-semibold">Popular Searches:</span>
                                {['Appliance Repair', 'AMC Plans', 'Partner Onboarding', 'Pricing & Warranty', 'Electrician'].map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setSearchQuery(tag)}
                                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#037166] hover:text-[#037166] text-slate-600 font-semibold transition-colors shadow-2xs"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Hero Visual Graphic with Floating Badges */}
                        <div className="lg:col-span-5 relative pt-4 sm:pt-6 lg:pt-2">
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                {/* Visual Card with Office/Service Photo */}
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-[4/3] group">
                                    <Image
                                        src="/hero-technician.jpg"
                                        alt="Doorstep Hub Verified Expert Support"
                                        fill
                                        className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-105"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />

                                    <div className="absolute bottom-5 left-5 right-5 text-white">
                                        <p className="text-xs font-bold text-[#04a99d] tracking-wide uppercase">Dedicated Assistance</p>
                                        <h3 className="text-lg font-black text-white">Doorstep Hub Care Team</h3>
                                        <p className="text-xs text-slate-300 mt-1">Ready to assist 24/7 with expert doorstep guidance.</p>
                                    </div>
                                </div>

                                {/* Floating Badge 1 (Top Right) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-[#037166]/15 flex items-center gap-3 z-20"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] flex items-center justify-center text-[#037166] shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-slate-900">100% Satisfaction</p>
                                        <p className="text-[11px] text-slate-500 font-medium">30-Day Service Warranty</p>
                                    </div>
                                </motion.div>

                                {/* Floating Badge 2 (Bottom Left) */}
                                <motion.div
                                    initial={{ opacity: 0, y: -15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute -bottom-5 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-[#037166]/15 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166] shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-slate-900">Fast Doorstep Arrival</p>
                                        <p className="text-[11px] text-slate-500 font-medium">60-Min Technician Dispatch</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 2. BROWSE HELP TOPICS SECTION (8 Cards Grid)              */}
            {/* ========================================================= */}
            <section className="py-16 lg:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center space-y-3 mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Browse Help Topics
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base font-medium max-w-lg mx-auto">
                        Find answers quickly by choosing a topic below
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {HELP_TOPICS.map((topic) => {
                        const Icon = topic.icon;
                        const isSelected = activeTopic === topic.id;
                        return (
                            <div
                                key={topic.id}
                                onClick={() => handleTopicClick(topic.id)}
                                className={`cursor-pointer group relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm hover:shadow-xl ${
                                    isSelected
                                        ? 'border-[#037166] ring-2 ring-[#037166]/20 bg-[#DEF2EF]/30'
                                        : `${topic.borderColor} ${topic.hoverBorder}`
                                }`}
                            >
                                <div className="space-y-4">
                                    {/* Icon Box */}
                                    <div className={`w-12 h-12 rounded-xl ${topic.bgColor} ${topic.textColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xs`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    {/* Title & Desc */}
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-[#037166] transition-colors">
                                            {topic.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1.5 min-h-[44px]">
                                            {topic.description}
                                        </p>
                                    </div>

                                    {/* Footer Link */}
                                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-[#037166] transition-colors border-t border-slate-100">
                                        <span>{topic.articleCount} articles / FAQs</span>
                                        <div className="flex items-center gap-1">
                                            {topic.route.startsWith('/') ? (
                                                <Link
                                                    href={topic.route}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:underline flex items-center gap-0.5 text-[#037166] mr-1"
                                                >
                                                    Open <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            ) : null}
                                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {activeTopic && (
                    <div className="mt-6 flex items-center justify-center">
                        <button
                            onClick={() => setActiveTopic(null)}
                            className="inline-flex items-center gap-2 text-xs font-bold text-[#037166] bg-[#DEF2EF] px-4 py-2 rounded-full border border-[#9ecbc3] hover:bg-[#cdebe6] transition-colors"
                        >
                            Filtering by topic: <span className="underline">{HELP_TOPICS.find(t => t.id === activeTopic)?.title}</span>
                            <span className="font-extrabold ml-1">✕ Clear</span>
                        </button>
                    </div>
                )}
            </section>

            {/* ========================================================= */}
            {/* 3. POPULAR GUIDES & ARTICLES SECTION                      */}
            {/* ========================================================= */}
            <section className="py-16 bg-white border-y border-[#037166]/15">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                        <div className="space-y-2">
                            <span className="text-xs font-black tracking-wider uppercase text-[#037166]">
                                STEP-BY-STEP TUTORIALS
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                Popular Guides &amp; Articles
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                Step-by-step tutorials &amp; helpful articles for home care
                            </p>
                        </div>
                        <Link
                            href="/knowledge"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#037166] hover:text-[#025951] transition-colors group"
                        >
                            View All Articles
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {guides.map((guide) => (
                            <div
                                key={guide.id}
                                className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#037166]/40 transition-all duration-300 shadow-2xs hover:shadow-xl hover:shadow-[#037166]/5 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${guide.categoryColor}`}>
                                            {guide.category}
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate-400">
                                            {guide.readTime}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#037166] transition-colors line-clamp-2">
                                        {guide.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                                        {guide.summary}
                                    </p>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-200/60">
                                    <Link
                                        href={guide.slug ? `/knowledge/${guide.slug}` : '/knowledge'}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#037166] group-hover:text-[#025951] transition-colors"
                                    >
                                        Read Article
                                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 4. FREQUENTLY ASKED QUESTIONS (2-Column Accordion Layout) */}
            {/* ========================================================= */}
            <section id="faqs-section" className="py-16 lg:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                    <div className="space-y-2">
                        <span className="text-xs font-black tracking-wider uppercase text-[#037166]">
                            GOT QUESTIONS? WE&apos;VE GOT ANSWERS
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">
                            Get quick answers to the most common questions about Doorstep Hub
                        </p>
                    </div>
                    <Link
                        href="/faqs"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#037166] hover:text-[#025a51] transition-colors group"
                    >
                        View All Legal FAQs
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-lg font-bold text-slate-900">No matching questions found</h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                            Try searching for something else or contact our 24/7 care team.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveTopic(null); }}
                            className="bg-[#037166] text-white text-xs font-bold px-4 py-2 rounded-xl"
                        >
                            Reset Search Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {leftColFaqs.map((faq) => {
                                const isOpen = openFaqIndex === faq.globalIndex;
                                return (
                                    <div
                                        key={faq.globalIndex}
                                        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                                            isOpen
                                                ? 'border-[#037166]/40 shadow-lg shadow-[#037166]/5'
                                                : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(isOpen ? null : faq.globalIndex)}
                                            className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4"
                                        >
                                            <span className="text-sm sm:text-base font-extrabold text-slate-900">
                                                {faq.question}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                isOpen ? 'bg-[#037166] text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {rightColFaqs.map((faq) => {
                                const isOpen = openFaqIndex === faq.globalIndex;
                                return (
                                    <div
                                        key={faq.globalIndex}
                                        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                                            isOpen
                                                ? 'border-[#037166]/40 shadow-lg shadow-[#037166]/5'
                                                : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(isOpen ? null : faq.globalIndex)}
                                            className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4"
                                        >
                                            <span className="text-sm sm:text-base font-extrabold text-slate-900">
                                                {faq.question}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                isOpen ? 'bg-[#037166] text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* ========================================================= */}
            {/* 5. "WE'RE HERE FOR YOU" BANNER (D-Hub Signature Dark)     */}
            {/* ========================================================= */}
            <section className="py-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#03231F] via-[#073832] to-[#0A4A43] text-white p-8 sm:p-12 shadow-2xl border border-[#04a99d]/30">
                    {/* Decorative glow circles */}
                    <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#04a99d]/15 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full bg-[#10b981]/15 blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-black tracking-wider uppercase border border-white/15">
                                <Headphones className="w-3.5 h-3.5 text-teal-300" />
                                STILL NEED HELP?
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                                We&apos;re here for you.
                            </h2>

                            <p className="text-teal-100/90 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                                Can&apos;t find what you&apos;re looking for? Our friendly Doorstep Hub support team is available 24/7 to help you with bookings, technician dispatch, and spare part warranties.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link
                                    href="/contact-us"
                                    className="bg-white text-[#03231F] hover:bg-slate-100 font-black text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-black/20"
                                >
                                    Contact Support
                                </Link>
                                <a
                                    href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent('Hello Doorstep Hub Support, I need help with my service.')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#04a99d]/20 hover:bg-[#04a99d]/35 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-[#04a99d]/40 transition-all backdrop-blur-md"
                                >
                                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                                    WhatsApp Support
                                </a>
                            </div>
                        </div>

                        {/* Right Preview Graphic */}
                        <div className="lg:col-span-5 relative hidden sm:block">
                            <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl aspect-[16/10]">
                                <Image
                                    src="/hero-technician.jpg"
                                    alt="Doorstep Hub Customer Care"
                                    fill
                                    className="object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />
                                
                                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                    <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-[#037166]/90 backdrop-blur-md text-white text-xs font-black">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" /> Live Support Online
                                    </div>
                                    <div className="text-white space-y-1">
                                        <p className="text-xs text-teal-200 font-semibold uppercase tracking-wider">Toll-Free Helpline</p>
                                        <a
                                            href={`tel:${supportPhone.replace(/[^0-9+]/g, '')}`}
                                            className="text-xl font-black hover:text-teal-300 transition-colors block"
                                        >
                                            {supportPhone}
                                        </a>
                                        <a
                                            href={`mailto:${supportEmail}`}
                                            className="text-xs text-slate-300 hover:text-white transition-colors block"
                                        >
                                            {supportEmail}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 6. TAKE YOUR SERVICES ANYWHERE (D-Hub App Download)       */}
            {/* ========================================================= */}
            <section id="app-download-section" className="py-16 bg-gradient-to-b from-[#F8FAFC] to-white border-t border-[#037166]/15 overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* App Tabs Selector with D-Hub Theme */}
                    <div className="flex items-center justify-start gap-2 mb-6">
                        <button
                            type="button"
                            onClick={() => setSelectedAppTab('customer')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                                selectedAppTab === 'customer'
                                    ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/25'
                                    : 'bg-white border border-[#9ecbc3]/40 text-slate-700 hover:bg-[#DEF2EF]/50'
                            }`}
                        >
                            <Smartphone className="w-4 h-4" />
                            Customer App
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedAppTab('partner')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                                selectedAppTab === 'partner'
                                    ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/25'
                                    : 'bg-white border border-[#9ecbc3]/40 text-slate-700 hover:bg-[#DEF2EF]/50'
                            }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            Service Partner App
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-4">
                            {/* D-Hub Pill */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DEF2EF] border border-[#9ecbc3] text-[#037166] text-xs font-black tracking-wider uppercase">
                                ON THE GO • {selectedAppTab === 'customer' ? 'CUSTOMER APP' : 'SERVICE PARTNER APP'}
                            </div>
                            
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                {selectedAppTab === 'customer'
                                    ? 'Take Your Home Services Anywhere'
                                    : 'Partner With D-Hub & Grow Your Business'}
                            </h2>
                            
                            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                                {selectedAppTab === 'customer'
                                    ? 'Get the Doorstep Hub mobile app for instant service bookings, live technician tracking on map, special coupon discounts, and digital spare part warranties.'
                                    : 'Download the Doorstep Hub Partner app to receive verified customer leads, track daily earnings, accept nearby bookings, and manage weekly payouts.'}
                            </p>

                            {/* Dynamic Store Badges */}
                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <a
                                    href={activePlayStoreLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:scale-105 active:scale-95 transition-all shadow-md shadow-slate-200 rounded-xl overflow-hidden block border border-slate-200/80"
                                    title="Download on Google Play Store"
                                >
                                    <Image
                                        src="/google-play-badge.png"
                                        alt="Get it on Google Play"
                                        width={160}
                                        height={48}
                                        className="h-12 w-auto object-contain"
                                    />
                                </a>
                                
                                <a
                                    href={activeAppStoreLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:scale-105 active:scale-95 transition-all shadow-md shadow-slate-200 rounded-xl overflow-hidden block border border-slate-200/80"
                                    title="Download on Apple App Store"
                                >
                                    <Image
                                        src="/app-store-badge.png"
                                        alt="Download on the App Store"
                                        width={160}
                                        height={48}
                                        className="h-12 w-auto object-contain"
                                    />
                                </a>
                            </div>

                            {/* Helper info with live dynamic target link */}
                            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#037166]" />
                                <span>
                                    Direct {selectedAppTab === 'customer' ? 'Customer' : 'Partner'} store link:
                                </span>
                                <a
                                    href={activePlayStoreLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#037166] hover:underline font-bold flex items-center gap-0.5"
                                >
                                    Open Store <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        {/* Phone Mockup Graphic */}
                        <div className="lg:col-span-5 flex justify-center lg:justify-end">
                            <div className="relative w-72 sm:w-80 h-96 sm:h-[420px] transition-all">
                                <Image
                                    src="/service-partner-phone-image.webp"
                                    alt="Doorstep Hub App Interface"
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
