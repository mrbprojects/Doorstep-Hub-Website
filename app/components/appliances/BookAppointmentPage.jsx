'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Calendar, IndianRupee, CheckSquare, Info, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
        subtitle: 'Online consultation fee — inspection at doorstep',
        icon: IndianRupee,
    },
    {
        id: 'review',
        title: 'Review',
        subtitle: 'Confirm your booking details & pay',
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
                const res = await fetch('https://api.doorstephub.com/v1/dhubApi/web/website-management/cities', {
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
                    `https://api.doorstephub.com/v1/dhubApi/web/website-management/categories-by-city?cityId=${formData.websiteCityId}`,
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

    const getMinDate = () => new Date().toISOString().split('T')[0];

    // Step validation
    const validateStep = () => {
        switch (currentStep) {
            case 0:
                if (!formData.firstName.trim()) { toast.error('Please enter your first name'); return false; }
                if (!formData.phone.trim() || formData.phone.length < 10) { toast.error('Please enter a valid phone number'); return false; }
                if (!formData.email.trim() || !formData.email.includes('@')) { toast.error('Please enter a valid email'); return false; }
                if (!formData.websiteCityId) { toast.error('Please select your city'); return false; }
                if (!formData.websiteCategoryId) { toast.error('Please select a service category'); return false; }
                return true;
            case 1:
                if (!formData.bookingDate) { toast.error('Please select a booking date'); return false; }
                if (!formData.bookingTime) { toast.error('Please select a booking time'); return false; }
                return true;
            case 2:
                if (!agreed) { toast.error('Please agree to the terms and conditions'); return false; }
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

            const res = await fetch('https://api.doorstephub.com/v1/dhubApi/web/crm-booking/initiate-crm-payment', {
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name *"
                                className={inputCls}
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                className={inputCls}
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <input
                            type="tel"
                            placeholder="Phone Number * (e.g. 8886688666)"
                            className={inputCls}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address *"
                            className={inputCls}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                                <p><span className="font-semibold text-[#065f46]">Online Consultation Fee</span> — paid now via secure payment gateway.</p>
                                <p><span className="font-semibold text-gray-700">Doorstep Inspection Fee</span> — collected by our technician at your location.</p>
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
                            <div className="bg-[#065f46] px-5 py-3">
                                <p className="text-white font-semibold text-sm">Fee Summary</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="flex items-start justify-between px-5 py-4 gap-4">
                                    <div>
                                        <p className="font-medium text-gray-800">Online Consultation Fee</p>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Charged now · Secure online payment
                                        </p>
                                    </div>
                                    <p className="text-[#065f46] font-bold text-lg whitespace-nowrap">Pay Online</p>
                                </div>
                                <div className="flex items-start justify-between px-5 py-4 gap-4">
                                    <div>
                                        <p className="font-medium text-gray-800">Doorstep Inspection Fee</p>
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
                                I agree to the <span className="text-[#065f46] underline cursor-pointer">Terms &amp; Conditions</span> and authorize Doorstep Hub to collect payment for this booking.
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
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">Personal Details</h3>
                            <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">Name</span>{formData.firstName} {formData.lastName}</p>
                            <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">Phone</span>{formData.phone}</p>
                            <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">Email</span>{formData.email}</p>
                        </div>

                        {/* Booking Details */}
                        <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 space-y-1.5">
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">Booking Details</h3>
                            <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">City</span>{formData.cityName || '—'}</p>
                            <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">Category</span>{formData.categoryName || '—'}</p>
                            <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">Date</span>{formData.bookingDate || '—'}</p>
                            <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">Time</span>{formData.bookingTime || '—'}</p>
                            {formData.message && (
                                <p className="text-gray-600 text-sm"><span className="font-medium w-28 inline-block text-gray-700">Message</span>{formData.message}</p>
                            )}
                        </div>

                        {/* Payment Summary */}
                        <div className="rounded-xl border border-[#065f46]/20 bg-[#065f46]/5 px-5 py-4 space-y-2">
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">Payment</h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Online Consultation Fee</span>
                                <span className="font-semibold text-[#065f46]">Pay via Gateway</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Doorstep Inspection Fee</span>
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
            <div className="md:hidden bg-[#04a99d] px-4 pt-12 pb-5 sticky top-0 z-[100] shadow-xl">
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
            <div className="flex-1 px-5 py-8 md:px-16 md:py-20 flex flex-col relative z-20 min-h-[calc(100vh-80px)] md:min-h-screen">
                <div className="max-w-xl w-full mx-auto md:mx-0">
                    {/* Step Title */}
                    <div className="mb-8">
                        <p className="text-[10px] font-bold text-[#04a99d] uppercase tracking-[0.2em] mb-2 opacity-80">Step {currentStep + 1} of {STEPS.length}</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
                            {STEPS[currentStep].title}
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base font-medium">{STEPS[currentStep].subtitle}</p>
                    </div>

                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex gap-3 pb-20 md:pb-0">
                        {currentStep > 0 && (
                            <button
                                onClick={handleBack}
                                disabled={submitting}
                                className="flex-1 md:flex-none md:w-32 py-4 bg-white border-2 border-[#04a99d] text-[#04a99d] hover:bg-[#04a99d] hover:text-white font-bold rounded-xl transition-all shadow active:scale-95 text-base"
                            >
                                Back
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 md:flex-none md:px-10 py-4 bg-[#04a99d] hover:bg-[#038f84] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-base"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-4 bg-[#04a99d] hover:bg-[#038f84] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-base flex items-center justify-center gap-2"
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
            <div className="hidden md:flex w-full md:w-[380px] lg:w-[460px] bg-[#04a99d] min-h-screen flex-col justify-center">
                <div className="space-y-14 px-4">
                    {STEPS.map((step, index) => {
                        const isActiveOrCompleted = index <= currentStep;
                        return (
                            <div key={step.id} className="relative flex items-center pl-20 pr-10">
                                <div className="absolute -left-10 flex items-center">
                                    {isActiveOrCompleted ? (
                                        <div className="w-18 h-18 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg z-30">
                                            <step.icon className="w-8 h-8 text-[#04a99d]" strokeWidth={2} />
                                        </div>
                                    ) : (
                                        <div className="relative flex items-center justify-end w-16 h-14 pointer-events-none">
                                            <div className="absolute right-0 w-14 h-14 bg-white/20 rounded-l-full z-10 translate-x-3 flex items-center justify-center">
                                                <step.icon className="w-5 h-5 text-white/50 ml-3" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={`transition-all duration-500 ${isActiveOrCompleted ? 'opacity-100' : 'opacity-35'}`}>
                                    <h3 className="text-xl font-bold text-white mb-1 leading-none">{step.title}</h3>
                                    <p className="text-white/60 text-xs leading-snug max-w-[240px]">{step.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
