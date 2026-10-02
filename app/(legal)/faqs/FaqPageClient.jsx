'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    Home,
    ChevronRight,
    ChevronDown,
    Search,
    X,
    User,
    Users,
    Briefcase,
    MessageSquare,
    HelpCircle,
    Phone,
    Mail,
    Clock,
    Zap,
    Heart,
    Calendar,
    CalendarPlus,
    ShieldCheck,
    CreditCard,
    UserCheck,
    MapPin,
    Settings,
    Info,
    Sparkles,
    Headphones,
    Smartphone,
    KeyRound,
    Activity,
    RotateCcw
} from 'lucide-react';
import { API_BASE_URL } from '@/config/env';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import FaqHeroIllustration from './FaqHeroIllustration';

/**
 * Intelligent icon resolver based on question keywords
 */
function getFaqIcon(question = '') {
    const q = question.toLowerCase();
    if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('reach') || q.includes('support if i face')) {
        return Phone;
    }
    if (q.includes('reschedule') || q.includes('cancel')) {
        return Calendar;
    }
    if (q.includes('warranty') || q.includes('guarantee')) {
        return ShieldCheck;
    }
    if (q.includes('charge') || q.includes('pricing') || q.includes('payment') || q.includes('cost') || q.includes('calculated')) {
        return CreditCard;
    }
    if (q.includes('same-day') || q.includes('how long') || q.includes('time') || q.includes('hours') || q.includes('response')) {
        return Clock;
    }
    if (q.includes('technician') || q.includes('verified') || q.includes('partner') || q.includes('provider') || q.includes('expert')) {
        return UserCheck;
    }
    if (q.includes('book a service') || q.includes('how do i book') || q.includes('booking')) {
        return CalendarPlus;
    }
    if (q.includes('cities') || q.includes('city') || q.includes('location') || q.includes('area') || q.includes('where')) {
        return MapPin;
    }
    if (q.includes('what services') || q.includes('services do you offer') || q.includes('types of issues') || q.includes('process work')) {
        return Settings;
    }
    if (q.includes('what is doorstep') || q.includes('about doorstep') || q.includes('what is')) {
        return Info;
    }
    if (q.includes('app') || q.includes('mobile')) {
        return Smartphone;
    }
    if (q.includes('otp') || q.includes('number') || q.includes('verify')) {
        return KeyRound;
    }
    if (q.includes('track') || q.includes('status')) {
        return Activity;
    }
    return HelpCircle;
}

/**
 * Format phone numbers for display (+91 88866 88666)
 */
function formatPhoneNumber(phone) {
    if (!phone) return '+91 88866 88666';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phone.startsWith('+') ? phone : `+91 ${phone}`;
}

/**
 * Rich Answer Formatter: supports bullet points, bolding, mailto links, and tel links
 */
function FormattedAnswer({ answer, supportEmail, supportPhone }) {
    if (!answer) return null;

    // Detect if the answer has line breaks or bullet points
    const lines = answer.split(/\r?\n/).filter(line => line.trim().length > 0);

    // If answer contains emails or phone numbers, linkify them
    const renderTextWithLinks = (text) => {
        // Regex for emails and phone numbers
        const parts = text.split(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g);
        
        return parts.map((part, index) => {
            if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
                return (
                    <a
                        key={index}
                        href={`mailto:${part}`}
                        className="text-[#008C80] font-semibold underline underline-offset-2 hover:text-[#006D65] transition-colors"
                    >
                        {part}
                    </a>
                );
            }
            if (/^(\+91|\+)?\s*\d{5}\s*\d{5}$|^\d{10}$/.test(part.trim())) {
                const cleanNumber = part.replace(/\D/g, '');
                return (
                    <a
                        key={index}
                        href={`tel:${cleanNumber}`}
                        className="text-[#008C80] font-semibold underline underline-offset-2 hover:text-[#006D65] transition-colors"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    // If it's a contact support question answer, render rich multi-channel format matching the reference
    const isContactSupportQuestion = answer.toLowerCase().includes('contact our support') || answer.toLowerCase().includes('reach our support');
    if (isContactSupportQuestion) {
        return (
            <div className="space-y-3 text-slate-700 text-sm sm:text-base leading-relaxed">
                <p>You can reach our customer support team through multiple channels:</p>
                <ul className="space-y-2 pl-1 sm:pl-2">
                    <li className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#008C80] mt-2 flex-shrink-0" />
                        <span>
                            Email us at{' '}
                            <a
                                href={`mailto:${supportEmail}`}
                                className="text-[#008C80] font-bold hover:underline"
                            >
                                {supportEmail}
                            </a>
                        </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#008C80] mt-2 flex-shrink-0" />
                        <span>
                            Call us on{' '}
                            <a
                                href={`tel:${supportPhone.replace(/\D/g, '')}`}
                                className="text-[#008C80] font-bold hover:underline"
                            >
                                {formatPhoneNumber(supportPhone)}
                            </a>{' '}
                            <span className="text-slate-500 font-normal">(available 24/7)</span>
                        </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#008C80] mt-2 flex-shrink-0" />
                        <span>Use the in-app chat support from your Doorstep Hub app</span>
                    </li>
                </ul>
                <p className="pt-1 text-slate-600">
                    Our team is always happy to help you with bookings, service updates, or any other queries.
                </p>
            </div>
        );
    }

    // Default multi-line or paragraph rendering
    if (lines.length > 1) {
        return (
            <div className="space-y-2 text-slate-700 text-sm sm:text-base leading-relaxed">
                {lines.map((line, idx) => {
                    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());
                    if (isBullet) {
                        return (
                            <div key={idx} className="flex items-start gap-2.5 pl-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#008C80] mt-2 flex-shrink-0" />
                                <span>{renderTextWithLinks(line.replace(/^[•\-\*]\s*|^\d+\.\s*/, ''))}</span>
                            </div>
                        );
                    }
                    return <p key={idx}>{renderTextWithLinks(line)}</p>;
                })}
            </div>
        );
    }

    return (
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            {renderTextWithLinks(answer)}
        </p>
    );
}

export default function FaqPageClient({ initialFaqs = [] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL State sync: ?role=partner or ?role=customer
    const roleParam = searchParams.get('role');
    const initialRole = roleParam === 'partner' ? 'service app' : 'customer app';

    const [activeTab, setActiveTab] = useState(initialRole);
    const [faqs, setFaqs] = useState(initialRole === 'customer app' && initialFaqs.length > 0 ? initialFaqs : []);
    const [loading, setLoading] = useState(initialRole !== 'customer app' || initialFaqs.length === 0);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [activeIndex, setActiveIndex] = useState(0); // Open the first item by default like in reference

    const { policy } = useGlobalSettings() || {};

    const supportEmail = policy?.email || 'support@doorstephub.com';
    const supportPhone = policy?.phone || '8886688666';
    const displayPhone = formatPhoneNumber(supportPhone);
    const cleanPhone = String(supportPhone).replace(/\D/g, '');

    // Customer & Partner App Links
    const customerAndroidLink = policy?.customerAndroidAppLink || 'https://play.google.com/store/apps/details?id=com.doorstephub.customer';
    const customerIosLink = policy?.customerIosAppLink || 'https://apps.apple.com/in/app/doorstep-hub-home-services/id6475340236';
    const partnerAndroidLink = policy?.vendorAndroidAppLink || policy?.partnerAndroidAppLink || 'https://play.google.com/store/apps/details?id=com.doorstephub.partner';
    const partnerIosLink = policy?.vendorIosAppLink || policy?.partnerIosAppLink || 'https://apps.apple.com/in/app/service-partner-doorstep-hub/id6760889720';

    const isCustomer = activeTab === 'customer app';
    const appRoleName = isCustomer ? 'Customer App' : 'Service Partner App';
    const currentAndroidLink = isCustomer ? customerAndroidLink : partnerAndroidLink;
    const currentIosLink = isCustomer ? customerIosLink : partnerIosLink;

    // Fetch FAQs whenever activeTab changes
    useEffect(() => {
        // If already loaded initial customer FAQs on server
        if (activeTab === 'customer app' && initialFaqs.length > 0 && faqs.length === initialFaqs.length) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchFAQs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/app/products/faqs?applicationType=${encodeURIComponent(activeTab)}`);
                const data = await response.json();
                if (isMounted) {
                    if (data.success && Array.isArray(data.data)) {
                        setFaqs(data.data);
                        setActiveIndex(0); // Open first item
                    } else {
                        setError('Failed to load FAQs for this role');
                    }
                }
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                if (isMounted) {
                    setError('Unable to load FAQs. Please check your network connection.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchFAQs();
        return () => {
            isMounted = false;
        };
    }, [activeTab, initialFaqs]);

    // Role switcher handler with gentle query string update
    const handleRoleChange = useCallback((roleTab) => {
        setActiveTab(roleTab);
        const newRoleSlug = roleTab === 'service app' ? 'partner' : 'customer';
        const url = new URL(window.location.href);
        url.searchParams.set('role', newRoleSlug);
        window.history.replaceState({}, '', url.toString());
    }, []);

    // Filter FAQs by search query
    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return faqs;
        const q = searchQuery.toLowerCase().trim();
        return faqs.filter(faq =>
            faq.question.toLowerCase().includes(q) ||
            faq.answer.toLowerCase().includes(q)
        );
    }, [faqs, searchQuery]);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="py-6 sm:py-10 lg:py-14 text-slate-800 font-sans w-full">
            <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-9">

                {/* 1. Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
                    <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#008C80] transition-colors">
                        <Home className="w-3.5 h-3.5 text-slate-400" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <Link href="/terms-conditions" className="hover:text-[#008C80] transition-colors">
                        Legal
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[#008C80] font-bold" aria-current="page">
                        FAQs
                    </span>
                </nav>

                {/* 2. Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#008C80] via-[#009b8e] to-[#2072e5] p-6 sm:p-10 lg:p-12 text-white shadow-xl shadow-[#008C80]/15"
                >
                    {/* Ambient Radial Lights */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-10">
                        {/* Hero Text */}
                        <div className="space-y-3.5 sm:space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                                <span>Knowledge Base &amp; FAQ</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                                Frequently Asked Questions
                            </h1>

                            <p className="text-cyan-50/90 text-sm sm:text-base leading-relaxed font-normal">
                                Find instant answers to common questions about Doorstep Hub bookings, technician guarantees, cancellations, and service partner requirements.
                            </p>
                        </div>

                        {/* Hero 3D Speech Bubbles Illustration */}
                        <div className="flex justify-center lg:justify-end flex-shrink-0">
                            <FaqHeroIllustration />
                        </div>
                    </div>
                </motion.div>

                {/* 3. Legal Navigation Tabs */}
                <LegalNavTabs />

                {/* 4. Applicable Target Role & App Download Block */}
                <div className="w-full rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm p-4 sm:p-5 lg:p-6 transition-all">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-6">
                        
                        {/* Left: Role Info & Icon Badge */}
                        <div className="flex items-center gap-3.5 sm:gap-4 flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#008C80]" />
                                    <p className="text-[11px] font-black uppercase tracking-wider text-[#008C80]">
                                        Applicable Target Role
                                    </p>
                                </div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                    {isCustomer ? 'Customer & User FAQs' : 'Service Partner FAQs'}
                                </h2>
                            </div>
                        </div>

                        {/* Middle: Segmented Role Switcher Tabs */}
                        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => handleRoleChange('customer app')}
                                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    isCustomer
                                        ? 'bg-[#008C80] text-white shadow-md shadow-[#008C80]/30'
                                        : 'text-slate-600 hover:text-[#008C80] hover:bg-white/60'
                                }`}
                            >
                                <User className="w-4 h-4" />
                                <span>Customer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleChange('service app')}
                                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    !isCustomer
                                        ? 'bg-[#008C80] text-white shadow-md shadow-[#008C80]/30'
                                        : 'text-slate-600 hover:text-[#008C80] hover:bg-white/60'
                                }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>Service Partner</span>
                            </button>
                        </div>

                        {/* Right: Official Mobile App Download Badges */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            <div className="hidden xl:flex flex-col text-right mr-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Official Mobile App</span>
                                <span className="text-xs font-black text-slate-700">{appRoleName}</span>
                            </div>

                            {/* Google Play Button */}
                            <a
                                href={currentAndroidLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Download ${appRoleName} on Google Play`}
                                className="group flex-1 sm:flex-initial inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#090D16] hover:bg-[#111827] text-white border border-slate-800 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M3.61 1.814L13.79 12 3.61 22.186A2.38 2.38 0 0 1 3 20.572V3.428c0-.624.23-1.196.61-1.614z"/>
                                        <path fill="#FBBC04" d="M17.7 9.68L5.88 2.92 13.79 12l3.91-2.32z"/>
                                        <path fill="#EA4335" d="M3.61 1.814l10.18 10.186 3.91-2.32-11.82-6.76a2.38 2.38 0 0 0-2.27 1.1z"/>
                                        <path fill="#34A853" d="M17.7 14.32l-3.91-2.32-10.18 10.186a2.38 2.38 0 0 0 2.27 1.1l11.82-6.76z"/>
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">GET IT ON</p>
                                    <p className="text-xs font-bold text-white tracking-tight leading-none">Google Play</p>
                                </div>
                            </a>

                            {/* Apple App Store Button */}
                            {currentIosLink && (
                                <a
                                    href={currentIosLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Download ${appRoleName} on App Store`}
                                    className="group flex-1 sm:flex-initial inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#090D16] hover:bg-[#111827] text-white border border-slate-800 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.55.63-1.03 1.68-.9 2.7.99.08 2.02-.45 2.63-1.2z"/>
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">Download on the</p>
                                        <p className="text-xs font-bold text-white tracking-tight leading-none">App Store</p>
                                    </div>
                                </a>
                            )}
                        </div>

                    </div>
                </div>

                {/* 5. Main FAQ Accordion Section Container */}
                <div className="relative rounded-[24px] sm:rounded-[32px] bg-white p-5 sm:p-8 lg:p-10 border border-slate-200/80 shadow-md shadow-slate-200/40 min-h-[460px] w-full">
                    
                    {/* Header Row: Title & Search Input */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#008C80]" />
                                    <p className="text-[11px] font-black uppercase tracking-wider text-[#008C80]">
                                        Common Questions
                                    </p>
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                                    {isCustomer ? 'Customer & User FAQs' : 'Service Partner FAQs'}
                                </h3>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-72 md:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search FAQs..."
                                aria-label="Search frequently asked questions"
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-[#008C80] focus:ring-2 focus:ring-[#008C80]/15 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Clear search query"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Accordions List / Loading / Error / Empty States */}
                    <div className="pt-6">
                        {loading ? (
                            <div className="space-y-3.5">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-16 w-full bg-slate-100/80 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-14 max-w-md mx-auto space-y-4">
                                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                                    <HelpCircle className="w-7 h-7" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">We couldn't load FAQs right now</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {error}
                                </p>
                                <button
                                    onClick={() => handleRoleChange(activeTab)}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#008C80] rounded-xl text-white font-bold hover:bg-[#007369] transition-all shadow-md shadow-[#008C80]/20"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Try Again
                                </button>
                            </div>
                        ) : filteredFaqs.length === 0 ? (
                            <div className="text-center py-14 max-w-md mx-auto space-y-4">
                                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                                    <Search className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">No FAQs found</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Try another keyword or switch between Customer and Service Partner FAQs.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                    <a
                                        href={`mailto:${supportEmail}`}
                                        className="px-4 py-2 bg-[#008C80] hover:bg-[#007369] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                                    >
                                        Contact Support
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {filteredFaqs.map((faq, index) => {
                                    const IconComponent = getFaqIcon(faq.question);
                                    const isExpanded = activeIndex === index;
                                    const itemId = `faq-item-${faq._id || index}`;
                                    const headerId = `faq-header-${faq._id || index}`;

                                    return (
                                        <div
                                            key={faq._id || index}
                                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                                isExpanded
                                                    ? 'border-[#008C80]/30 shadow-sm bg-white'
                                                    : 'border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/40'
                                            }`}
                                        >
                                            {/* Accordion Row Trigger */}
                                            <button
                                                type="button"
                                                id={headerId}
                                                aria-expanded={isExpanded}
                                                aria-controls={itemId}
                                                onClick={() => toggleAccordion(index)}
                                                className="w-full px-4 sm:px-6 py-4 sm:py-4.5 flex items-center justify-between text-left gap-3.5 sm:gap-4 transition-colors"
                                            >
                                                {/* Left Contextual Icon in Pale Mint Circle */}
                                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                                                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>

                                                {/* Question Text */}
                                                <span className="flex-1 text-sm sm:text-base lg:text-[17px] font-bold text-slate-900 leading-snug">
                                                    {faq.question}
                                                </span>

                                                {/* Right Chevron Down */}
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#008C80] flex-shrink-0">
                                                    <ChevronDown
                                                        className={`w-5 h-5 transition-transform duration-300 ${
                                                            isExpanded ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                </div>
                                            </button>

                                            {/* Expanded Answer Panel */}
                                            <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                    <motion.div
                                                        id={itemId}
                                                        role="region"
                                                        aria-labelledby={headerId}
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                    >
                                                        <div className="px-5 sm:px-7 pb-5 sm:pb-6 pt-1 sm:pt-2 border-t border-slate-100 bg-[#F8FCFB]/70">
                                                            <FormattedAnswer
                                                                answer={faq.answer}
                                                                supportEmail={supportEmail}
                                                                supportPhone={supportPhone}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Support CTA Section (Bottom) */}
                <div className="relative rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#0B1B2B] via-[#0E2838] to-[#0A1A28] p-6 sm:p-10 lg:p-12 text-white shadow-2xl overflow-hidden border border-cyan-900/30">
                    {/* Glowing decorative backdrop */}
                    <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
                        {/* Left Info */}
                        <div className="space-y-2 max-w-xl">
                            <div className="inline-flex items-center gap-2 text-xs font-black text-[#00D1B2] uppercase tracking-wider">
                                <Headphones className="w-4 h-4" />
                                <span>24/7 Dedicated Support</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                                Still have questions?
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Can't find the answer you're looking for? Reach out to our friendly support team for instant assistance.
                            </p>
                        </div>

                        {/* Right Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <a
                                href={`mailto:${supportEmail}`}
                                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#008C80] to-[#04a99d] hover:from-[#007b70] hover:to-[#03988d] text-white text-sm sm:text-base font-bold transition-all shadow-lg shadow-[#008C80]/30 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Mail className="w-4 h-4" />
                                <span>Email Support</span>
                                <ChevronRight className="w-4 h-4" />
                            </a>

                            <a
                                href={`tel:${cleanPhone}`}
                                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm sm:text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Phone className="w-4 h-4 text-cyan-300" />
                                <span>{displayPhone}</span>
                                <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Bottom Trust Indicators */}
                    <div className="relative z-10 pt-6 mt-6 sm:mt-8 border-t border-white/10 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#00D1B2]" />
                            <span>24/7 Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#00D1B2]" />
                            <span>Quick Response</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-[#00D1B2]" />
                            <span>Here to Help</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
