'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
    HelpCircle,
    ChevronDown,
    MessageSquare,
    ChevronRight,
    Sparkles,
    Phone,
    Mail
} from 'lucide-react';
import { API_BASE_URL } from '@/config/env';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import PolicyRoleBar from '@/components/legal/PolicyRoleBar';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';

export default function FAQPage() {
    const [activeTab, setActiveTab] = useState('customer app');
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);

    const { policy: globalSettings } = useGlobalSettings() || {};

    useEffect(() => {
        const fetchFAQs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/app/products/faqs?applicationType=${encodeURIComponent(activeTab)}`);
                const data = await response.json();
                if (data.success) {
                    setFaqs(data.data);
                } else {
                    setError('Failed to load FAQs');
                }
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setError('An error occurred while fetching the FAQs');
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, [activeTab]);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="py-8 sm:py-12 lg:py-16 text-slate-800 font-sans w-full">
            {/* Full-width Responsive Container */}
            <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 lg:space-y-10">

                {/* Breadcrumbs & Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
                        <Link href="/" className="hover:text-[#037166] transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-900 font-bold">Legal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-purple-600 font-bold">FAQs</span>
                    </nav>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 text-xs font-bold tracking-wide">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                        Help &amp; Answers
                    </div>
                </div>

                {/* Hero Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123F4A] via-[#037166] to-[#6366f1] p-8 sm:p-12 text-white shadow-xl shadow-[#037166]/15"
                >
                    <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-purple-200 text-xs font-semibold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                                Knowledge Base &amp; FAQ
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                                Frequently Asked Questions
                            </h1>
                            <p className="text-purple-100/90 text-sm sm:text-base leading-relaxed">
                                Find instant answers to common questions about Doorstep Hub doorstep bookings, technician guarantees, cancellations, and service partner requirements.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Sub-Navigation: Legal Hub Switcher with Distinct Vibrant Colors */}
                <LegalNavTabs />

                {/* Target Role Switcher & Dynamic Android / iOS App Download Bar */}
                <PolicyRoleBar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    pageTitle="FAQs"
                />

                {/* FAQ Accordion Section */}
                <div className="relative rounded-3xl bg-white p-6 sm:p-12 lg:p-16 border border-slate-200 shadow-xl shadow-slate-200/40 min-h-[460px] w-full">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <h2 className="text-xl font-semibold text-red-500 mb-4">{error}</h2>
                            <button
                                onClick={() => setActiveTab(activeTab)}
                                className="px-6 py-2.5 bg-[#037166] rounded-xl text-white font-bold hover:bg-[#025951] transition-all shadow-md"
                            >
                                Retry
                            </button>
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 italic">No questions found for this category.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={faq._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${activeIndex === index
                                        ? 'bg-slate-50/80 border-purple-500/40 shadow-sm'
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                                    >
                                        <span className="text-base sm:text-lg font-bold text-slate-900">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`w-5 h-5 text-purple-600 transition-transform duration-300 flex-shrink-0 ${activeIndex === index ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {activeIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="px-6 pb-6 text-slate-700 leading-relaxed border-t border-slate-100 pt-4 text-base">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── RESPONSIVE ADSENSE UNIT ── */}
                <div className="w-full my-6">
                    <AdSenseUnit slotId={ADSENSE_CONFIG.slots.categoryFeed} />
                </div>

                {/* Support Section */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
                            <MessageSquare className="w-4 h-4" /> 24/7 Dedicated Support
                        </div>
                        <h3 className="text-2xl font-extrabold text-white">Still have questions?</h3>
                        <p className="text-slate-300 text-sm max-w-xl">
                            Can't find the answer you're looking for? Reach out to our friendly support team for instant assistance.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={`mailto:${globalSettings?.email || "help@doorstephub.com"}`}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/30"
                        >
                            <Mail className="w-4 h-4" />
                            Email Support
                        </a>
                        <a
                            href="tel:8886688666"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold transition-all"
                        >
                            <Phone className="w-4 h-4 text-purple-400" />
                            +91 88866 88666
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}
