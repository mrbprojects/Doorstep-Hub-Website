'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Calendar, IndianRupee, CheckSquare, Info, Loader2, CheckCircle, X, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

const STEPS = [
    {
        id: 'appointment',
        title: 'Appointment',
        subtitle: 'Enter your details, city & service category',
        icon: ClipboardList,
    },
    {
        id: 'schedule',
        title: 'Schedule',
        subtitle: 'Pick a convenient date & time',
        icon: Calendar,
    },
    {
        id: 'payment',
        title: 'Payment',
        subtitle: 'Platform fee — inspection at doorstep',
        icon: IndianRupee,
    },
    {
        id: 'review',
        title: 'Review',
        subtitle: 'Confirm Your Service Booking Details',
        icon: CheckSquare,
    },
];

const inputCls = 'w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04a99d]/30 focus:border-[#04a99d] text-gray-700 text-base shadow-sm placeholder-gray-400 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

export function BookAppointmentPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const idempotencyKey = useRef(`book-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '', email: '',
        websiteCityId: '', cityName: '',
        websiteCategoryId: '', categoryName: '',
        bookingDate: '', bookingTime: '', message: '',
    });

    // Terms Modal State
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsContent, setTermsContent] = useState(null);
    const [termsLoading, setTermsLoading] = useState(false);

    // Cities & Categories state
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Fetch cities on mount
    useEffect(() => {
        const fetchCities = async () => {
            setCitiesLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/website-management/cities`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                if (data.success && data.data) setCities(data.data);
            } catch (err) {
                console.error('Error fetching cities:', err);
            } finally {
                setCitiesLoading(false);
            }
        };
        fetchCities();
    }, []);

    // Fetch categories when city changes
    useEffect(() => {
        if (!formData.websiteCityId) { setCategories([]); return; }
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/web/website-management/categories-by-city?cityId=${formData.websiteCityId}`,
                    { headers: { 'Content-Type': 'application/json' } }
                );
                const data = await res.json();
                if (data.success && data.data) setCategories(data.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, [formData.websiteCityId]);

    // Fetch Terms Content
    useEffect(() => {
        const fetchTerms = async () => {
            setTermsLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/privacy-policies?applicationType=customer%20app`);
                const data = await res.json();
                if (data.success) setTermsContent(data.data);
            } catch (err) {
                console.error('Error fetching terms:', err);
            } finally {
                setTermsLoading(false);
            }
        };
        fetchTerms();
    }, []);

    const getMinDate = () => new Date().toISOString().split('T')[0];

    // Field Validations Helper
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
    const isValidPhone = (phone) => /^[6-9]\d{9}$/.test((phone || '').trim());
    const isValidName = (name) => /^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test((name || '').trim());

    // Step validation
    const validateStep = () => {
        switch (currentStep) {
            case 0:
                if (!formData.firstName.trim()) { toast.error('Please enter your first name'); return false; }
                if (!isValidName(formData.firstName)) { toast.error('Please enter a valid first name'); return false; }

                if (formData.lastName.trim() && !isValidName(formData.lastName)) { toast.error('Please enter a valid last name'); return false; }

                if (!formData.phone.trim()) { toast.error('Please enter your phone number'); return false; }
                if (!isValidPhone(formData.phone.trim())) { toast.error('Please enter a valid 10-digit phone number starting with 6-9'); return false; }

                if (!formData.email.trim()) { toast.error('Please enter your email address'); return false; }
                if (!isValidEmail(formData.email.trim())) { toast.error('Please enter a valid email address'); return false; }

                if (!formData.websiteCityId) { toast.error('Please select your city'); return false; }
                if (!formData.websiteCategoryId) { toast.error('Please select a service category'); return false; }
                return true;
            case 1:
                if (!formData.bookingDate) { toast.error('Please select a booking date'); return false; }
                if (formData.bookingDate < getMinDate()) { toast.error('Booking date cannot be in the past'); return false; }
                if (!formData.bookingTime) { toast.error('Please select a preferred time slot'); return false; }
                if ((formData.message || '').length > 300) { toast.error('Message must be 300 characters or less'); return false; }
                return true;
            case 2:
                if (!agreed) { toast.error('You must agree to the Terms & Conditions to proceed'); return false; }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep()) setCurrentStep(s => s + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(s => s - 1);
    };

    const handleSubmit = async () => {
        if (!agreed) { toast.error('Please agree to terms and conditions'); return; }
        setSubmitting(true);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                websiteCityId: formData.websiteCityId,
                websiteCategoryId: formData.websiteCategoryId,
                bookingDate: formData.bookingDate,
                bookingTime: formData.bookingTime,
                message: formData.message || '',
                payAtServiceDelivery: false,
                surl: `${window.location.origin}/book-appointment?status=success`,
                furl: `${window.location.origin}/book-appointment?status=failure`,
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/crm-booking/initiate-crm-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': idempotencyKey.current,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log('💳 CRM Payment Response:', data);

            if (data.success && data.access_key) {
                toast.success('Redirecting to payment gateway...');
                // Save booking details so we can show confirmation on return
                sessionStorage.setItem('crm_pending_booking', JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    city: formData.cityName,
                    category: formData.categoryName,
                    date: formData.bookingDate,
                    time: formData.bookingTime,
                }));
                window.location.href = `https://pay.easebuzz.in/pay/${data.access_key}`;
            } else {
                toast.error(data.message || 'Payment initiation failed. Please try again.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle return from Easebuzz gateway
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        if (status === 'success') {
            toast.success('Payment successful! We will contact you to confirm your appointment.');
            // Clean URL
            window.history.replaceState({}, '', '/book-appointment');
        } else if (status === 'failure') {
            toast.error('Payment failed or cancelled. Your details are preserved — please try again.');
            window.history.replaceState({}, '', '/book-appointment');
        }
    }, []);

    const renderStepContent = () => {
        switch (currentStep) {

            /* ─── STEP 0: Personal Details + City + Category ─── */
            case 0:
                return (
                    <div className="space-y-4 ">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name *"
                                className={inputCls}
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value.replace(/[^A-Za-z\s.'-]/g, '').slice(0, 50) })}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                className={inputCls}
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value.replace(/[^A-Za-z\s.'-]/g, '').slice(0, 50) })}
                            />
                        </div>
                        <input
                            type="tel"
                            placeholder="Phone Number * (e.g. 8886688666)"
                            className={inputCls}
                            value={formData.phone}
                            maxLength={10}
                            onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address *"
                            className={inputCls}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value.trimStart() })}
                        />

                        {/* City Dropdown */}
                        <div className="relative">
                            {citiesLoading && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                            )}
                            <select
                                className={selectCls}
                                value={formData.websiteCityId}
                                onChange={e => {
                                    const city = cities.find(c => c._id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        websiteCityId: e.target.value,
                                        cityName: city?.name || '',
                                        websiteCategoryId: '',
                                        categoryName: '',
                                    });
                                }}
                            >
                                <option value="">Select Your City *</option>
                                {cities.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative">
                            {categoriesLoading && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                            )}
                            <select
                                className={selectCls}
                                value={formData.websiteCategoryId}
                                disabled={!formData.websiteCityId || categoriesLoading}
                                onChange={e => {
                                    const cat = categories.find(c => c._id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        websiteCategoryId: e.target.value,
                                        categoryName: cat?.name || '',
                                    });
                                }}
                            >
                                <option value="">{formData.websiteCityId ? 'Select Service Category *' : 'Select city first'}</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fee Notice */}
                        <div className="mt-2 p-4 rounded-xl bg-[#065f46]/5 border border-[#065f46]/20 flex items-start gap-3">
                            <Info className="w-5 h-5 text-[#065f46] flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-semibold text-[#065f46]">Online Booking Fee -125/-</span> — paid now via secure payment gateway.</p>
                                <p><span className="font-semibold text-gray-700">Doorstep Inspection Fee -175/-</span> — collected by our technician at your location.</p>
                            </div>
                        </div>
                    </div>
                );

            /* ─── STEP 1: Schedule ─── */
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Booking Date *</label>
                                <input
                                    type="date"
                                    min={getMinDate()}
                                    className={inputCls}
                                    value={formData.bookingDate}
                                    onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Preferred Time *</label>
                                <input
                                    type="time"
                                    className={inputCls}
                                    value={formData.bookingTime}
                                    onChange={e => setFormData({ ...formData, bookingTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">Additional Message (Optional)</label>
                            <textarea
                                placeholder="E.g. loud noise from AC, refrigerator not cooling..."
                                className={`${inputCls} h-28 resize-none`}
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Note: Service available in Hyderabad, Bangalore &amp; Vizag. (Mumbai, Pune, Chennai &amp; Vijayawada coming soon)
                        </p>
                    </div>
                );

            /* ─── STEP 2: Payment Info + Terms ─── */
            case 2:
                return (
                    <div className="space-y-5">
                        {/* Fee Breakdown Card */}
                        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="bg-[#00231f] px-5 py-3">
                                <p className="text-white font-semibold text-sm">Doorstep Services Booking Summary</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="flex items-start justify-between px-5 py-4 gap-4">
                                    <div>
                                        <p className="font-medium text-gray-800">Online Booking Fee -125/-</p>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Charged now · Secure online payment
                                        </p>
                                    </div>
                                    <p className="text-[#065f46] font-bold text-lg whitespace-nowrap">Pay Online</p>
                                </div>
                                <div className="flex items-start justify-between px-5 py-4 gap-4">
                                    <div>
                                        <p className="font-medium text-gray-800">Doorstep Inspection Fee -175/-</p>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Collected by technician at your location
                                        </p>
                                    </div>
                                    <p className="text-gray-600 font-bold text-lg whitespace-nowrap">At Doorstep</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-start gap-2">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                            <p>Our service partner will contact you to confirm the exact time slot as per your availability.</p>
                        </div>

                        <label className="flex items-start space-x-3 cursor-pointer group mt-2">
                            <div className="relative mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={e => setAgreed(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${agreed ? 'bg-[#065f46] border-[#065f46]' : 'border-gray-300 group-hover:border-[#065f46]'}`}>
                                    {agreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                            </div>
                            <span className="text-gray-600 text-sm leading-snug">
                                I agree to the <span onClick={() => setShowTermsModal(true)} className="text-[#065f46] underline cursor-pointer font-bold">Terms & Conditions</span> and authorize Doorstep Hub to collect payment for this booking.
                            </span>
                        </label>
                    </div>
                );

            /* ─── STEP 3: Review + Pay ─── */
            case 3:
                return (
                    <div className="space-y-5">
                        {/* Personal Details */}
                        <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 space-y-1.5">
                            <h3 className="font-bold text-gray-800 text-l uppercase tracking-wide mb-2">Personal Details</h3>
                            <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">Name</span>{formData.firstName} {formData.lastName}</p>
                            <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">Phone</span>{formData.phone}</p>
                            <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">Email</span>{formData.email}</p>
                        </div>

                        {/* Booking Details */}
                        <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 space-y-1.5">
                            <h3 className="font-bold text-gray-800 text-l uppercase tracking-wide mb-2">Booking Details</h3>
                            <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">City</span>{formData.cityName || '—'}</p>
                            <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">Category</span>{formData.categoryName || '—'}</p>
                            <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">Date</span>{formData.bookingDate || '—'}</p>
                            <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">Time</span>{formData.bookingTime || '—'}</p>
                            {formData.message && (
                                <p className="text-gray-600 text-xl"><span className="font-medium w-28 inline-block text-gray-700">Message</span>{formData.message}</p>
                            )}
                        </div>

                        {/* Payment Summary */}
                        <div className="rounded-xl border border-[#065f46]/20 bg-[#065f46]/5 px-5 py-4 space-y-2">
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">Payment</h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Online Booking Fee -125/-</span>
                                <span className="font-semibold text-[#065f46]">Pay via Gateway</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Doorstep Inspection Fee -175/-</span>
                                <span className="font-semibold text-gray-600">Collected at Doorstep</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed">
                            By clicking "Pay &amp; Confirm Booking" you will be redirected to the secure Easebuzz payment gateway. Your booking data is preserved and will not be cleared until payment is confirmed.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans relative">

            {/* ── Mobile Top Step Indicator ── */}
            <div className="md:hidden bg-[#04a99d] px-4 pt-1.5 pb-5 sticky top-20 z-[100] shadow-xl">
                <div className="flex items-center justify-between relative max-w-sm mx-auto">
                    {/* Connecting Line */}
                    <div className="absolute top-[16px] left-[15%] right-[15%] h-[2px] bg-white/20 z-0" />

                    {STEPS.map((step, index) => {
                        const isActiveOrCompleted = index <= currentStep;
                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1 z-10 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActiveOrCompleted ? 'bg-white border-white' : 'bg-[#04a99d] border-white/30'
                                    }`}>
                                    <step.icon className={`w-3.5 h-3.5 ${isActiveOrCompleted ? 'text-[#04a99d]' : 'text-white/40'}`} strokeWidth={3} />
                                </div>
                                <p className={`text-[10px] mt-1.5 font-bold text-center leading-tight whitespace-nowrap ${isActiveOrCompleted ? 'text-white' : 'text-white/40'}`}>
                                    {step.title}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Main Form Section ── */}
            <div className="flex-1 px-4 pt-12 pb-8 md:px-16 md:py-24 flex flex-col relative z-20 min-h-[calc(100vh-80px)] md:min-h-screen bg-white">
                <div className="max-w-xl w-full mx-auto md:mx-0">
                    {/* Step Title */}
                    <div className="mb-12">
                        <p className="text-[10px] font-black text-[#037166] uppercase tracking-[0.3em] mb-4 opacity-80">Step {currentStep + 1} of {STEPS.length}</p>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">
                            {STEPS[currentStep].title}
                        </h2>
                        <p className="text-gray-500 text-sm md:text-lg font-medium leading-relaxed">{STEPS[currentStep].subtitle}</p>
                    </div>

                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex gap-3 sm:gap-4 pb-24 md:pb-0">
                        {currentStep > 0 && (
                            <button
                                onClick={handleBack}
                                disabled={submitting}
                                className="flex-1 md:flex-none md:w-40 py-4 bg-white border-2 border-gray-100 text-gray-400 hover:border-[#037166]/30 hover:text-gray-900 font-black uppercase tracking-[0.12em] sm:tracking-widest text-xs sm:text-sm rounded-2xl transition-all shadow-sm active:scale-95"
                            >
                                Back
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 md:flex-none md:px-12 py-4 bg-[#037166] hover:bg-[#04a99d] text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-[#037166]/20 active:scale-95"
                            >
                                Next Step →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-4 sm:py-5 px-3 sm:px-4 bg-[#037166] text-white text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-[#037166]/30 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 text-center leading-tight"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    '💳 Pay & Confirm Booking'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Right Section — Desktop Steps Panel ── */}
            <div className="hidden md:flex w-full md:w-[400px] lg:w-[500px] bg-gray-50 border-l border-gray-100 min-h-screen flex-col justify-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#037166]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#04a99d]/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="space-y-16 px-12 relative z-10">
                    {STEPS.map((step, index) => {
                        const isActiveOrCompleted = index <= currentStep;
                        return (
                            <div key={step.id} className="relative flex items-center pl-16">
                                {/* Connector Line */}
                                {index < STEPS.length - 1 && (
                                    <div className={`absolute left-[31px] top-12 w-[2px] h-12 transition-all duration-700 ${isActiveOrCompleted ? 'bg-[#037166]/20' : 'bg-gray-100'}`} />
                                )}
                                
                                <div className="absolute left-0 flex items-center">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all duration-500 ${
                                        isActiveOrCompleted 
                                            ? "bg-white text-[#037166] shadow-[#037166]/10 scale-110" 
                                            : "bg-white text-gray-300 border border-gray-100 opacity-50"
                                    }`}>
                                        <step.icon className={`w-7 h-7 ${isActiveOrCompleted ? 'text-[#037166]' : 'text-gray-300'}`} strokeWidth={isActiveOrCompleted ? 2.5 : 2} />
                                    </div>
                                </div>
                                <div className={`transition-all duration-500 pl-4 ${isActiveOrCompleted ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-2'}`}>
                                    <h3 className={`text-xl font-black tracking-tight leading-none mb-2 ${isActiveOrCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h3>
                                    <p className={`text-xs font-medium leading-relaxed max-w-[240px] ${isActiveOrCompleted ? 'text-gray-500' : 'text-gray-400'}`}>{step.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

                {/* ── Terms & Conditions Modal ── */}
                {showTermsModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTermsModal(false)} />
                        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#04a99d]/10 flex items-center justify-center">
                                        <ScrollText className="w-5 h-5 text-[#04a99d]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Terms & Conditions</h3>
                                        <p className="text-xs text-gray-500">Please read carefully before booking</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                {termsLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="w-10 h-10 text-[#04a99d] animate-spin" />
                                        <p className="text-gray-500 font-medium">Loading content...</p>
                                    </div>
                                ) : termsContent ? (
                                    <div
                                        className="prose prose-sm max-w-none text-gray-600"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(termsContent.termsAndConditions) }}
                                    />
                                ) : (
                                    <div className="text-center py-20 text-gray-500">
                                        Failed to load content. Please try again later.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => {
                                        setAgreed(true);
                                        setShowTermsModal(false);
                                    }}
                                    className="px-8 py-3 bg-[#00231f] text-white font-bold rounded-xl hover:bg-[#038f84] transition-all shadow-lg active:scale-95"
                                >
                                    I Agree
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

