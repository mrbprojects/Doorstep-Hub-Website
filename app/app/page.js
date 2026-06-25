'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    TrendingUp,
    Users,
    Zap,
    IndianRupee,
    Clock,
    Smile,
    HeartHandshake
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function AppDownloadPage() {
    const [globalSettings, setGlobalSettings] = useState(null);
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
                    setGlobalSettings(data.policy);
                    
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

    // Statistics / Benefits lists
    const customerBenefits = [
        { icon: ShieldCheck, title: "Verified Professionals", desc: "All our service experts are thoroughly background-checked and certified." },
        { icon: Clock, title: "On-Time Service Delivery", desc: "Get fast and reliable doorstep services scheduled at your convenience." },
        { icon: HeartHandshake, title: "24/7 Hassle-Free Booking", desc: "Easy search, transparent pricing, and instant confirmation in few taps." }
    ];

    const partnerBenefits = [
        { icon: IndianRupee, title: "Earn More Revenue", desc: "Keep control of your service rates and boost your monthly income easily." },
        { icon: TrendingUp, title: "10X Business Growth", desc: "Get steady flow of leads and higher visibility in your local service area." },
        { icon: Zap, title: "Smart Lead Control", desc: "Accept or reject job leads instantly through the dedicated partner app dashboard." }
    ];

    return (
        <div className="relative min-h-screen bg-[#f8fbfa] text-gray-900 overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.06)_1px,transparent_1px)] bg-[size:30px_30px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70" />
            </div>

            <Header />

            <main className="relative z-10 pt-24 pb-12">
                
                {/* SECTION 1: CUSTOMER APP DOWNLOAD */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200/50">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        
                        {/* Left Column - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-center lg:items-start"
                        >
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#037166]/10 border border-[#037166]/20 backdrop-blur-sm text-[#04a99d] font-semibold text-xs mb-4 shadow-sm">
                                <Smile className="w-3.5 h-3.5" />
                                For Customers
                            </div>

                            <h1 className="text-2xl text-[#0f172a] md:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight tracking-tight text-center lg:text-left">
                                Everything You Need{' '}
                                <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent block sm:inline">
                                    Right at Your Doorstep
                                </span>
                            </h1>

                            <p className="hidden sm:block text-sm text-gray-600 mb-6 leading-relaxed max-w-xl text-left w-full">
                                Find trusted appliance repair services, spa and salon bookings, PG and hostel accommodations, and religious pooja services all in one place. Enjoy convenient doorstep solutions, verified professionals, easy booking, and reliable support for your everyday needs. Experience hassle-free home and lifestyle services with just a few clicks.
                            </p>

                            <div className="flex flex-row justify-center lg:justify-start gap-3 mb-6 w-full">
                                <a
                                    href={customerLinks.android}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-36 sm:w-40 h-11 sm:h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 overflow-hidden"
                                    title="Get it on Google Play"
                                >
                                    <img loading="lazy" decoding="async" src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert" />
                                </a>

                                <a
                                    href={customerLinks.ios}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-36 sm:w-40 h-11 sm:h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 overflow-hidden"
                                    title="Download on the App Store"
                                >
                                    <img loading="lazy" decoding="async" src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert" />
                                </a>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start space-x-4 w-full pt-4 border-t border-gray-200">
                                <div>
                                    <div className="text-lg font-extrabold text-[#037166] mb-0.5 text-center lg:text-left">4.8★</div>
                                    <div className="text-[10px] text-gray-500 font-medium">App Rating</div>
                                </div>
                                <div className="h-8 w-px bg-gray-200" />
                                <div>
                                    <div className="text-lg font-extrabold text-[#037166] mb-0.5 text-center lg:text-left">50K+</div>
                                    <div className="text-[10px] text-gray-500 font-medium">Downloads</div>
                                </div>
                                <div className="h-8 w-px bg-gray-200" />
                                <div>
                                    <div className="text-lg font-extrabold text-[#037166] mb-0.5 text-center lg:text-left">100%</div>
                                    <div className="text-[10px] text-gray-500 font-medium">Secure Payments</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Benefits list instead of phone image */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="space-y-4"
                        >
                            <div className="bg-white/80 border border-[#d9ebe7] rounded-2xl p-5 sm:p-6 shadow-lg shadow-[#037166]/5 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-[#0f172a] mb-4">Why download the Customer App?</h3>
                                <div className="space-y-4">
                                    {customerBenefits.map((benefit, i) => (
                                        <div key={i} className="flex gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#037166]/15 to-[#04a99d]/15 flex items-center justify-center flex-shrink-0">
                                                <benefit.icon className="w-5 h-5 text-[#037166]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-0.5">{benefit.title}</h4>
                                                <p className="text-xs text-gray-600 leading-relaxed">{benefit.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </section>

                {/* SECTION 2: PARTNER APP DOWNLOAD */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        
                        {/* Left Column - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-center lg:items-start"
                        >
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#037166]/10 border border-[#037166]/20 backdrop-blur-sm text-[#04a99d] font-semibold text-xs mb-4 shadow-sm">
                                <Users className="w-3.5 h-3.5" />
                                For Service Partners
                            </div>

                            <h1 className="text-2xl text-[#0f172a] md:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight tracking-tight text-center lg:text-left">
                                Grow Your Business{' '}
                                <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent block sm:inline">
                                    10X With Doorstep Hub
                                </span>
                            </h1>

                            <p className="hidden sm:block text-sm text-gray-600 mb-6 leading-relaxed max-w-xl text-left w-full">
                                Verified leads • Instant payments • Zero hassle. Transform your service business today. Join the Doorstep Hub Platform that helps you Earn More, Manage Work Easily, and Reach More Customers.
                            </p>

                            <div className="flex flex-row justify-center lg:justify-start gap-3 mb-6 w-full">
                                <a
                                    href={partnerLinks.android}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-36 sm:w-40 h-11 sm:h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 overflow-hidden"
                                    title="Get it on Google Play"
                                >
                                    <img loading="lazy" decoding="async" src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert" />
                                </a>

                                <a
                                    href={partnerLinks.ios}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-36 sm:w-40 h-11 sm:h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 overflow-hidden"
                                    title="Download on the App Store"
                                >
                                    <img loading="lazy" decoding="async" src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert" />
                                </a>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start space-x-4 w-full pt-4 border-t border-gray-200">
                                <div>
                                    <div className="text-lg font-extrabold text-[#037166] mb-0.5 text-center lg:text-left">700+</div>
                                    <div className="text-[10px] text-gray-500 font-medium">Active Partners</div>
                                </div>
                                <div className="h-8 w-px bg-gray-200" />
                                <div>
                                    <div className="text-lg font-extrabold text-[#037166] mb-0.5 text-center lg:text-left">98%</div>
                                    <div className="text-[10px] text-gray-500 font-medium">Success Rate</div>
                                </div>
                                <div className="h-8 w-px bg-gray-200" />
                                <div>
                                    <div className="text-lg font-extrabold text-[#037166] mb-0.5 text-center lg:text-left">₹25K+</div>
                                    <div className="text-[10px] text-gray-500 font-medium">Avg. Monthly Income</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Benefits list instead of phone image */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="space-y-4"
                        >
                            <div className="bg-white/80 border border-[#d9ebe7] rounded-2xl p-5 sm:p-6 shadow-lg shadow-[#037166]/5 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-[#0f172a] mb-4">Why download the Partner App?</h3>
                                <div className="space-y-4">
                                    {partnerBenefits.map((benefit, i) => (
                                        <div key={i} className="flex gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#037166]/15 to-[#04a99d]/15 flex items-center justify-center flex-shrink-0">
                                                <benefit.icon className="w-5 h-5 text-[#037166]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-0.5">{benefit.title}</h4>
                                                <p className="text-xs text-gray-600 leading-relaxed">{benefit.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
