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
import { Check, ArrowRight, UserPlus } from 'lucide-react';

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
      await loadProfile(authToken, phone, 'register', verifiedUserId);
    } catch (err) {
      setError((prev) => ({ ...prev, otp: err.message || 'OTP verification failed' }));
    } finally {
      setLoading((prev) => ({ ...prev, otp: false }));
    }
  }

  async function submitRegister(data) {
    setError((prev) => ({ ...prev, register: '' }));
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
    <section className={`relative ${step === 'success' || step === 'profile' ? 'py-6' : 'py-10'} min-h-[500px] flex items-center transition-all duration-500`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#041614] to-transparent opacity-60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <AnimatePresence mode="wait">
          {step === 'idle' ? (
            <motion.div
              key="idle-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center max-w-4xl mx-auto text-center space-y-8"
            >
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  Start Your Journey <br /> as a <span className="text-[#04a99d]">Partner</span>
                </h2>
                <p className="text-white/60 text-base sm:text-lg max-w-lg mx-auto">
                  Register today and join 50,000+ professionals growing their business with Doorstep Hub.
                </p>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#04a99d]/10 blur-[80px] rounded-full" />
                <img 
                  src="/partner_holding_button_dark_bg_1775831624262.png" 
                  alt="Partner Partner" 
                  className="w-full h-full object-cover relative z-10 drop-shadow-[0_0_30px_rgba(4,169,157,0.4)] rounded-[2.5rem]"
                />
                
                {/* Precisely Aligned Overlay Button */}
                <div className="absolute top-[38%] left-1/2 -translate-x-1/2 z-20 w-[62%] h-[18%]">
                  <button 
                    onClick={() => setStep('mobile')}
                    className="w-full h-full flex items-center justify-center font-black text-white transition-all duration-300 bg-[#04a99d] rounded-lg hover:bg-[#037166] active:scale-[0.98] border-2 border-white/20 shadow-inner group"
                  >
                    <span className="text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase ml-2 animate-pulse mb-1">
                      Register Now
                    </span>
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="active-form-view"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`grid ${step === 'success' || step === 'profile' ? 'grid-cols-1' : 'lg:grid-cols-5'} gap-12 items-center`}
            >
              {step !== 'success' && step !== 'profile' && (
                <div className="lg:col-span-2 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#04a99d] to-transparent rounded-full opacity-30" />
                    <h2 className="text-4xl font-black leading-tight bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                      Partner <span className="text-[#04a99d]">Onboarding</span>
                    </h2>
                  </motion.div>

                  <motion.div 
                    layoutId="partner-image"
                    className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-3xl bg-gradient-to-br from-[#04a99d]/10 to-transparent border border-white/5 p-1 overflow-hidden"
                  >
                    <img 
                      src="/walking_partner_dark_bg_1775831681952.png" 
                      alt="Walking Partner" 
                      className="w-full h-full object-cover filter drop-shadow-[0_0_20px_rgba(4,169,157,0.3)] rounded-2xl"
                    />
                  </motion.div>

                  <div className="space-y-6">
                    {[
                      { id: 'mobile', label: 'Phone Verification' },
                      { id: 'otp', label: 'Security Check' },
                      { id: 'register', label: 'Business Details' },
                      { id: 'success', label: 'Complete' },
                    ].map((s, idx) => {
                      const isCompleted = ['mobile', 'otp', 'register', 'success'].indexOf(step) > ['mobile', 'otp', 'register', 'success'].indexOf(s.id);
                      const isActive = step === s.id;
                      
                      return (
                        <motion.div 
                          key={s.id}
                          animate={{ x: isActive ? 10 : 0, opacity: isActive || isCompleted ? 1 : 0.3 }}
                          className="flex items-center gap-4"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isCompleted ? 'bg-[#04a99d] border-[#04a99d]' : 
                            isActive ? 'border-[#04a99d] shadow-[0_0_15px_rgba(4,169,157,0.3)]' : 
                            'border-white/10 text-white/20'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-6 h-6 text-black stroke-[3px]" />
                            ) : (
                              <span className="text-sm font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <div>
                            <span className={`text-sm font-black tracking-widest uppercase ${isActive ? 'text-[#04a99d]' : 'text-white/40'}`}>
                              {s.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className={`lg:col-span-3 rounded-[3rem] border border-white/10 bg-[#0a0f0e]/90 backdrop-blur-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden group transition-all duration-500 ${step === 'success' || step === 'profile' ? 'max-w-lg mx-auto w-full !p-8' : ''}`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#04a99d]/10 rounded-full blur-[120px] -z-10" />
                
                <AnimatePresence mode="wait">
                  {step === 'mobile' ? (
                    <motion.div key="mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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
                    <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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
                    <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <RegistrationSuccessPage onClose={resetForm} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
