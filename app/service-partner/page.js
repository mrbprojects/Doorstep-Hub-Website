'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Smartphone,
    MapPin,
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
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import dynamic from 'next/dynamic';
import { getStoredProviderSession, getProviderProfile, saveStoredProviderSession } from '@/lib/providerAuthApi';

const ProviderAuthOnboardingSection = dynamic(() => import('@/components/provider-auth/ProviderAuthOnboardingSection').then(m => m.ProviderAuthOnboardingSection), { ssr: false });
const PartnerLoginModal = dynamic(() => import('@/components/partner/PartnerLoginModal').then(m => m.PartnerLoginModal), { ssr: false });
import { PartnerAppDownload } from '@/components/partner/PartnerAppDownload';
import { PartnerHero } from '@/components/partner/PartnerHero';

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


export default function ServicePartnerPage() {
    const router = useRouter();
    const [partnerLoginOpen, setPartnerLoginOpen] = useState(false);
    const [isPartnerLoggedIn, setIsPartnerLoggedIn] = useState(false);
    const [appLinks, setAppLinks] = useState({
        android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
        ios: 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
    });

    useEffect(() => {
        let isMounted = true;
        const checkPartnerSession = async () => {
            const session = getStoredProviderSession();
            if (!session?.token) {
                if (isMounted) setIsPartnerLoggedIn(false);
                return;
            }

            // Check if user has a verified, registered partner profile
            const profile = session?.profile;
            if (profile && (profile._id || profile.id || profile.phone || profile.mobile || profile.name || profile.email || profile.businessName)) {
                if (isMounted) setIsPartnerLoggedIn(true);
                return;
            }

            // If token exists but profile was not cached, try fetching partner profile
            if (session?.userId) {
                try {
                    const fetchedProfile = await getProviderProfile(session.token, session.userId);
                    if (fetchedProfile && (fetchedProfile._id || fetchedProfile.id || fetchedProfile.phone || fetchedProfile.mobile || fetchedProfile.name || fetchedProfile.email)) {
                        saveStoredProviderSession({ ...session, profile: fetchedProfile });
                        if (isMounted) setIsPartnerLoggedIn(true);
                        return;
                    }
                } catch {
                    // Not a registered partner profile
                }
            }

            if (isMounted) setIsPartnerLoggedIn(false);
        };

        checkPartnerSession();
        window.addEventListener('storage', checkPartnerSession);
        window.addEventListener('partner:login-success', checkPartnerSession);
        window.addEventListener('provider-auth:change', checkPartnerSession);
        return () => {
            isMounted = false;
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


    return (
        <div className="relative min-h-screen bg-[#f8fbfa] text-gray-900 overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.1)_1px,transparent_1px)] bg-[size:34px_34px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70" />
            </div>
            <Header />

            <main className="relative z-10 pt-16 sm:pt-20">
                {/* Redesigned Partner Hero Section */}
                <PartnerHero
                    appLinks={appLinks}
                    onPartnerLogin={handlePartnerLogin}
                />

                {/* Benefits Section */}
                <section className="relative overflow-hidden bg-[#f8fbfa] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbfa] via-[#f4faf8] to-[#f8fbfa] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,115,103,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,103,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-50 pointer-events-none" />
                    <div className="absolute -top-20 right-0 w-[34rem] h-[34rem] bg-[#00e5c3]/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative mx-auto max-w-7xl z-10">
                        <div className="mx-auto max-w-4xl text-center mb-8 sm:mb-10">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-[#0f172a]">
                                <span>Why Service Partners</span>
                                <br />
                                <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
                                    Choose Doorstep Hub
                                </span>
                            </h2>
                            <div className="mx-auto mt-2.5 h-1 w-20 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d]" />
                            <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-[#475569]">
                                Join thousands of trusted professionals who are growing their business,
                                getting more leads, and managing bookings effortlessly with Doorstep Hub.
                            </p>
                        </div>

                        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {PartnerCardsData.map((card) => (
                                <FeatureCard key={card.no} {...card} />
                            ))}
                        </div>
                    </div>
                </section>

                <ProviderAuthOnboardingSection />

                {isPartnerLoggedIn && <SubscriptionPlansSection isPartnerLoggedIn={isPartnerLoggedIn} />}

                {/* Partner App Download / Grow Your Business Section */}
                <PartnerAppDownload
                    appLinks={appLinks}
                    onPartnerLogin={handlePartnerLogin}
                />
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
    <section className="relative overflow-hidden bg-white px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,170,150,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(0,210,190,0.1),transparent_32%)]" />
      <div className="absolute left-20 top-20 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute right-20 bottom-10 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[28px] border border-[#d6ece8] bg-[#f7fffc] p-1 shadow-xl shadow-[#037166]/10 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-teal-400/10" />

          <div className="relative grid items-center gap-6 rounded-[24px] bg-gradient-to-br from-white to-[#effffb] p-5 text-slate-900 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
            <div className="relative hidden lg:block">
              <div className="relative rounded-[22px] border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4 shadow-md shadow-teal-900/10">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/30">
                  <Mail size={32} />
                </div>
                <div className="mt-6 space-y-3">
                  <Benefit icon={Gift} text="Exclusive service offers" />
                  <Benefit icon={Bell} text="Instant booking updates" />
                  <Benefit icon={ShieldCheck} text="Trusted Doorstep Hub alerts" />
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-black text-teal-700 lg:mx-0">
                <Sparkles size={14} /> Stay Connected
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Exclusive Offers & <span className="text-teal-700">Smart Updates</span>
              </h2>
              <p className="mx-auto mt-2.5 max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-slate-600 lg:mx-0">
                Get the latest service discounts, exclusive partner offers, booking
                deals, seasonal promotions, and important updates delivered
                directly to your inbox.
              </p>

              <form onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={step === 'subscribe' ? 'email' : 'text'}
                    value={step === 'subscribe' ? email : otp}
                    onChange={(e) => (step === 'subscribe' ? setEmail(e.target.value) : setOtp(e.target.value))}
                    placeholder={step === 'subscribe' ? 'Enter your email address' : 'Enter 6-digit OTP'}
                    required
                    disabled={loading || isSubscribed}
                    maxLength={step === 'subscribe' ? undefined : 6}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-11 text-sm font-semibold text-slate-800 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || isSubscribed}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-500 px-6 text-sm font-black text-white shadow-md shadow-teal-600/25 transition hover:-translate-y-0.5 hover:shadow-teal-600/35 disabled:opacity-50"
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
    <article className="group relative min-h-[220px] sm:min-h-[240px] overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#c8dfda] bg-white p-4 sm:p-5 text-center shadow-md shadow-black/5 transition duration-300 hover:-translate-y-1.5 hover:border-teal-300/60">
      <div className={`absolute -bottom-9 -right-9 h-28 w-28 rounded-tl-[70px] bg-gradient-to-br ${corner} opacity-15 transition group-hover:scale-110 group-hover:opacity-25`} />
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-teal-50/50 to-transparent" />
      <div className="absolute left-3.5 top-3.5 rounded-lg border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-black text-teal-600">
        {no}
      </div>

      <div className="relative mx-auto mt-4 sm:mt-5 grid h-16 w-16 place-items-center">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${iconBg} opacity-20 blur-lg`} />
        <div className={`relative grid h-13 w-13 place-items-center rounded-xl bg-gradient-to-br ${iconBg} shadow-md shadow-teal-900/10`}>
          <Icon size={26} className="text-white" strokeWidth={2.2} />
        </div>
      </div>

      <h3 className="relative mt-3.5 min-h-[40px] text-base font-black leading-snug text-[#0f172a] line-clamp-2">
        {title}
      </h3>
      <div className="relative mx-auto my-2.5 h-1 w-8 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300" />
      <p className="relative mx-auto max-w-[240px] text-xs sm:text-[13px] font-medium leading-relaxed text-[#5b6778]">
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

function SubscriptionPlansSection({ isPartnerLoggedIn = false }) {
  const [isLoggedIn, setIsLoggedIn] = useState(isPartnerLoggedIn);
  const [apiPlans, setApiPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    setIsLoggedIn(isPartnerLoggedIn);
  }, [isPartnerLoggedIn]);

  useEffect(() => {
    let isMounted = true;
    const checkPartnerSession = async () => {
      const session = getStoredProviderSession();
      if (!session?.token) {
        if (isMounted) setIsLoggedIn(false);
        return;
      }
      const profile = session?.profile;
      if (profile && (profile._id || profile.id || profile.phone || profile.mobile || profile.name || profile.email || profile.businessName)) {
        if (isMounted) setIsLoggedIn(true);
        return;
      }
      if (session?.userId) {
        try {
          const fetchedProfile = await getProviderProfile(session.token, session.userId);
          if (fetchedProfile && (fetchedProfile._id || fetchedProfile.id || fetchedProfile.phone || fetchedProfile.mobile || fetchedProfile.name || fetchedProfile.email)) {
            saveStoredProviderSession({ ...session, profile: fetchedProfile });
            if (isMounted) setIsLoggedIn(true);
            return;
          }
        } catch {
          // not registered
        }
      }
      if (isMounted) setIsLoggedIn(false);
    };

    checkPartnerSession();
    window.addEventListener('storage', checkPartnerSession);
    window.addEventListener('partner:login-success', checkPartnerSession);
    window.addEventListener('provider-auth:change', checkPartnerSession);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', checkPartnerSession);
      window.removeEventListener('partner:login-success', checkPartnerSession);
      window.removeEventListener('provider-auth:change', checkPartnerSession);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let isMounted = true;
    const fetchPlans = async () => {
      try {
        const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
        const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/get_subscription_plans`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setApiPlans(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch subscription plans:', err);
      } finally {
        if (isMounted) setPlansLoading(false);
      }
    };
    fetchPlans();
    return () => {
      isMounted = false;
    };
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
    <section className="py-10 sm:py-14 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#037166]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-10 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[#037166] text-xs font-black tracking-[0.25em] uppercase">
            Become a Partner
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 mb-3 leading-tight tracking-tight">
            Flexible <span className="bg-gradient-to-r from-[#037166] via-[#04a99d] to-[#10b981] bg-clip-text text-transparent">Subscription Plans</span>
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto font-medium">
            Choose a plan that fits your business model. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-4 sm:gap-6 items-stretch mx-auto ${
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

