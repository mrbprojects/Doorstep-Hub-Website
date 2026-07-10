'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MobileNumberPage } from './MobileNumberPage';
import { OtpVerificationPage } from './OtpVerificationPage';
import { RegisterPage } from './RegisterPage';
import { RegistrationSuccessPage } from './RegistrationSuccessPage';
import {
  getProviderProfile,
  registerProvider,
  sendWhatsAppOtp,
  verifyProviderOtp,
} from '@/lib/providerAuthApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Users,
  ShieldCheck,
  Target,
  IndianRupee,
  CalendarDays,
  Smartphone,
  Headphones,
  BriefcaseBusiness,
  Star,
  Building2,
  CheckCircle2,
  ArrowRight,
  BadgeCheck,TrendingUp } from 'lucide-react';
import { Check } from 'lucide-react';
import Link from 'next/link';

const SESSION_KEY = 'provider_partner_session';
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

function normalizeId(value) {
  return String(value || '').trim();
}

export function ProviderAuthOnboardingSection() {
  const [step, setStep] = useState('idle');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState({ mobile: false, otp: false, register: false, profile: false });
  const [error, setError] = useState({ mobile: '', otp: '', register: '', profile: '' });

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setPhone(parsed.phone || '');
      setToken(parsed.token || '');
      setUserId(parsed.userId || '');
      setProfile(parsed.profile || null);
      // We start at idle as requested, but keep data ready
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const resetForm = () => {
    setStep('idle');
    setPhone('');
    setOtp('');
    setToken('');
    setUserId('');
    setProfile(null);
    localStorage.removeItem(SESSION_KEY);
  };

  useEffect(() => {
    if (step !== 'success') return;
    // Manual reset handled by individual pages
  }, [step]);

  function persist(next) {
    const data = {
      phone: next.phone ?? phone,
      token: next.token ?? token,
      userId: next.userId ?? userId,
      profile: next.profile ?? profile,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setPhone(data.phone || '');
    setToken(data.token || '');
    setUserId(data.userId || '');
    setProfile(data.profile || null);
  }

  async function loadProfile(authToken, nextPhone, onNotFoundStep = 'register', currentUserId = null) {
    const activeUserId = currentUserId || userId;
    setLoading((prev) => ({ ...prev, profile: true }));
    setError((prev) => ({ ...prev, profile: '' }));
    try {
      const nextProfile = await getProviderProfile(authToken, activeUserId);
      persist({ token: authToken, phone: nextPhone, profile: nextProfile, userId: activeUserId });
      setStep('success');
      toast.success('Registration successful');
      return true;
    } catch (err) {
      persist({ token: authToken, phone: nextPhone, profile: null });
      setStep(onNotFoundStep);
      if (!/not found|register|profile/i.test(err.message || '')) {
        setError((prev) => ({ ...prev, profile: err.message || 'Failed to fetch profile' }));
      }
      return false;
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }

  async function submitPhone(event) {
    event.preventDefault();
    setError((prev) => ({ ...prev, mobile: '' }));
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError((prev) => ({ ...prev, mobile: 'Enter a valid 10-digit mobile number.' }));
      return;
    }
    setLoading((prev) => ({ ...prev, mobile: true }));
    try {
      const response = await sendWhatsAppOtp(phone);
      setOtp('');
      toast.success(response?.message || 'OTP sent');
      setStep('otp');
    } catch (err) {
      setError((prev) => ({ ...prev, mobile: err.message || 'Failed to send OTP' }));
    } finally {
      setLoading((prev) => ({ ...prev, mobile: false }));
    }
  }

  async function submitOtp(event) {
    event.preventDefault();
    setError((prev) => ({ ...prev, otp: '' }));
    if (!/^\d{4,6}$/.test(otp)) {
      setError((prev) => ({ ...prev, otp: 'Enter a valid OTP.' }));
      return;
    }
    setLoading((prev) => ({ ...prev, otp: true }));
    try {
      const { payload, token: authToken, userId: verifiedUserId } = await verifyProviderOtp(phone, otp);
      if (!authToken) throw new Error('No auth token received from verifyOTP.');
      toast.success(payload?.message || 'OTP verified');
      persist({ token: authToken, userId: verifiedUserId, phone, profile: null });
      setIsNewUser(false);
      await loadProfile(authToken, phone, 'register', verifiedUserId);
    } catch (err) {
      setError((prev) => ({ ...prev, otp: err.message || 'OTP verification failed' }));
    } finally {
      setLoading((prev) => ({ ...prev, otp: false }));
    }
  }

  async function submitRegister(data) {
    setError((prev) => ({ ...prev, register: '' }));
    setIsNewUser(true);
    setLoading((prev) => ({ ...prev, register: true }));
    try {
      const resolvedUserId = data.userId || userId;
      const serviceId = normalizeId(data.serviceId);
      const categoryId = normalizeId(data.categoryId);
      const subcategoryId = normalizeId(data.subcategoryId);

      if (!OBJECT_ID_REGEX.test(serviceId) || !OBJECT_ID_REGEX.test(categoryId) || !OBJECT_ID_REGEX.test(subcategoryId)) {
        throw new Error('Invalid service/category/subcategory id format. Please reselect from dropdowns.');
      }

      const registerPayload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cityId: data.cityId,
        cityName: data.cityName,
        stateId: data.stateId,
        stateName: data.stateName,
        countryId: data.countryId,
        countryName: data.countryName,
        serviceId,
        serviceName: data.serviceName,
        categoryId,
        categoryName: data.categoryName,
        subcategoryId,
        subcategoryName: data.subcategoryName,
        serviceCategoryId: [categoryId],
        serviceSubCategoryId: [subcategoryId],
        professionalServiceId: serviceId,
        professionalServiceCategoryId: [categoryId],
        professionalServiceSubCategoryId: [subcategoryId],
      };
      if (resolvedUserId) {
        registerPayload.userId = resolvedUserId;
      }

      const response = await registerProvider(token, registerPayload);
      const registeredUserId = response?.data?._id || resolvedUserId;
      toast.success('Registration completed!');
      await loadProfile(token, phone, 'success', registeredUserId);
    } catch (err) {
      setError((prev) => ({ ...prev, register: err.message || 'Registration failed' }));
    } finally {
      setLoading((prev) => ({ ...prev, register: false }));
    }
  }

return (
  <section
    id="join-partner"
    className={`relative overflow-hidden bg-[#f8fbfa] transition-all duration-500 ${
      step === 'success' || step === 'profile'
        ? 'py-6'
        : 'py-8 lg:py-10'
    }`}
  >

    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {step === 'idle' ? (
          <motion.div
            key="idle-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center"
          >
            {/* Top Heading */}
            <div className="mx-auto text-center">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#037166]/20 bg-[#037166]/5 px-6 py-2 text-sm font-black uppercase tracking-wide text-[#037166] shadow-sm backdrop-blur-xl">
                <Users size={17} />
                Join Our Growing Network
              </div>

              <h1 className="mx-auto max-w-4xl text-2xl font-extrabold leading-[1.1] tracking-tight text-[#0f172a] sm:text-4xl lg:text-[2.6rem]">
                Start Your Journey <br />
                as a{" "}
                <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
                  Partner
                </span>
              </h1>

              <p className="mx-auto mt-2 max-w-xl text-xs font-medium leading-6 text-[#5b6778] sm:text-sm">
                Register today and join 50,000+ professionals growing their
                business with Doorstep Hub.
              </p>
              {token && profile && (
                <Link
                  href="/partner/dashboard"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#037166] text-white font-bold rounded-xl shadow-md hover:bg-[#025951] transition-all"
                >
                  Open Partner Dashboard
                </Link>
              )}
            </div>

            {/* Hero Layout */}
            <div className="relative mt-1 grid w-full items-start gap-6 lg:grid-cols-[1fr_1.1fr_1fr]">
              {/* Left Benefits */}
              <div className="space-y-4 lg:space-y-6 pt-3 lg:pt-5">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Verified & Trusted",
                    desc: "Build customer trust with our verified partner badge.",
                    color: "text-[#037166]",
                  },
                  {
                    icon: Target,
                    title: "More Leads, More Jobs",
                    desc: "Get instant service requests from nearby customers.",
                    color: "text-[#037166]",
                  },
                  {
                    icon: IndianRupee,
                    title: "Set Your Own Rates",
                    desc: "Manage your service prices and grow your earnings.",
                    color: "text-[#037166]",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#bfe0d8] bg-[#eefaf7] shadow-sm transition group-hover:scale-105 group-hover:border-teal-300/60">
                          <Icon className={item.color} size={18} />
                        </div>

                        <div>
                          <h3 className={`text-sm lg:text-base font-bold ${item.color}`}>
                            {item.title}
                          </h3>

                          <p className="mt-1 max-w-[280px] text-xs font-normal leading-relaxed text-[#5b6778]">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Hero */}
              <div className="relative mx-auto flex w-full max-w-[520px] justify-center">

                {/* Partner Image */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 flex flex-col items-center"
                >
                    <div 
                      className="relative overflow-hidden rounded-[2.4rem] flex items-center justify-center cursor-pointer"
                      onClick={() => setStep('mobile')}
                    >
                      <img loading="lazy" decoding="async"
                        src="/Join as a service partner.png"
                        alt="Join as a service partner"
                        className="h-[460px] w-[410px] object-contain object-center drop-shadow-[0_0_20px_rgba(4,169,157,0.35)] transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                </motion.div>
              </div>

              {/* Right Benefits */}
              <div className="space-y-4 lg:space-y-6 pt-3 lg:pt-5">
                {[
                  {
                    icon: CalendarDays,
                    title: "Easy Booking Management",
                    desc: "Manage bookings, availability and customers with ease.",
                    color: "text-[#037166]",
                  },
                  {
                    icon: Smartphone,
                    title: "Run on the Go",
                    desc: "Control your business from your mobile, anytime.",
                    color: "text-[#037166]",
                  },
                  {
                    icon: Headphones,
                    title: "Dedicated Partner Support",
                    desc: "Get priority support from our expert partner success team.",
                    color: "text-[#037166]",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#bfe0d8] bg-[#eefaf7] shadow-sm transition group-hover:scale-105 group-hover:border-teal-300/60">
                          <Icon className={item.color} size={18} />
                        </div>

                        <div>
                          <h3 className={`text-sm lg:text-base font-bold ${item.color}`}>
                            {item.title}
                          </h3>

                          <p className="mt-1 max-w-[280px] text-xs font-normal leading-relaxed text-[#5b6778]">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-1 w-full rounded-[24px] border border-[#cfe4de] bg-white p-3 shadow-lg lg:p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Users,
                    value: "700+",
                    label: "Active Partners",
                    color: "text-teal-300",
                  },
                  {
                    icon: BriefcaseBusiness,
                    value: "10,00,000+",
                    label: "Jobs Completed",
                    color: "text-sky-300",
                  },
                  {
                    icon: Star,
                    value: "4.8/5",
                    label: "Partner Rating",
                    color: "text-yellow-300",
                  },
                  {
                    icon: Building2,
                    value: "8+",
                    label: "MetroCities Covered",
                    color: "text-violet-300",
                  },
                ].map((stat, index, arr) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className={`flex items-center gap-5 px-4 py-3 ${
                        index !== arr.length - 1
                          ? "lg:border-r lg:border-[#deece8]"
                          : ""
                      }`}
                    >
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#eefaf7] shadow-sm">
                        <Icon className={stat.color} size={30} />
                      </div>

                      <div>
                        <p className={`text-2xl font-extrabold ${stat.color}`}>
                          {stat.value}
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#5b6778]">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Points */}
            <div className="mx-auto mt-6 grid max-w-4xl gap-4 text-[#475569] sm:grid-cols-3">
              {[
                "No Secuirity Deposit",
                "100% Transparent",
                "Grow Your Business Faster",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center justify-center gap-3 text-sm font-bold"
                >
                  <CheckCircle2 className="text-teal-300" size={21} />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active-form-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid ${
              step === 'success' || step === 'profile'
                ? 'grid-cols-1'
                : 'lg:grid-cols-5'
            } gap-8 lg:gap-10 items-start`}
          >
            {/* Left Side */}
            {step !== 'success' && step !== 'profile' && (
              <div className="lg:col-span-2">
                <div className="sticky top-24 rounded-3xl border border-[#cfe4de] bg-white shadow-[0_8px_30px_rgba(3,113,102,0.08)]">
                  <div className="p-6 sm:p-7 border-b border-[#eef5f3]">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] leading-tight">
                      Partner{' '}
                      <span className="text-[#037166]">Onboarding</span>
                    </h2>
                    <p className="mt-3 text-sm text-[#64748b] leading-relaxed">
                      Complete verification and start receiving bookings instantly.
                    </p>
                  </div>

                  <div className="p-6 sm:p-7 flex flex-col items-center gap-8">
                    <motion.div
                      layoutId="partner-image"
                      className="relative w-full max-w-[260px] flex items-center justify-center rounded-3xl border border-[#e2ece9] bg-gradient-to-b from-[#f8fafc] to-white p-4 shadow-sm"
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src="/service-partner-phone-image.webp"
                        alt="Service Partner App"
                        className="w-full h-auto object-contain object-center rounded-2xl"
                      />
                    </motion.div>

                    <div className="w-full space-y-4">
                      {[
                        { id: 'mobile', label: 'Phone Verification' },
                        { id: 'otp', label: 'Security Check' },
                        { id: 'register', label: 'Business Details' },
                        { id: 'success', label: 'Complete' },
                      ].map((s, idx) => {
                        const steps = ['mobile', 'otp', 'register', 'success'];
                        const isCompleted = steps.indexOf(step) > steps.indexOf(s.id);
                        const isActive = step === s.id;

                        return (
                          <div
                            key={s.id}
                            className={`flex items-center gap-4 rounded-xl px-3 py-2.5 transition-all ${
                              isActive ? 'bg-[#037166]/5 border border-[#037166]/15' : 'border border-transparent'
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                                isCompleted
                                  ? 'border-[#04a99d] bg-[#04a99d] text-white'
                                  : isActive
                                  ? 'border-[#037166] bg-white text-[#037166] shadow-[0_0_0_4px_rgba(3,113,102,0.12)]'
                                  : 'border-[#e2e8f0] bg-white text-[#94a3b8]'
                              }`}
                            >
                              {isCompleted ? <Check className="h-4 w-4 stroke-[3px]" /> : idx + 1}
                            </div>
                            <span
                              className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${
                                isActive ? 'text-[#037166]' : isCompleted ? 'text-[#334155]' : 'text-[#94a3b8]'
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Area */}
            <div
              className={`${
                step === 'success' || step === 'profile'
                  ? 'mx-auto max-w-xl'
                  : 'lg:col-span-3'
              }`}
            >
              <div className="relative overflow-hidden rounded-3xl border border-[#e2ece9] bg-white shadow-[0_8px_30px_rgba(3,113,102,0.08)] min-h-[520px] flex items-center">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#04a99d]/8 blur-3xl pointer-events-none" />
                <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#037166]/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 w-full p-6 sm:p-8 md:p-10">
                  <AnimatePresence mode="wait">
                  {step === 'mobile' ? (
                    <motion.div
                      key="mobile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <MobileNumberPage
                        phone={phone}
                        onPhoneChange={setPhone}
                        onSubmit={submitPhone}
                        loading={loading.mobile}
                        error={error.mobile}
                      />
                    </motion.div>
                  ) : null}

                  {step === 'otp' ? (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <OtpVerificationPage
                        phone={phone}
                        otp={otp}
                        onOtpChange={setOtp}
                        onSubmit={submitOtp}
                        onBack={() => setStep('mobile')}
                        loading={loading.otp || loading.profile}
                        error={error.otp}
                      />
                    </motion.div>
                  ) : null}

                  {step === 'register' ? (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <RegisterPage
                        token={token}
                        phone={phone}
                        onSubmit={submitRegister}
                        loading={loading.register || loading.profile}
                        error={error.register || error.profile}
                      />
                    </motion.div>
                  ) : null}

                  {step === 'success' || step === 'profile' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <RegistrationSuccessPage
                        onClose={resetForm}
                        isNewUser={isNewUser}
                      />
                    </motion.div>
                  ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </section>
);
}
