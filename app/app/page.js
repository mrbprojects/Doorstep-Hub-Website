'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    TrendingUp,
    Users,
    Zap,
    IndianRupee,
    Clock,
    Heart,
    Star,
    ArrowDownToLine,
    BarChart3,
    CalendarCheck,
    UserCheck,
    FileText,
    Sparkles,
    Lightbulb,
    ArrowRight
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

function AppDownloadContent() {
    const searchParams = useSearchParams();
    const [partnerLinks, setPartnerLinks] = useState({
        android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
        ios: 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
    });
    const [customerLinks, setCustomerLinks] = useState({
        android: 'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
        ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success && data.policy) {
                    // Partner App Links
                    setPartnerLinks({
                        android: data.policy.vendorAndroidAppLink
                            || data.policy.partnerAndroidAppLink
                            || 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
                        ios: data.policy.vendorIosAppLink
                            || data.policy.partnerIosAppLink
                            || 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
                    });

                    // Customer App Links
                    setCustomerLinks({
                        android: data.policy.customerAndroidAppLink
                            || 'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
                        ios: data.policy.customerIosAppLink
                            || 'https://apps.apple.com/in/app/doorstep-hub/id6475340236'
                    });
                }
            } catch (error) {
                console.error('Error fetching global settings for app download:', error);
            }
        };

        fetchSettings();
    }, []);

    // Strict QR / URL parameter routing for mobile scans & deep links
    useEffect(() => {
        const type = searchParams.get('type');
        if (!type) return;

        // Strict whitelist: Only 'partner' and 'customer' allowed (no open redirect)
        if (type !== 'partner' && type !== 'customer') return;

        const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
        const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent || '');

        if (isMobile) {
            if (type === 'partner') {
                window.location.href = isIOS ? partnerLinks.ios : partnerLinks.android;
            } else {
                window.location.href = isIOS ? customerLinks.ios : customerLinks.android;
            }
        } else {
            // Desktop: smoothly scroll into view of the selected panel
            const targetId = type === 'partner' ? 'partner-app' : 'customer-app';
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [searchParams, partnerLinks, customerLinks]);

    // Customer App Benefits
    const customerBenefits = [
        {
            icon: ShieldCheck,
            title: "Verified Professionals",
            desc: "All our service experts are thoroughly background checked and certified.",
            iconBg: "bg-[#E6F7F4]",
            iconColor: "text-[#008C80]"
        },
        {
            icon: Clock,
            title: "On-Time Service Delivery",
            desc: "Get fast and reliable doorstep services scheduled at your convenience.",
            iconBg: "bg-[#E0F7F6]",
            iconColor: "text-[#00897B]"
        },
        {
            icon: Heart,
            title: "24/7 Hassle-Free Booking",
            desc: "Easy search, transparent pricing, and instant confirmation in a few taps.",
            iconBg: "bg-[#FCE7F3]",
            iconColor: "text-[#EC4899]"
        }
    ];

    // Partner App Benefits
    const partnerBenefits = [
        {
            icon: IndianRupee,
            title: "Earn More Revenue",
            desc: "Keep control of your service rates and boost your monthly income easily.",
            iconBg: "bg-[#E8F8F2]",
            iconColor: "text-[#059669]"
        },
        {
            icon: TrendingUp,
            title: "10X Business Growth",
            desc: "Get steady flow of leads and higher visibility in your local service area.",
            iconBg: "bg-[#FEF3C7]",
            iconColor: "text-[#D97706]"
        },
        {
            icon: Zap,
            title: "Smart Lead Control",
            desc: "Accept or reject job leads instantly through the dedicated partner app dashboard.",
            iconBg: "bg-[#E0F2FE]",
            iconColor: "text-[#0284C7]"
        }
    ];

    // How It Works Steps
    const howItWorksSteps = [
        {
            stepNumber: "STEP 01",
            icon: CalendarCheck,
            title: "Book Your Service",
            description: "Choose your appliance, select the problem and share your location.",
            tip: "Add the brand, model or a photo if available.",
            tipBg: "bg-[#ECFDF5] border-[#D1FAE5] text-[#065F46]",
            tipIconColor: "text-[#059669]"
        },
        {
            stepNumber: "STEP 02",
            icon: UserCheck,
            title: "Technician Visits You",
            description: "A service professional visits your home, checks the appliance and finds the issue.",
            tip: "Keep the appliance easily accessible.",
            tipBg: "bg-[#EFF6FF] border-[#DBEAFE] text-[#1E40AF]",
            tipIconColor: "text-[#2563EB]"
        },
        {
            stepNumber: "STEP 03",
            icon: FileText,
            title: "Know the Problem & Cost",
            description: "The technician explains the issue, required repair and applicable charges before proceeding.",
            tip: "Ask about parts, repair work and cost before approval.",
            tipBg: "bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]",
            tipIconColor: "text-[#D97706]"
        },
        {
            stepNumber: "STEP 04",
            icon: ShieldCheck,
            title: "Repair & Confirm",
            description: "Once the repair is completed, test your appliance and confirm the service.",
            tip: "Check that the original problem is solved before closing the booking.",
            tipBg: "bg-[#ECFDF5] border-[#D1FAE5] text-[#065F46]",
            tipIconColor: "text-[#059669]"
        }
    ];

    return (
        <div className="relative min-h-screen bg-[#F8FCFB] text-[#101828] selection:bg-[#008C80]/20 selection:text-[#008C80]">
            <Header />

            {/* Main Content with clean clearance for 80px fixed Header */}
            <main className="relative z-10 pt-24 sm:pt-28 pb-14 sm:pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 lg:space-y-16">
                    
                    {/* ============================================================ */}
                    {/* PANEL 1: CUSTOMER APP PROMOTION */}
                    {/* ============================================================ */}
                    <section id="customer-app" className="relative rounded-[24px] sm:rounded-[36px] bg-gradient-to-br from-[#EEFAF6] via-[#F4FBF9] to-[#E8F8F3] border border-[#CDEAE2] p-5 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
                        
                        {/* Decorative background mint blobs */}
                        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#008C80]/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#00A896]/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            
                            {/* Left Column: Copy, Actions & Metrics */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="lg:col-span-4 flex flex-col items-start text-left"
                            >
                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F7F2] border border-[#BCEAE0] text-[#008C80] font-semibold text-xs mb-3 shadow-2xs">
                                    <Users className="w-3.5 h-3.5 text-[#008C80]" />
                                    <span>For Customers</span>
                                </div>

                                {/* Headline */}
                                <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[#101828] leading-[1.12] tracking-tight mb-3">
                                    Everything You Need <br className="hidden sm:inline" />
                                    <span className="text-[#008C80]">Right at Your Doorstep</span>
                                </h1>

                                {/* Description */}
                                <p className="text-xs sm:text-sm text-[#475467] leading-relaxed mb-6 max-w-md">
                                    Find trusted appliance repair services, spa and salon bookings, PG and hostel accommodations, and religious pooja services all in one place. Enjoy convenient doorstep solutions, verified professionals, easy booking, and reliable support for your everyday needs.
                                </p>

                                {/* Store Buttons */}
                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 mb-6 w-full sm:w-auto">
                                    <a
                                        href={customerLinks.android}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Download Doorstep Hub Customer App on Google Play"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#05685A] hover:bg-[#035247] text-white rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                                    >
                                        <GooglePlayIcon className="w-5 h-5 flex-shrink-0" />
                                        <div className="text-left leading-tight">
                                            <div className="text-[9px] uppercase font-medium tracking-wider text-white/80">GET IT ON</div>
                                            <div className="text-xs sm:text-sm font-bold text-white">Google Play</div>
                                        </div>
                                    </a>

                                    <a
                                        href={customerLinks.ios}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Download Doorstep Hub Customer App on the App Store"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#05685A] hover:bg-[#035247] text-white rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                                    >
                                        <AppleIcon className="w-5 h-5 flex-shrink-0 fill-current" />
                                        <div className="text-left leading-tight">
                                            <div className="text-[9px] font-medium text-white/80">Download on the</div>
                                            <div className="text-xs sm:text-sm font-bold text-white">App Store</div>
                                        </div>
                                    </a>
                                </div>

                                {/* Metrics Row */}
                                <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-[#D5EAE3] text-left">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#E0F7F2] flex items-center justify-center text-[#008C80] flex-shrink-0">
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                        <div>
                                            <div className="text-sm sm:text-base font-extrabold text-[#101828] leading-tight">4.8★</div>
                                            <div className="text-[10px] text-[#667085] leading-tight">App Rating</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#E0F7F2] flex items-center justify-center text-[#008C80] flex-shrink-0">
                                            <ArrowDownToLine className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm sm:text-base font-extrabold text-[#101828] leading-tight">50K+</div>
                                            <div className="text-[10px] text-[#667085] leading-tight">Downloads</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#E0F7F2] flex items-center justify-center text-[#008C80] flex-shrink-0">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm sm:text-base font-extrabold text-[#101828] leading-tight">100%</div>
                                            <div className="text-[10px] text-[#667085] leading-tight">Secure Payments</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Middle Column: Customer Phone Mockup */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="lg:col-span-4 flex justify-center items-center my-4 lg:my-0"
                            >
                                <div className="relative w-full max-w-[310px] sm:max-w-[350px] lg:max-w-[360px] mx-auto">
                                    <Image
                                        src="/customer-app-mockup.png"
                                        alt="Doorstep Hub Customer App preview"
                                        width={400}
                                        height={500}
                                        priority
                                        className="w-full h-auto object-contain drop-shadow-xl select-none"
                                    />
                                </div>
                            </motion.div>

                            {/* Right Column: Why download Customer App Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="lg:col-span-4 w-full"
                            >
                                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#DCEBE6] shadow-sm">
                                    <h2 className="text-base sm:text-lg font-bold text-[#101828] mb-4 sm:mb-5">
                                        Why download the Customer App?
                                    </h2>
                                    <div className="space-y-4 sm:space-y-4.5">
                                        {customerBenefits.map((item, idx) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs sm:text-sm font-bold text-[#101828] mb-0.5 leading-snug">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-[11px] sm:text-xs text-[#475467] leading-relaxed">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </section>


                    {/* ============================================================ */}
                    {/* SECTION: HOW IT WORKS (FOUR SIMPLE STEPS) */}
                    {/* ============================================================ */}
                    <section className="relative py-4 sm:py-6">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F5] border border-[#BCEAE3] text-[#008C80] text-xs font-semibold mb-3 shadow-2xs"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-[#008C80]" />
                                <span>HOW IT WORKS</span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#101828] tracking-tight mb-2"
                            >
                                Four Simple Steps. Less Hassle.
                            </motion.h2>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15 }}
                                className="text-sm sm:text-base text-[#475467] mb-6"
                            >
                                From Booking to Doorstep Repair.
                            </motion.p>

                            {/* Steps Indicator Pill */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-full bg-white border border-[#E2ECE9] shadow-2xs text-xs sm:text-sm font-semibold text-[#101828]"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-[#05685A] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                                    <span>Book</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[#98A2B3]" />
                                <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-[#05685A] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                                    <span>Inspect</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[#98A2B3]" />
                                <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-[#05685A] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                                    <span>Approve</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[#98A2B3]" />
                                <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-[#05685A] text-white flex items-center justify-center text-[10px] font-bold">4</span>
                                    <span>Repair</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* 4 Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            {howItWorksSteps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <motion.div
                                        key={step.stepNumber}
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.35, delay: idx * 0.06 }}
                                        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E5ECEB] shadow-2xs hover:shadow-md hover:border-[#008C80]/30 transition-all duration-200 flex flex-col justify-between h-full group"
                                    >
                                        <div>
                                            {/* Top Row: Icon on left, Step badge on right */}
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="w-12 h-12 rounded-xl bg-[#05685A] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="px-2.5 py-1 rounded-md bg-[#F2F4F7] text-[#475467] font-bold text-[11px] uppercase tracking-wider">
                                                    {step.stepNumber}
                                                </span>
                                            </div>

                                            {/* Step Title */}
                                            <h3 className="text-base sm:text-lg font-bold text-[#101828] mb-2 leading-snug">
                                                {step.title}
                                            </h3>

                                            {/* Step Description */}
                                            <p className="text-xs sm:text-sm text-[#475467] leading-relaxed mb-6">
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Bottom Tip Callout Box */}
                                        <div className={`rounded-xl p-3 border text-xs flex items-start gap-2 ${step.tipBg} mt-auto`}>
                                            <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${step.tipIconColor}`} />
                                            <p className="leading-relaxed">
                                                <span className="font-bold">Tip: </span>
                                                {step.tip}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>


                    {/* ============================================================ */}
                    {/* PANEL 2: SERVICE PARTNER APP PROMOTION */}
                    {/* ============================================================ */}
                    <section id="partner-app" className="relative rounded-[24px] sm:rounded-[36px] bg-gradient-to-br from-[#FCFAF4] via-[#FDF9ED] to-[#FAF6EA] border border-[#EFE5D2] p-5 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
                        
                        {/* Decorative background warm blobs */}
                        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#008C80]/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            
                            {/* Left Column: Copy, Actions & Metrics */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="lg:col-span-4 flex flex-col items-start text-left"
                            >
                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F2] border border-[#BCEAE0] text-[#008C80] font-semibold text-xs mb-3 shadow-2xs">
                                    <Zap className="w-3.5 h-3.5 text-[#008C80]" />
                                    <span>For Service Partners</span>
                                </div>

                                {/* Headline */}
                                <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[#101828] leading-[1.12] tracking-tight mb-3">
                                    Grow Your Business <span className="text-[#008C80]">10X</span> <br className="hidden sm:inline" />
                                    With <span className="text-[#008C80]">Doorstep Hub</span>
                                </h2>

                                {/* Description */}
                                <p className="text-xs sm:text-sm text-[#475467] leading-relaxed mb-6 max-w-md">
                                    Get verified leads, instant payments and zero hassle. Transform your service business today. Join the Doorstep Hub platform that helps you earn more, manage work easily, and reach more customers in your city.
                                </p>

                                {/* Store Buttons */}
                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 mb-6 w-full sm:w-auto">
                                    <a
                                        href={partnerLinks.android}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Download Doorstep Hub Service Partner App on Google Play"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#05685A] hover:bg-[#035247] text-white rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                                    >
                                        <GooglePlayIcon className="w-5 h-5 flex-shrink-0" />
                                        <div className="text-left leading-tight">
                                            <div className="text-[9px] uppercase font-medium tracking-wider text-white/80">GET IT ON</div>
                                            <div className="text-xs sm:text-sm font-bold text-white">Google Play</div>
                                        </div>
                                    </a>

                                    <a
                                        href={partnerLinks.ios}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Download Doorstep Hub Service Partner App on the App Store"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#05685A] hover:bg-[#035247] text-white rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                                    >
                                        <AppleIcon className="w-5 h-5 flex-shrink-0 fill-current" />
                                        <div className="text-left leading-tight">
                                            <div className="text-[9px] font-medium text-white/80">Download on the</div>
                                            <div className="text-xs sm:text-sm font-bold text-white">App Store</div>
                                        </div>
                                    </a>
                                </div>

                                {/* Metrics Row */}
                                <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-[#EAE1D0] text-left">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#E8F8F2] flex items-center justify-center text-[#059669] flex-shrink-0">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm sm:text-base font-extrabold text-[#101828] leading-tight">700+</div>
                                            <div className="text-[10px] text-[#667085] leading-tight">Active Partners</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] flex-shrink-0">
                                            <BarChart3 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm sm:text-base font-extrabold text-[#101828] leading-tight">98%</div>
                                            <div className="text-[10px] text-[#667085] leading-tight">Success Rate</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] flex-shrink-0">
                                            <IndianRupee className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm sm:text-base font-extrabold text-[#101828] leading-tight">₹25K+</div>
                                            <div className="text-[10px] text-[#667085] leading-tight">Avg. Income</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Middle Column: Partner Phone Mockup with Smiling Partner */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="lg:col-span-4 flex justify-center items-center my-4 lg:my-0"
                            >
                                <div className="relative w-full max-w-[310px] sm:max-w-[350px] lg:max-w-[360px] mx-auto">
                                    <Image
                                        src="/partner-app-mockup.png"
                                        alt="Doorstep Hub Service Partner App preview"
                                        width={400}
                                        height={500}
                                        loading="lazy"
                                        className="w-full h-auto object-contain drop-shadow-xl select-none"
                                    />
                                </div>
                            </motion.div>

                            {/* Right Column: Why download Partner App Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="lg:col-span-4 w-full"
                            >
                                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EBE4D5] shadow-sm">
                                    <h2 className="text-base sm:text-lg font-bold text-[#101828] mb-4 sm:mb-5">
                                        Why download the Partner App?
                                    </h2>
                                    <div className="space-y-4 sm:space-y-4.5">
                                        {partnerBenefits.map((item, idx) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs sm:text-sm font-bold text-[#101828] mb-0.5 leading-snug">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-[11px] sm:text-xs text-[#475467] leading-relaxed">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function AppDownloadPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8FCFB]" />}>
            <AppDownloadContent />
        </Suspense>
    );
}

// Crisp Google Play SVG Icon
function GooglePlayIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3.609 1.813A1.5 1.5 0 0 0 3 3.125v17.75c0 .54.274 1.037.712 1.332l9.907-9.973L3.609 1.813z"
                fill="#00E676"
            />
            <path
                d="M17.063 8.785 13.62 12.234l3.444 3.469 3.874-2.237a1.5 1.5 0 0 0 0-2.613l-3.875-2.068z"
                fill="#FFD600"
            />
            <path
                d="M3.712 22.207l9.907-9.973 3.444 3.469-11.238 6.488a1.5 1.5 0 0 1-2.113-.984z"
                fill="#FF1744"
            />
            <path
                d="M3.609 1.813 14.847 8.3l-3.444 3.469-9.907-9.973A1.498 1.498 0 0 1 3.609 1.813z"
                fill="#00B0FF"
            />
        </svg>
    );
}

// Crisp Apple SVG Icon
function AppleIcon({ className }) {
    return (
        <svg viewBox="0 0 170 170" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.62-7.85-11.77-14.4-6.42-10.13-11.54-21.57-15.35-34.33-3.81-12.76-5.72-24.63-5.72-35.63 0-14.58 3.7-26.68 11.1-36.3 7.4-9.61 16.78-14.54 28.16-14.78 4.8 0 10.38 1.25 16.74 3.74 6.36 2.5 10.37 3.82 12.02 3.96 1.96-.28 6.13-1.68 12.51-4.2 6.38-2.52 11.85-3.66 16.4-3.41 12.44.62 22.37 5.09 29.8 13.41-10.88 6.57-16.2 15.71-15.96 27.42.24 9.17 3.77 16.89 10.59 23.16 6.82 6.27 15.02 9.87 24.6 10.8-2.07 6.1-4.71 12.5-7.92 19.22zm-35.24-118.84c0 7.1-2.67 14.07-8.01 20.91-6.7 8.35-14.86 13.11-24.48 14.28-.24-1.22-.36-2.55-.36-3.99 0-7.07 2.87-14.28 8.61-21.63 2.87-3.67 6.43-6.75 10.68-9.24 4.25-2.49 8.76-3.8 13.56-3.93v3.6z" />
        </svg>
    );
}
