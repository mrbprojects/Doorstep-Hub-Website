'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    TrendingUp,
    Users,
    Shield,
    Smartphone,
    ArrowRight,
    Download,
    Star,
    Wallet,
    Clock,
    UserCheck,
    MapPin,
    Calendar,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

const PartnerBenefits = [
    {
        icon: Users,
        title: "Verified Customers",
        desc: "Access 50K+ verified customers actively seeking your services across 10+ cities.",
        stats: "50K+",
        color: "from-[#10b981] to-[#059669]"
    },
    {
        icon: Wallet,
        title: "Guaranteed Payments",
        desc: "Weekly payouts with 0% commission on first 100 bookings. Transparent pricing always.",
        stats: "₹5Cr+",
        color: "from-[#3b82f6] to-[#1d4ed8]"
    },
    {
        icon: Clock,
        title: "Flexible Schedule",
        desc: "Set your availability, accept jobs that fit your schedule. Work when you want.",
        stats: "24/7",
        color: "from-[#f59e0b] to-[#d97706]"
    }
];

const HowItWorksSteps = [
    {
        step: "01",
        title: "Download App",
        desc: "Get the partner app from Play Store or App Store",
        icon: Download
    },
    {
        step: "02",
        title: "Complete Profile",
        desc: "Upload documents & get verified in 24 hours",
        icon: UserCheck
    },
    {
        step: "03",
        title: "Start Earning",
        desc: "Receive jobs, complete service & get paid instantly",
        icon: DollarSign
    }
];

const PartnerStats = [
    { value: "10K+", label: "Active Partners", icon: Users },
    { value: "98%", label: "Success Rate", icon: TrendingUp },
    { value: "₹25K", label: "Avg Monthly", icon: Wallet },
    { value: "50K+", label: "Happy Customers", icon: Users }
];

export default function BecomePartnerPage() {
    const [appLinks, setAppLinks] = useState({
        android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
        ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/get_global_settings', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success && data.policy) {
                    setAppLinks({
                        android: data.policy.customerAndroidAppLink || 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
                        ios: data.policy.customerIosAppLink || 'https://apps.apple.com/in/app/doorstep-hub/id6475340236'
                    });
                }
            } catch (error) {
                console.error('Error fetching dynamic app links:', error);
            }
        };

        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a] text-white overflow-hidden">
            <Header />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#037166]/15 via-[#04a99d]/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#04a99d]/10 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-[#037166]/5 rounded-full blur-[80px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Hero Content */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#037166]/10 border border-[#037166]/30 backdrop-blur-sm text-[#04a99d] font-semibold text-sm mb-8 shadow-lg"
                                >
                                    <Star className="w-4 h-4 fill-[#04a99d]" />
                                    Join 10,000+ Verified Professionals
                                </motion.div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.9] tracking-tight">
                                    Grow Your{' '}
                                    <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">
                                        Business 10X
                                    </span>
                                    <br />
                                    <span className="text-white/70 text-2xl md:text-3xl font-normal tracking-wide">
                                        With Doorstep Hub
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-white/70 mb-10 leading-relaxed max-w-lg">
                                    Verified leads • Instant payments • Zero hassle.
                                    Transform your service business today.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <a
                                        href={appLinks.android}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex-1 flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold shadow-2xl hover:shadow-[#037166]/40 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                                    >
                                        <Download className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                        <div className="text-left">
                                            <span className="block text-xs opacity-80">Available on</span>
                                            <span className="text-lg leading-none font-black">Android</span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-2 transition-transform" />
                                    </a>

                                    <a
                                        href={appLinks.ios}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex-1 flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/8 border-2 border-white/20 backdrop-blur-xl text-white font-bold hover:bg-white/20 hover:border-[#04a99d] hover:shadow-2xl hover:shadow-[#04a99d]/30 transition-all duration-300 hover:-translate-y-2"
                                    >
                                        <Download className="w-6 h-6" />
                                        <div className="text-left">
                                            <span className="block text-xs opacity-80">Available on</span>
                                            <span className="text-lg leading-none font-black">iOS</span>
                                        </div>
                                    </a>

                                </div>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap gap-6 pt-4">
                                    {PartnerStats.slice(0, 2).map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + i * 0.1 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                                        >
                                            <stat.icon className="w-5 h-5 text-[#04a99d]" />
                                            <div>
                                                <div className="text-lg font-black text-white">{stat.value}</div>
                                                <div className="text-xs text-white/60">{stat.label}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Phone Mockup */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.7, x: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative lg:ml-auto"
                            >
                                <div className="relative group">
                                    {/* Phone Container */}
                                    <div className="w-full max-w-xs mx-auto aspect-[10/20] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-[3rem] border-8 border-[#2a2a2a] shadow-2xl shadow-black/50 overflow-hidden hover:shadow-[#037166]/40 transition-all duration-500">
                                        {/* Screen */}
                                        <div className="h-full relative flex flex-col p-6">
                                            {/* App Header */}
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                                <div className="w-12 h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-xl flex items-center justify-center">
                                                    <TrendingUp className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-white/50">₹74000</div>
                                                    <div className="text-sm font-bold text-[#04a99d]">This Month</div>
                                                </div>
                                            </div>

                                            {/* Stats Cards */}
                                            <div className="space-y-4 mb-6">
                                                <div className="p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 backdrop-blur-sm flex items-center gap-4 hover:bg-white/20 transition-all">
                                                    <div className="w-12 h-12 bg-[#037166]/20 rounded-xl flex items-center justify-center">
                                                        <Wallet className="w-6 h-6 text-[#04a99d]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-white/60 truncate">Today's Earnings</div>
                                                        <div className="text-2xl font-black text-white">₹3350</div>
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 backdrop-blur-sm flex items-center gap-4 hover:bg-blue-500/20 transition-all">
                                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                                        <Users className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-white/60 truncate">Pending Jobs</div>
                                                        <div className="text-2xl font-black text-white">7 Active</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold shadow-2xl hover:shadow-[#037166]/50 hover:scale-[1.02] transition-all duration-200">
                                                Accept New Job
                                            </button>
                                        </div>
                                    </div>

                                    {/* Floating Stats */}
                                    {/* <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-16 -right-12 p-4 mb-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-green-500/20">
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-white/70">Avg Rating</div>
                                                <div className="font-black text-white text-lg">4.9⭐</div>
                                            </div>
                                        </div>
                                    </motion.div> */}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 lg:py-32 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f1614]/30 to-transparent pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center max-w-4xl mx-auto mb-20"
                        >
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                                Why 10K+ Partners{' '}
                                <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
                                    Choose Us
                                </span>
                            </h2>
                            <p className="text-xl md:text-2xl text-white/70 mx-auto max-w-2xl leading-relaxed">
                                Built for service professionals. Get everything you need to scale your business.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {PartnerBenefits.map((benefit, index) => (
                                <motion.div
                                    key={benefit.title}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className="group relative p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-[#037166]/50 hover:bg-white/10 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Background Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    <div className="relative">
                                        <motion.div
                                            className="w-20 h-20 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500"
                                            whileHover={{ rotate: 5 }}
                                        >
                                            <benefit.icon className="w-10 h-10 text-[#04a99d] shadow-lg" />
                                        </motion.div>

                                        <div className="mb-4">
                                            <div className="inline-flex items-center gap-2 bg-[#037166]/20 text-[#04a99d] px-3 py-1 rounded-full text-sm font-bold mb-4">
                                                {benefit.stats}
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-[#04a99d] transition-colors">{benefit.title}</h3>
                                        </div>
                                        <p className="text-white/70 leading-relaxed text-lg">{benefit.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
                            {/* Pattern Overlay */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to Start Earning?</h2>
                                    <div className="space-y-8">
                                        {[
                                            { step: "01", text: "Download the Partner App" },
                                            { step: "02", text: "Complete your profile & verification" },
                                            { step: "03", text: "Start accepting bookings" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-full bg-white text-[#037166] font-bold text-xl flex items-center justify-center flex-shrink-0">
                                                    {item.step}
                                                </div>
                                                <p className="text-xl text-white font-medium">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <a
                                        href={appLinks.android}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-8 py-4 mt-4 rounded-xl bg-white text-[#037166] font-bold hover:shadow-xl transition-all inline-flex items-center justify-center"
                                    >
                                        Download App
                                    </a>

                                </div>

                                <div className="hidden lg:block relative">
                                    <div className="absolute -inset-4 bg-white/20 blur-3xl rounded-full" />
                                    <Smartphone className="w-96 h-96 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 rotate-12" />
                                    {/* Placeholder for phone mockup image overlay if needed */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
