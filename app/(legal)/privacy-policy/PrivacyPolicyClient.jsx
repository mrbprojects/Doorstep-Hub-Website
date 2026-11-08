'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    Shield,
    Clock,
    Lock,
    Eye,
    Printer,
    ChevronRight,
    AlertCircle,
    Mail,
    Database,
    Key,
    ExternalLink
} from 'lucide-react';
import { API_BASE_URL } from '@/config/env';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import PolicyRoleBar from '@/components/legal/PolicyRoleBar';

export default function PrivacyPolicyClient({ initialContent }) {
    const [activeTab, setActiveTab] = useState('customer app');
    const [content, setContent] = useState(initialContent || null);
    const [loading, setLoading] = useState(!initialContent);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If initialContent was already loaded for customer app on server, don't refetch on first mount
        if (activeTab === 'customer app' && initialContent) {
            return;
        }

        const fetchPrivacy = async () => {
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
                    setError('Failed to load privacy policy');
                }
            } catch (err) {
                console.error('Error fetching privacy policy:', err);
                setError('An error occurred while fetching the privacy policy');
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacy();
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
                        <span className="text-[#037166] font-bold">Privacy Policy</span>
                    </nav>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold tracking-wide">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        Encrypted &amp; Data Protected
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
                                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                                Your Privacy is Our Top Priority
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                                Privacy Policy
                            </h1>
                            <p className="text-emerald-50/90 text-sm sm:text-base leading-relaxed">
                                Learn how Doorstep Hub collects, protects, manages, and respects your personal, transaction, and device data across our digital ecosystem.
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

                {/* Target Role Switcher & Dynamic Android / iOS App Download Bar */}
                <PolicyRoleBar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    pageTitle="Privacy Policy"
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
                                    __html: content?.privacyPolicy || '<p>Doorstep Hub is committed to protecting your privacy and ensuring your personal data is handled safely.</p>'
                                }}
                            />

                            {/* ── MANDATORY GOOGLE ADSENSE & ADVERTISING COOKIE DISCLOSURE ── */}
                            <section id="adsense-cookie-policy" className="mt-12 pt-8 border-t border-slate-200">
                                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 border border-teal-200/60 p-6 sm:p-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#037166] text-white flex items-center justify-center font-bold shadow-md shadow-[#037166]/20">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Google AdSense &amp; Third-Party Advertising Cookies Disclosure</h2>
                                            <p className="text-xs text-slate-500">Official Advertising Transparency &amp; User Privacy Notice</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        Doorstep Hub may partner with third-party advertising networks, including <strong>Google AdSense</strong>, to serve relevant advertisements across select public sections of our platform (such as classifieds and educational guides).
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                                        <li>
                                            <strong>Third-Party Vendors &amp; Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to Doorstep Hub or other websites on the Internet.
                                        </li>
                                        <li>
                                            <strong>Advertising Cookies (DoubleClick / DART):</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites across the Internet.
                                        </li>
                                        <li>
                                            <strong>User Opt-Out Rights:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#037166] font-semibold underline hover:text-[#025951] inline-flex items-center gap-1">Google Ads Settings <ExternalLink className="w-3 h-3" /></a>. Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-[#037166] font-semibold underline hover:text-[#025951] inline-flex items-center gap-1">www.aboutads.info <ExternalLink className="w-3 h-3" /></a>.
                                        </li>
                                    </ul>
                                </div>
                            </section>
                        </motion.div>
                    )}
                </div>

                {/* 3 Privacy Guarantees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#037166] flex items-center justify-center flex-shrink-0">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Zero Data Sale</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                We do not sell or rent your personal information, contact records, or live location to third-party brokers.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">256-Bit SSL Encryption</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                All communications, KYC documents, and tokenized payments are strictly secured in transit and at rest.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#037166] flex items-center justify-center flex-shrink-0">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Full Data Control</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Request your data copy, revoke app permissions, or delete your account at any time directly in account settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Privacy Queries Card */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <Shield className="w-4 h-4" /> Data Protection Officer
                        </div>
                        <h3 className="text-2xl font-extrabold text-white">Questions about your data privacy?</h3>
                        <p className="text-slate-300 text-sm max-w-xl">
                            Reach out to our Data Privacy &amp; Information Security Officer for data access, deletion, or privacy inquiries.
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
                            href="/account/deletion"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold transition-all"
                        >
                            Account Deletion
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
