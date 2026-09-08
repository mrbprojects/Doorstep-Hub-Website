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
    IndianRupee,
    Mail,
    Send,
    Sparkles,
    Gift,
    Bell,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import dynamic from 'next/dynamic';
import { getStoredProviderSession } from '@/lib/providerAuthApi';
import { LogIn } from 'lucide-react';

const ProviderAuthOnboardingSection = dynamic(() => import('@/components/provider-auth/ProviderAuthOnboardingSection').then(m => m.ProviderAuthOnboardingSection), { ssr: false });
const PartnerLoginModal = dynamic(() => import('@/components/partner/PartnerLoginModal').then(m => m.PartnerLoginModal), { ssr: false });

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
    { value: "700+", label: "Active Partners", icon: Users },
    { value: "98%", label: "Success Rate", icon: TrendingUp },
    { value: "₹25K", label: "Avg Monthly", icon: Wallet },
    { value: "50K+", label: "Happy Customers", icon: Users }
];

export default function ServicePartnerPage() {
    const router = useRouter();
    const [partnerLoginOpen, setPartnerLoginOpen] = useState(false);
    const [isPartnerLoggedIn, setIsPartnerLoggedIn] = useState(false);
    const [appLinks, setAppLinks] = useState({
        android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
        ios: 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
    });
    const [globalSettings, setGlobalSettings] = useState(null);

    useEffect(() => {
        const checkPartnerSession = () => {
            const session = getStoredProviderSession();
            setIsPartnerLoggedIn(Boolean(session?.token));
        };
        checkPartnerSession();
        window.addEventListener('storage', checkPartnerSession);
        window.addEventListener('partner:login-success', checkPartnerSession);
        window.addEventListener('provider-auth:change', checkPartnerSession);
        return () => {
            window.removeEventListener('storage', checkPartnerSession);
            window.removeEventListener('partner:login-success', checkPartnerSession);
            window.removeEventListener('provider-auth:change', checkPartnerSession);
        };
    }, []);


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

    useEffect(() => {
        const openLogin = () => setPartnerLoginOpen(true);
        window.addEventListener('partner:open-login', openLogin);
        return () => window.removeEventListener('partner:open-login', openLogin);
    }, []);

    const handlePartnerLogin = () => {
        const session = getStoredProviderSession();
        if (session?.token && session?.profile) {
            router.push('/partner/dashboard');
            return;
        }
        setPartnerLoginOpen(true);
    };

    const renderDownloadActions = (size = 'hero') => {
        const btnClass =
            size === 'hero'
                ? 'flex items-center justify-center w-44 md:w-48 h-14 md:h-16 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden'
                : 'flex items-center justify-center w-40 md:w-44 h-12 md:h-14 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-lg shadow-[#037166]/20 hover:shadow-xl hover:shadow-[#037166]/35 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden';

        return (
            <div className="flex flex-wrap items-center gap-3">
                <a href={appLinks.android} target="_blank" rel="noopener noreferrer" className={btnClass} title="Get it on Google Play">
                    <img loading="lazy" decoding="async" src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert" />
                </a>
                <a href={appLinks.ios} target="_blank" rel="noopener noreferrer" className={btnClass} title="Download on the App Store">
                    <img loading="lazy" decoding="async" src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert" />
                </a>
                <button
                    type="button"
                    onClick={handlePartnerLogin}
                    className="inline-flex items-center justify-center gap-2 px-5 md:px-6 h-12 md:h-14 rounded-full border-2 border-[#037166] bg-white text-[#037166] font-bold text-sm shadow-md hover:bg-[#037166]/5 transition-all"
                >
                    <LogIn className="w-4 h-4" />
                    Partner Login
                </button>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen bg-[#f8fbfa] text-gray-900 overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.1)_1px,transparent_1px)] bg-[size:34px_34px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70" />
            </div>
            <Header />

            <main className="relative z-10 pt-20">
                {/* Hero Section */}
                <section className="relative pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#037166]/15 via-[#04a99d]/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#04a99d]/10 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-[#037166]/5 rounded-full blur-[80px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
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
                                    Join 700+ Verified Professionals
                                </motion.div>

                                <h1 className="text-3xl text-[#0f172a] md:text-5xl lg:text-6xl font-black mb-4 leading-[0.95] tracking-tight">
                                    <span>
                                        Grow Your{' '}
                                        <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">
                                            Business
                                        </span>
                                        <br />
                                        <span className="whitespace-nowrap bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">
                                            10X With Doorstep Hub
                                        </span>
                                    </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-600 mb-7 leading-relaxed max-w-lg">
                                    Verified leads • Instant payments • Zero hassle.
                                    Transform your service business today.
                                </p>

                                <div className="mb-6">
                                    {renderDownloadActions('hero')}
                                </div>

                              
                            </motion.div>

                            {/* Phone Mockup */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative lg:ml-auto flex justify-center items-center"
                            >
                                <div className="relative group max-w-[210px] sm:max-w-[230px] md:max-w-[250px] w-full flex justify-center">
                                    {/* Background glow */}
                                    <div className="absolute -inset-2 bg-gradient-to-r from-[#037166]/25 to-[#04a99d]/25 rounded-[2.5rem] blur-lg opacity-60 group-hover:opacity-100 transition duration-500" />
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src="/service-partner-phone-image.webp"
                                        alt="Doorstep Hub Service Partner App"
                                        className="relative w-full h-auto max-h-[420px] sm:max-h-[440px] md:max-h-[460px] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
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
                                <span className="whitespace-nowrap">Why Service Partners</span>
                                <br />
                                <span className="whitespace-nowrap bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
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

                {isPartnerLoggedIn && <SubscriptionPlansSection />}

                {/* How It Works — Download App CTA */}
               <section id="app-download" className="relative min-h-[82vh] lg:min-h-[86vh] flex items-center overflow-hidden py-8 lg:py-10">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbfa] via-[#f4faf8] to-[#f8fbfa]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              <span className="text-[#037166]  whitespace-nowrap">
                Download App now ...
                <br />
                <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
                  Grow your business services
                </span>
              </span>
            </h2>

            <p className="text-lg lg:text-xl text-gray-600 mb-5 leading-relaxed">
             Join the Doorstep Hub Platform that helps you Earn More, Manage Work Easily, and Reach More Customers
            </p>

            {/* Features */}
            <div className="space-y-2.5 mb-6">
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
                  <div className="w-9 h-9 bg-gradient-to-br from-[#037166]/20 to-[#025951]/20 border border-[#037166]/30 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-[#037166]" />
                  </div>
                  <h5 className="text-[15px] lg:text-base text-[#0f172a]">{feature.text}</h5>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-row gap-3">
              {renderDownloadActions('compact')}
            </div>


            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-5 mt-6 pt-6 border-t border-[#037166]/20"
            >
              <div>
                <div className="text-xl font-bold text-[#037166] mb-1">4.8★</div>
                <h6 className="text-sm text-gray-600">Google Rating</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-xl font-bold text-[#037166] mb-1">5K+</div>
                <h6 className="text-sm text-gray-600">Downloads</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-xl font-bold text-[#037166] mb-1">1K+</div>
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
            className="relative h-[520px] hidden lg:block"
          >
            {/* Main Phone */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 left-[32%] -translate-x-1/2 z-10"
            >
              <div className="relative w-56 h-[460px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2.5rem] border-[7px] border-[#2a2a2a] shadow-2xl overflow-hidden">
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
              className="absolute top-14 left-[32%] -translate-x-1/2 opacity-35 scale-90 -rotate-12"
            >
              <div className="w-56 h-[460px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2.5rem] border-[7px] border-[#2a2a2a] shadow-2xl" />
            </motion.div>

            {/* Floating Icons */}
            {[
              { Icon: Download, position: { top: '14%', left: '4%' } },
              { Icon: Star, position: { bottom: '20%', left: '6%' } },
              { Icon: Shield, position: { top: '18%', right: '6%' } },
              { Icon: Zap, position: { bottom: '16%', right: '4%' } },
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

            <div className="bg-white">
              <NewsletterSectionFunctional />
            </div>

            <Footer />
            <PartnerLoginModal isOpen={partnerLoginOpen} onClose={() => setPartnerLoginOpen(false)} />
        </div>
    );
}

function NewsletterSectionFunctional() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('subscribe');
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const REQUEST_TIMEOUT_MS = 12000;

  const fetchWithTimeout = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setStep('verify');
        setMessage('Verification OTP sent to your email.');
      } else {
        setIsError(true);
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setIsError(true);
      setMessage(error?.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.success) {
        setIsSubscribed(true);
        setMessage('Successfully subscribed! Welcome to our newsletter.');
        setTimeout(() => {
          setStep('subscribe');
          setEmail('');
          setOtp('');
          setIsSubscribed(false);
          setMessage('');
        }, 3000);
      } else {
        setIsError(true);
        setMessage(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setIsError(true);
      setMessage(error?.name === 'AbortError' ? 'Verification timed out. Please try again.' : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,170,150,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(0,210,190,0.1),transparent_32%)]" />
      <div className="absolute left-20 top-20 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute right-20 bottom-10 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[34px] border border-[#d6ece8] bg-[#f7fffc] p-1 shadow-xl shadow-[#037166]/10 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-teal-400/10" />

          <div className="relative grid items-center gap-8 rounded-[30px] bg-gradient-to-br from-white to-[#effffb] p-6 text-slate-900 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div className="relative hidden lg:block">
              <div className="relative rounded-[28px] border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-lg shadow-teal-900/10">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/30">
                  <Mail size={40} />
                </div>
                <div className="mt-8 space-y-4">
                  <Benefit icon={Gift} text="Exclusive service offers" />
                  <Benefit icon={Bell} text="Instant booking updates" />
                  <Benefit icon={ShieldCheck} text="Trusted Doorstep Hub alerts" />
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-black text-teal-700 lg:mx-0">
                <Sparkles size={17} /> Stay Connected
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Exclusive Offers & <span className="text-teal-700">Smart Updates</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600 lg:mx-0">
                Get the latest service discounts, exclusive partner offers, booking
                deals, seasonal promotions, and important updates delivered
                directly to your inbox.
              </p>

              <form onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify} className="mt-8 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                  <input
                    type={step === 'subscribe' ? 'email' : 'text'}
                    value={step === 'subscribe' ? email : otp}
                    onChange={(e) => (step === 'subscribe' ? setEmail(e.target.value) : setOtp(e.target.value))}
                    placeholder={step === 'subscribe' ? 'Enter your email address' : 'Enter 6-digit OTP'}
                    required
                    disabled={loading || isSubscribed}
                    maxLength={step === 'subscribe' ? undefined : 6}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-14 text-base font-semibold text-slate-800 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || isSubscribed}
                  className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-500 px-7 text-base font-black text-white shadow-lg shadow-teal-600/25 transition hover:-translate-y-1 hover:shadow-teal-600/35 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : step === 'subscribe' ? 'Get Exclusive Access' : 'Verify OTP'}
                  <Send size={20} className="transition group-hover:translate-x-1" />
                </button>
              </form>

              {step === 'verify' && !isSubscribed && (
                <button
                  type="button"
                  onClick={() => setStep('subscribe')}
                  className="mt-3 text-sm text-slate-500 hover:text-teal-700"
                >
                  Change email address
                </button>
              )}

              {message && (
                <p className={`mt-4 font-semibold ${isError ? 'text-red-500' : 'text-teal-700'}`}>
                  {message}
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-500 lg:justify-start">
                <SmallPoint text="No spam" />
                <SmallPoint text="Latest deals" />
                <SmallPoint text="Easy unsubscribe" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefit({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
        <Icon size={22} />
      </div>
      <p className="font-black text-slate-800">{text}</p>
    </div>
  );
}

function SmallPoint({ text }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckCircle2 size={17} className="text-teal-600" />
      {text}
    </span>
  );
}


function FeatureCard({ no, title, desc, icon: Icon, iconBg, corner }) {
  return (
    <article className="group relative min-h-[270px] overflow-hidden rounded-[24px] border border-[#c8dfda] bg-white p-5 text-center shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-2 hover:border-teal-300/60">
      <div className={`absolute -bottom-9 -right-9 h-28 w-28 rounded-tl-[70px] bg-gradient-to-br ${corner} opacity-15 transition group-hover:scale-110 group-hover:opacity-25`} />
      <div className="absolute inset-0 rounded-[26px] bg-gradient-to-b from-teal-50/50 to-transparent" />
      <div className="absolute left-4 top-4 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-black text-teal-600">
        {no}
      </div>

      <div className="relative mx-auto mt-6 grid h-20 w-20 place-items-center">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${iconBg} opacity-20 blur-lg`} />
        <div className={`relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${iconBg} shadow-md shadow-teal-900/10`}>
          <Icon size={30} className="text-white" strokeWidth={2.2} />
        </div>
      </div>

      <h3 className="relative mt-5 min-h-[50px] text-lg font-black leading-snug text-[#0f172a] line-clamp-2">
        {title}
      </h3>
      <div className="relative mx-auto my-3 h-1 w-10 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300" />
      <p className="relative mx-auto max-w-[240px] text-sm font-medium leading-6 text-[#5b6778]">
        {desc}
      </p>
    </article>
  );
}

// Color themes applied by index for up to 6 plans from the API
const PLAN_THEMES = [
  {
    headerBg: 'from-slate-800 to-[#025951]',
    glowColor: 'group-hover:shadow-emerald-500/10',
    color: 'border-slate-100 hover:border-emerald-500/30',
    buttonStyle: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200',
  },
  {
    headerBg: 'from-[#037166] to-[#04a99d]',
    glowColor: 'group-hover:shadow-teal-500/25',
    color: 'border-[#037166] md:scale-105 shadow-xl shadow-[#037166]/10 z-10 hover:border-[#04a99d]',
    buttonStyle: 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white hover:opacity-95 shadow-md shadow-[#037166]/20',
  },
  {
    headerBg: 'from-amber-600 to-yellow-500',
    glowColor: 'group-hover:shadow-amber-500/25',
    color: 'border-amber-100 hover:border-amber-500/40',
    buttonStyle: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-95 shadow-md shadow-amber-500/20',
  },
  {
    headerBg: 'from-violet-700 to-purple-500',
    glowColor: 'group-hover:shadow-purple-500/25',
    color: 'border-violet-100 hover:border-purple-400/40',
    buttonStyle: 'bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:opacity-95 shadow-md shadow-violet-500/20',
  },
  {
    headerBg: 'from-rose-600 to-pink-500',
    glowColor: 'group-hover:shadow-rose-500/25',
    color: 'border-rose-100 hover:border-rose-400/40',
    buttonStyle: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-95 shadow-md shadow-rose-500/20',
  },
  {
    headerBg: 'from-sky-700 to-cyan-500',
    glowColor: 'group-hover:shadow-sky-500/25',
    color: 'border-sky-100 hover:border-sky-400/40',
    buttonStyle: 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white hover:opacity-95 shadow-md shadow-sky-500/20',
  },
];

function PlanSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-[36px] overflow-hidden flex flex-col animate-pulse">
      <div className="h-36 bg-slate-200" />
      <div className="p-8 flex-1 flex flex-col gap-5">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-10 w-36 bg-slate-200 rounded" />
        <div className="h-px w-full bg-slate-100" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
              <div className="h-3 bg-slate-200 rounded flex-1" />
            </div>
          ))}
        </div>
        <div className="h-12 bg-slate-200 rounded-2xl mt-auto" />
      </div>
    </div>
  );
}

function SubscriptionPlansSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiPlans, setApiPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    const checkPartnerSession = () => {
      const session = getStoredProviderSession();
      setIsLoggedIn(Boolean(session?.token));
    };
    checkPartnerSession();
    window.addEventListener('storage', checkPartnerSession);
    window.addEventListener('partner:login-success', checkPartnerSession);
    window.addEventListener('provider-auth:change', checkPartnerSession);
    return () => {
      window.removeEventListener('storage', checkPartnerSession);
      window.removeEventListener('partner:login-success', checkPartnerSession);
      window.removeEventListener('provider-auth:change', checkPartnerSession);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchPlans = async () => {
      try {
        const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
        const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/get_subscription_plans`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setApiPlans(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch subscription plans:', err);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  // Map API plans to display format
  const plans = apiPlans.map((plan, index) => {
    const theme = PLAN_THEMES[index % PLAN_THEMES.length];
    const features = (plan.availableFeatures || []).map(f =>
      typeof f === 'string' ? f : (f?.name || f?.availableFeatures || JSON.stringify(f))
    ).filter(Boolean);
    const price = plan.price ? `₹${Number(plan.price).toLocaleString('en-IN')}` : 'Free';
    const validDays = plan.validDays || plan.planValidityDays;
    const period = validDays === 'unlimited' ? 'Unlimited' : validDays ? `${validDays} Days` : 'Plan';
    const badge = index === 0 ? '★ BASIC PLAN' : index === 1 ? '🔥 MOST POPULAR' : index === apiPlans.length - 1 ? '👑 PREMIUM ACCESS' : `PLAN ${index + 1}`;

    return {
      badge,
      title: plan.name || 'Subscription Plan',
      price,
      period,
      tagline: plan.description || '',
      highlights: features,
      ...theme,
    };
  });

  const handlePlanSelection = (planTitle) => {
    if (typeof window !== 'undefined') {
      const session = getStoredProviderSession();
      if (session?.token && session?.profile) {
        window.location.href = '/partner/dashboard/subscription';
      } else {
        localStorage.setItem('pending_subscription_plan', planTitle);
        window.dispatchEvent(new CustomEvent('partner:open-login'));
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#037166]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-10 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-20">
          <span className="text-[#037166] text-xs sm:text-sm font-black tracking-[0.3em] uppercase">
            Become a Partner
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 mb-4 leading-tight tracking-tight">
            Flexible <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">Subscription Plans</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Choose a plan that fits your business model. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-6 lg:gap-8 items-stretch mx-auto ${
          plans.length === 1 ? 'max-w-sm md:grid-cols-1' :
          plans.length === 2 ? 'max-w-3xl md:grid-cols-2' :
          plans.length >= 4 ? 'max-w-7xl md:grid-cols-2 xl:grid-cols-4' :
          'max-w-5xl md:grid-cols-3'
        }`}>
          {plansLoading ? (
            [1, 2, 3].map(i => <PlanSkeleton key={i} />)
          ) : plans.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-slate-400 font-semibold">
              No subscription plans available at the moment.
            </div>
          ) : (
            plans.map((plan, index) => (
              <div
                key={index}
                className={`group bg-white rounded-3xl overflow-hidden flex flex-col border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${plan.color} ${plan.glowColor}`}
              >
                {/* ── Card Header ── */}
                <div className={`bg-gradient-to-br ${plan.headerBg} px-6 pt-6 pb-8 text-white relative overflow-hidden`}>
                  {/* Decorative glow orbs */}
                  <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />

                  {/* Badge pill */}
                  <span className="relative z-10 inline-block text-[9px] font-black tracking-widest uppercase bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                    {plan.badge}
                  </span>

                  {/* Plan Name — no description here */}
                  <h3 className="relative z-10 text-xl font-black text-white leading-snug">
                    {plan.title}
                  </h3>
                </div>

                {/* ── Card Body ── */}
                <div className="px-6 pt-5 pb-6 flex-1 flex flex-col gap-4">

                  {/* Tagline chip — short, 2-line max */}
                  {plan.tagline ? (
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 border-l-2 border-[#037166]/40 pl-3">
                      {plan.tagline}
                    </p>
                  ) : null}

                  {/* Pricing */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                      Subscription Fee
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-400 font-bold text-xs">/ {plan.period}</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Features */}
                  {plan.highlights.length > 0 && (
                    <ul className="space-y-2.5 flex-1">
                      {plan.highlights.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          </div>
                          <span className="text-xs text-slate-600 font-medium leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => handlePlanSelection(plan.title)}
                    className={`mt-2 w-full py-3 rounded-2xl text-sm font-bold transition-all text-center tracking-wide ${plan.buttonStyle}`}
                  >
                    Get Started →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

