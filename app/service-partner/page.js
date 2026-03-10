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
    Zap,
    Clock,
    UserCheck,
    MapPin,
    Calendar,
    DollarSign,
    Apple 
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';

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

const PartnerStats = [
    { value: "10K+", label: "Active Partners", icon: Users },
    { value: "98%", label: "Success Rate", icon: TrendingUp },
    { value: "₹25K", label: "Avg Monthly", icon: Wallet },
    { value: "50K+", label: "Happy Customers", icon: Users }
];

export default function ServicePartnerPage() {
    const [appLinks, setAppLinks] = useState({
        android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
        ios: 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
    });


    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });


     const videoRef = React.useRef(null);
    
      React.useEffect(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(error => {
            console.log("Video autoplay failed:", error);
          });
        }
      }, []);

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
                        android: data.policy.vendorAndroidAppLink
                            || data.policy.partnerAndroidAppLink
                            || 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
                        ios: data.policy.vendorIosAppLink
                            || data.policy.partnerIosAppLink
                            || 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
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
                                        className="transition-all duration-300 hover:-translate-y-1 active:scale-95"
                                    >
                                        <img src="/googleplay.png" alt="Get it on Google Play" className="h-14 md:h-16 w-auto" />
                                    </a>

                                    <a
                                        href={appLinks.ios}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-all duration-300 hover:-translate-y-1 active:scale-95"
                                    >
                                        <img src="/apple2.png" alt="Download on the App Store" className="h-14 md:h-16 w-auto" />
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
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 lg:py-22 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f1614]/30 to-transparent pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center max-w-4xl mx-auto mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                                Why Business Owners{' '}
                                <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
                                    Choose Us
                                </span>
                            </h2>
                            <p className="text-xl md:text-lg text-white/70 mx-auto max-w-xl leading-relaxed">
                               Subscribe to our Services and Unlock New Opportunities to Grow your Business. Get Access to More Service Requests, Manage your Bookings Smoothly, and Connect with Customers Looking for your Services Nearby.

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
                                    className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-[#037166]/50 hover:bg-white/10 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Background Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    <div className="relative">
                                        <div className="flex items-center gap-4 mb-6">
                                            <motion.div
                                                className="w-14 h-14 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all duration-500 flex-shrink-0"
                                                whileHover={{ rotate: 5 }}
                                            >
                                                <benefit.icon className="w-7 h-7 text-[#04a99d]" />
                                            </motion.div>
                                            <div>
                                                <div className="inline-flex items-center gap-2 bg-[#037166]/20 text-[#04a99d] px-2 py-0.5 rounded-full text-[10px] font-bold mb-1">
                                                    {benefit.stats}
                                                </div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-[#04a99d] transition-colors leading-tight">
                                                    {benefit.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="text-white/70 leading-relaxed text-base">{benefit.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works — Download App CTA */}
               <section id="app-download" className="relative min-h-screen flex items-center overflow-hidden py-16">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/40 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <a href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-8">
                <Download className="w-4 h-4 text-[#037166]" />
                <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Download Our App</h6>
              </div>
            </a>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent whitespace-nowrap">
                Everything in Your Pocket
              </span>
            </h2>

            <p className="text-[24px] text-gray-400 mb-8 leading-relaxed">
             Join the Doorstep Hub Platform that helps you Earn More, Manage Work Easily, and Reach More Customers
            </p>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {[
                { icon: Zap, text: 'We bring the customers to you' },
                { icon: Shield, text: 'Manage Appointments Easily' },
                { icon: Star, text: 'Increase Your Earnings' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#037166]/20 to-[#025951]/20 border border-[#037166]/30 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-[#037166]" />
                  </div>
                  <h5 className="text-lg text-white">{feature.text}</h5>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#037166] to-[#025951] rounded-2xl text-white font-semibold shadow-xl shadow-[#037166]/40 hover:shadow-2xl hover:shadow-[#037166]/50 transition-all w-full"
                >
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs text-white/90">Download on the</div>
                    <h5 className="text-base ">App Store</h5>
                  </div>
                </motion.button>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-3 px-8 py-4 bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-[#037166]/30 rounded-2xl text-white font-semibold hover:bg-[#037166]/10 transition-all w-full"
                >
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs text-white/90">Get it on</div>
                    <h5 className="text-white font-bold text-transparent">Google Play</h5>
                  </div>
                </motion.button>
              </a>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-8 mt-10 pt-10 border-t border-[#037166]/20"
            >
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">4.8★</div>
                <h6 className="text-sm text-gray-400">App Rating</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">50K+</div>
                <h6 className="text-sm text-gray-400">Downloads</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">10K+</div>
                <h6 className="text-sm text-gray-400">Reviews</h6>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Floating Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[700px] hidden lg:block"
          >
            {/* Main Phone */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-20 left-[32%] -translate-x-1/2 z-10"
            >
              <div className="relative w-72 h-[580px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[3rem] border-8 border-[#2a2a2a] shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#0a0a0a] rounded-b-3xl z-20" />

                {/* Screen */}
                <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-[2.5rem]">
                  <video
                    ref={videoRef}
                    src="/dhubvideo.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-110"
                  />
                </div>

                {/* Screen Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#037166]/30 to-[#02b39a]/30 blur-2xl -z-10" />
              </div>
            </motion.div>

            {/* Secondary Phone (Behind) */}
            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-28 left-[32%] -translate-x-1/2 opacity-40 scale-90 -rotate-12"
            >
              <div className="w-72 h-[580px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[3rem] border-8 border-[#2a2a2a] shadow-2xl" />
            </motion.div>

            {/* Floating Icons */}
            {[
              { Icon: Download, position: { top: '15%', right: '20%' } },
              { Icon: Star, position: { top: '30%', right: '5%' } },
              { Icon: Shield, position: { bottom: '25%', right: '20%' } },
              { Icon: Zap, position: { bottom: '15%', right: '5%' } },
            ].map(({ Icon, position }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  delay: 0.5 + index * 0.1,
                  y: { duration: 2 + index, repeat: Infinity },
                  rotate: { duration: 3 + index, repeat: Infinity },
                }}
                className="absolute"
                style={position}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#037166]/30 to-[#025951]/30 backdrop-blur-md border border-[#037166]/40 rounded-2xl flex items-center justify-center shadow-lg shadow-[#037166]/20">
                  <Icon className="w-8 h-8 text-[#037166]" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
            </main>

            <NewsletterWidget/>

            <Footer />
        </div>
    );
}
