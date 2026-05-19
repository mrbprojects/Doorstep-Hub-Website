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
    Apple,
    Store,
    ShieldCheck,
    CalendarCheck2,
    Headphones,
    IndianRupee
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';
import { ProviderAuthOnboardingSection } from '@/components/provider-auth/ProviderAuthOnboardingSection';

const PartnerBenefits = [
    {
        icon: Shield,
        title: "Trusted Service Badge",
        desc: "Build trust instantly with a verified partner badge that improves customer confidence and conversions.",
        stats: "01",
        color: "from-[#10b981] to-[#059669]"
    },
    {
        icon: Calendar,
        title: "Fast Booking Management",
        desc: "Accept bookings, manage availability, and handle schedules from one streamlined dashboard.",
        stats: "02",
        color: "from-[#3b82f6] to-[#1d4ed8]"
    },
    {
        icon: TrendingUp,
        title: "Business Growth Accelerator",
        desc: "Get more visibility, repeat customers, and long-term growth with consistent service demand.",
        stats: "03",
        color: "from-[#f59e0b] to-[#d97706]"
    }
];
const PartnerCardsData = [
  {
    no: "01",
    title: "Trusted Service Badge",
    desc: "Stand out from competitors with a verified badge that builds customer trust and boosts booking conversions.",
    icon: ShieldCheck,
    iconBg: "from-emerald-400 to-teal-600",
    corner: "from-sky-400 to-cyan-600",
  },
  {
    no: "02",
    title: "Fast Booking Management",
    desc: "Accept bookings, manage availability, and streamline operations with an easy-to-use partner management system.",
    icon: CalendarCheck2,
    iconBg: "from-cyan-300 to-sky-500",
    corner: "from-sky-400 to-cyan-600",
  },
  {
    no: "03",
    title: "Instant Local Lead Generation",
    desc: "Connect with nearby customers actively searching for trusted services in your locality and grow your business faster.",
    icon: MapPin,
    iconBg: "from-teal-300 to-emerald-500",
    corner: "from-green-400 to-emerald-600",
  },
  {
    no: "04",
    title: "Digital Business Presence",
    desc: "Build your digital brand with a professional business profile that showcases your services, reviews, and expertise.",
    icon: Store,
    iconBg: "from-lime-300 to-emerald-500",
    corner: "from-lime-400 to-green-600",
  },
  {
    no: "05",
    title: "Mobile Business Control",
    desc: "Run your entire service business from your smartphone — manage bookings, customers, and more, anytime, anywhere.",
    icon: Smartphone,
    iconBg: "from-teal-300 to-cyan-500",
    corner: "from-teal-400 to-emerald-600",
  },
  {
    no: "06",
    title: "Priority Partner Support",
    desc: "Get dedicated support from our expert partner success team for onboarding, account help, and issue resolution.",
    icon: Headphones,
    iconBg: "from-cyan-300 to-blue-500",
    corner: "from-sky-400 to-cyan-600",
  },
  {
    no: "07",
    title: "Manage Your Own Service Rates",
    desc: "Set your own pricing, create custom packages, update rates anytime, and have full control over your earnings.",
    icon: IndianRupee,
    iconBg: "from-emerald-400 to-lime-500",
    corner: "from-lime-400 to-yellow-500",
  },
  {
    no: "08",
    title: "Business Growth Accelerator",
    desc: "Increase visibility, get more bookings, build customer loyalty, and take your business to new heights.",
    icon: TrendingUp,
    iconBg: "from-lime-300 to-green-500",
    corner: "from-sky-400 to-cyan-600",
  },
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
    const [globalSettings, setGlobalSettings] = useState(null);


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
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success && data.policy) {
                    setGlobalSettings(data.policy);
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
        <div className="relative min-h-screen bg-[#f8fbfa] text-gray-900 overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.1)_1px,transparent_1px)] bg-[size:34px_34px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70" />
            </div>
            <Header />

            <main className="relative z-10 pt-20">
                {/* Hero Section */}
                <section className="relative pt-8 md:pt-10 lg:pt-10 pb-4 md:pb-6 overflow-hidden">
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
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#037166]/10 border border-[#037166]/30 backdrop-blur-sm text-[#04a99d] font-semibold text-sm mb-5 shadow-lg"
                                >
                                    <Star className="w-4 h-4 fill-[#04a99d]" />
                                    Join 10,000+ Verified Professionals
                                </motion.div>

                                <h1 className="text-3xl text-[#0f172a] md:text-5xl lg:text-6xl font-black mb-4 leading-[0.95] tracking-tight">
                                    Grow Your{' '}
                                    <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">
                                        Business 10X
                                    </span>
                                    <br />
                                    
  <span className="whitespace-nowrap bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">
    With Doorstep Hub
  </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-600 mb-7 leading-relaxed max-w-lg">
                                    Verified leads • Instant payments • Zero hassle.
                                    Transform your service business today.
                                </p>

                                <div className="flex flex-row gap-4 mb-6">
                                    <a
                                        href={appLinks.android}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-44 md:w-48 h-14 md:h-16 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                                        title="Get it on Google Play"
                                    >
                                        <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert" />
                                    </a>

                                    <a
                                        href={appLinks.ios}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-44 md:w-48 h-14 md:h-16 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                                        title="Download on the App Store"
                                    >
                                        <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert" />
                                    </a>
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
                                    <div className="w-full max-w-[280px] mx-auto aspect-[10/19] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-[2.7rem] border-[7px] border-[#2a2a2a] shadow-2xl shadow-black/50 overflow-hidden hover:shadow-[#037166]/40 transition-all duration-500">
                                        {/* Screen */}
                                        <div className="h-full relative flex flex-col p-5">
                                            {/* App Header */}
                                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                                                    {globalSettings?.workerLogo ? (
                                                        <img 
                                                            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${globalSettings.workerLogo}`} 
                                                            alt="Partner Logo" 
                                                            className="w-full h-full object-contain p-2"
                                                        />
                                                    ) : (
                                                        <TrendingUp className="w-5 h-5 text-[#037166]" />
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-white/50">₹74000</div>
                                                    <div className="text-sm font-bold text-[#04a99d]">This Month</div>
                                                </div>
                                            </div>

                                            {/* Stats Cards */}
                                            <div className="space-y-3 mb-5">
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
                                            <button className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold shadow-2xl hover:shadow-[#037166]/50 hover:scale-[1.02] transition-all duration-200">
                                                Accept New Job
                                            </button>

                                             {/* Quick Stats */}
                                <div className="flex flex-wrap gap-4 pt-6">
                                    {PartnerStats.slice(0, 2).map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + i * 0.1 }}
                                            className="flex items-center gap-2 p-3 flex-col rounded-xl bg-white border border-[#d9ebe7] shadow-sm"
                                        >
                                            <stat.icon className="w-5 h-5 text-[#04a99d]" />
                                            <div>
                                                <div className="text-sm text-center font-black text-[#0f172a]">{stat.value}</div>
                                                <div className="text-xs text-gray-600">{stat.label}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="relative overflow-hidden bg-[#f8fbfa] px-5 py-16 sm:px-8 lg:px-12">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbfa] via-[#f4faf8] to-[#f8fbfa] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-50 pointer-events-none" />
                    <div className="absolute -top-20 right-0 w-[34rem] h-[34rem] bg-[#00e5c3]/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative mx-auto max-w-7xl z-10">
                        <div className="mx-auto max-w-4xl text-center mb-16">
                            <h2 className="text-4xl font-black leading-tight tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
                                Why Service Partners <br className="sm:hidden" />
                                <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
                                    Choose Doorstep Hub
                                </span>
                            </h2>
                            <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d]" />
                            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-[#475569] sm:text-lg">
                                Join thousands of trusted professionals who are growing their business,
                                getting more leads, and managing bookings effortlessly with Doorstep Hub.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                            {PartnerCardsData.map((card) => (
                                <FeatureCard key={card.no} {...card} />
                            ))}
                        </div>
                    </div>
                </section>

                <ProviderAuthOnboardingSection />

                {/* How It Works — Download App CTA */}
               <section id="app-download" className="relative min-h-screen flex items-center overflow-hidden py-16">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbfa] via-[#f4faf8] to-[#f8fbfa]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

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
                <h6 className="text-sm text-[#037166] font-medium">Download Our App</h6>
              </div>
            </a>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-[#037166]  whitespace-nowrap">
                Download App now ...
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
                  Grow your business
                </span>
              </span>
            </h2>

            <p className="text-[24px] text-gray-600 mb-8 leading-relaxed">
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
                  <h5 className="text-lg text-[#0f172a]">{feature.text}</h5>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-row gap-4">
              <a
                href={appLinks.android}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-44 md:w-48 h-14 md:h-16 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                title="Get it on Google Play"
              >
                <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert" />
              </a>

              <a
                href={appLinks.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-44 md:w-48 h-14 md:h-16 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                title="Download on the App Store"
              >
                <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert" />
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
                <h6 className="text-sm text-gray-600">App Rating</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">50K+</div>
                <h6 className="text-sm text-gray-600">Downloads</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">10K+</div>
                <h6 className="text-sm text-gray-600">Reviews</h6>
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

            <NewsletterWidget splitLayout />

            <Footer />
        </div>
    );
}

function FeatureCard({ no, title, desc, icon: Icon, iconBg, corner }) {
  return (
    <article className="group relative min-h-[300px] overflow-hidden rounded-[26px] border border-[#c8dfda] bg-white p-6 text-center shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-2 hover:border-teal-300/60">
      <div className={`absolute -bottom-9 -right-9 h-28 w-28 rounded-tl-[70px] bg-gradient-to-br ${corner} opacity-15 transition group-hover:scale-110 group-hover:opacity-25`} />
      <div className="absolute inset-0 rounded-[26px] bg-gradient-to-b from-teal-50/50 to-transparent" />
      <div className="absolute left-5 top-5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-sm font-black text-teal-600">
        {no}
      </div>

      <div className="relative mx-auto mt-8 grid h-24 w-24 place-items-center">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${iconBg} opacity-20 blur-lg`} />
        <div className={`relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${iconBg} shadow-md shadow-teal-900/10`}>
          <Icon size={38} className="text-white" strokeWidth={2.2} />
        </div>
      </div>

      <h3 className="relative mt-7 text-xl font-black leading-snug text-[#0f172a]">
        {title}
      </h3>
      <div className="relative mx-auto my-4 h-1 w-12 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300" />
      <p className="relative mx-auto max-w-[260px] text-[15px] font-medium leading-7 text-[#5b6778]">
        {desc}
      </p>
    </article>
  );
}
