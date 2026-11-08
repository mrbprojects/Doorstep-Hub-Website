'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    
    Shield,
    Clock,
    CheckCircle2,
    Lock,
    HelpCircle,
    Printer,
    ChevronRight,
    Sparkles,
    Scale,
    AlertCircle,
    Mail
} from 'lucide-react';
import { API_BASE_URL } from '@/config/env';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import PolicyRoleBar from '@/components/legal/PolicyRoleBar';

export default function TermsConditionsClient({ initialContent }) {
    const [activeTab, setActiveTab] = useState('customer app');
    const [content, setContent] = useState(initialContent || null);
    const [loading, setLoading] = useState(!initialContent);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeTab === 'customer app' && initialContent) {
            return;
        }

        const fetchTerms = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/app/products/privacy-policies?applicationType=${encodeURIComponent(activeTab)}`
                );
                const data = await response.json();
                if (data.success && data.data) {
                    setContent(data.data);
                } else {
                    setError('Failed to load terms and conditions');
                }
            } catch (err) {
                console.error('Error fetching terms:', err);
                setError('An error occurred while fetching terms and conditions');
            } finally {
                setLoading(false);
            }
        };

        fetchTerms();
    }, [activeTab, initialContent]);

    const handlePrint = () => {
        window.print();
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
                        <span className="text-[#037166] font-bold">Terms of Service</span>
                    </nav>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[#037166] text-xs font-bold tracking-wide">
                        <Scale className="w-3.5 h-3.5 text-[#037166]" />
                        Official Binding Agreement
                    </div>
                </div>

                {/* Hero Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#025951] via-[#037166] to-[#0d9488] p-8 sm:p-12 text-white shadow-xl shadow-[#037166]/15"
                >
                    <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-300/15 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                                Fair &amp; Transparent Terms
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                                Terms of Service
                            </h1>
                            <p className="text-emerald-50/90 text-sm sm:text-base leading-relaxed">
                                Please review the terms, obligations, service policies, and guidelines governing your use of Doorstep Hub platforms.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 flex-shrink-0">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all hover:scale-105 shadow-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Print / Save PDF
                            </button>

                            <div className="inline-flex items-center gap-2 text-xs text-emerald-200/90 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Updated: {content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sub-Navigation: Legal Hub Switcher */}
                <LegalNavTabs />

                {/* Target Role Switcher */}
                <PolicyRoleBar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    pageTitle="Terms of Service"
                />

                {/* Main Content Article Card */}
                <div className="relative rounded-3xl bg-white p-6 sm:p-12 lg:p-16 border border-slate-200 shadow-xl shadow-slate-200/40 min-h-[460px] w-full">
                    {loading ? (
                        <div className="animate-pulse space-y-6 py-6">
                            <div className="h-8 w-1/3 bg-slate-200 rounded-lg"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-slate-200 rounded"></div>
                                <div className="h-4 w-11/12 bg-slate-200 rounded"></div>
                                <div className="h-4 w-4/5 bg-slate-200 rounded"></div>
                            </div>
                            <div className="h-6 w-1/4 bg-slate-200 rounded-lg mt-8"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-slate-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                                <AlertCircle className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{error}</h3>
                            <button
                                onClick={() => setActiveTab(activeTab)}
                                className="px-6 py-2.5 rounded-xl bg-[#037166] text-white font-bold text-sm hover:bg-[#025951] transition-all shadow-md"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8 w-full"
                        >
                            {/* Rich Document Content */}
                            <div
                                className="legal-content text-slate-800 text-base leading-relaxed space-y-6 w-full
                                [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-slate-100
                                [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3
                                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2
                                [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-4
                                [&_strong]:text-slate-900 [&_strong]:font-bold
                                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-4 [&_ul]:text-slate-700
                                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:my-4 [&_ol]:text-slate-700
                                [&_li]:text-slate-700 [&_li]:leading-relaxed
                                [&_blockquote]:border-l-4 [&_blockquote]:border-[#037166] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:bg-slate-50 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
                                [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:border [&_table]:border-slate-200
                                [&_th]:bg-slate-100 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-slate-900 [&_th]:border [&_th]:border-slate-200
                                [&_td]:p-3 [&_td]:border [&_td]:border-slate-200 [&_td]:text-slate-700
                                [&_a]:text-[#037166] [&_a]:font-semibold [&_a]:underline [&_a]:hover:text-[#025951]"
                                dangerouslySetInnerHTML={{
                                    __html: content?.termsAndConditions || '<p>Terms and conditions governing the use of Doorstep Hub services.</p>'
                                }}
                            />
                        </motion.div>
                    )}
                </div>

                {/* 3 Value Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#037166] flex items-center justify-center flex-shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Verified Providers</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Every professional is background-checked and credential-verified for reliability and quality assurance.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Transparent Pricing</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Fixed diagnostic inspection and upfront rate cards with no surprise fees or hidden charges.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#037166] flex items-center justify-center flex-shrink-0">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Payment Security</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Escrow-grade payment processing with instant refunds for unserviced or cancelled bookings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Help Queries Card */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <HelpCircle className="w-4 h-4" /> Legal &amp; Policy Helpdesk
                        </div>
                        <h3 className="text-2xl font-extrabold text-white">Need clarification on our terms?</h3>
                        <p className="text-slate-300 text-sm max-w-xl">
                            Our support and compliance legal team is available to explain specific policies or assist with partner terms.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href="mailto:help@doorstephub.com"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#037166] hover:bg-[#025951] text-white text-sm font-bold transition-all shadow-lg shadow-[#037166]/30"
                        >
                            <Mail className="w-4 h-4" />
                            help@doorstephub.com
                        </a>
                        <Link
                            href="/contact-us"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold transition-all"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
