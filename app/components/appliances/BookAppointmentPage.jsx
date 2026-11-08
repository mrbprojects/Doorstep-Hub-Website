'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ClipboardList,
    Calendar,
    IndianRupee,
    CheckSquare,
    Loader2,
    CheckCircle,
    X,
    ScrollText,
    MapPin,
    Navigation,
    Clock,
    ShieldCheck,
    ChevronDown,
    Check,
    ArrowRight,
    ArrowLeft,
    Mail,
    User,
    Building2,
    Lock,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { useAuth } from '@/context/AuthContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';
import { trackBookingCompleted, trackLeadEvent, trackPaymentStarted, trackPaymentFailed } from '@/lib/leadTracking';
import { fetchOtpGateway, getOtpGatewayCopy } from '@/lib/otpGateway';
import { useGlobalLoader } from '@/context/GlobalLoaderContext';
import { triggerGlobalLoaderStart } from '@/components/ui/GlobalProgressBar';

const STEPS = [
    {
        id: 'appointment',
        title: 'Book Appointment Instantly',
        subtitle: 'Please Enter Your Details Below..',
        icon: ClipboardList,
    },
    {
        id: 'schedule',
        title: 'Schedule Service',
        subtitle: 'Choose Convenient Service Date & Time Slot',
        icon: Calendar,
    },
    {
        id: 'payment',
        title: 'Payment',
        subtitle: 'Transparent, Service Booking Fee & Terms',
        icon: IndianRupee,
    },
    {
        id: 'review',
        title: 'Review',
        subtitle: 'Please Confirm Booking details & Doorstep Service Address',
        icon: CheckSquare,
    },
];

// Service window: 9 AM to 9 PM (2-hour arrival windows, 2-hour buffer)
const BUFFER_HOURS = 2;

const TIME_SLOTS = [
    { label: '09:00 AM - 11:00 AM', value: '09:00 AM - 11:00 AM', startHour: 9, endHour: 11 },
    { label: '11:00 AM - 01:00 PM', value: '11:00 AM - 01:00 PM', startHour: 11, endHour: 13 },
    { label: '01:00 PM - 03:00 PM', value: '01:00 PM - 03:00 PM', startHour: 13, endHour: 15 },
    { label: '03:00 PM - 05:00 PM', value: '03:00 PM - 05:00 PM', startHour: 15, endHour: 17 },
    { label: '05:00 PM - 07:00 PM', value: '05:00 PM - 07:00 PM', startHour: 17, endHour: 19 },
    { label: '07:00 PM - 09:00 PM', value: '07:00 PM - 09:00 PM', startHour: 19, endHour: 21 },
];

const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getAvailableTimes = (selectedDateValue) => {
    if (!selectedDateValue) return TIME_SLOTS;
    const now = new Date();
    const todayStr = formatLocalDate(now);

    // If today, filter slots to at least 2 hours from current time
    if (selectedDateValue === todayStr) {
        const currentHour = now.getHours();
        return TIME_SLOTS.filter(slot => slot.startHour >= currentHour + BUFFER_HOURS);
    }

    // For upcoming dates, all slots are available
    return TIME_SLOTS;
};

const getAvailableDates = () => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const todaySlots = getAvailableTimes(todayStr);

    // If no slots remain today (e.g. after 6 PM), start from tomorrow
    const startDayIndex = todaySlots.length === 0 ? 1 : 0;
    const dates = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + startDayIndex + i);
        const actualOffset = startDayIndex + i;
        const val = formatLocalDate(d);

        let dayLabel = '';
        let subLabel = '';

        const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        if (actualOffset === 0) {
            dayLabel = 'Today';
            subLabel = monthDay;
        } else if (actualOffset === 1) {
            dayLabel = 'Tomorrow';
            subLabel = monthDay;
        } else {
            dayLabel = dayName;
            subLabel = monthDay;
        }

        dates.push({
            value: val,
            dayLabel,
            subLabel,
        });
    }

    return dates;
};

const inputCls = 'w-full px-3 h-[42px] bg-white border border-[#D9E5EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007F70]/20 focus:border-[#007F70] text-[#102B35] font-medium text-xs sm:text-sm shadow-xs placeholder-[#94A3B8] transition-all';
const selectCls = 'w-full px-3 pr-8 h-[42px] bg-white border border-[#D9E5EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007F70]/20 focus:border-[#007F70] text-[#102B35] font-medium text-xs sm:text-sm shadow-xs transition-all appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-[#102B35] mb-1';

export function BookAppointmentPage() {
    const { user, isAuthenticated, loginWithWhatsApp, verifyOtp } = useAuth();
    const { fetchCart } = useServiceCart();
    const { showLoader, hideLoader } = useGlobalLoader();

    const [currentStep, setCurrentStep] = useState(0);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const idempotencyKey = useRef(null);
    useEffect(() => {
        if (!idempotencyKey.current) {
            idempotencyKey.current = `book-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
    }, []);

    const [formData, setFormData] = useState(() => {
        const initialDates = getAvailableDates();
        const initialDate = initialDates[0]?.value || '';
        const initialTimes = getAvailableTimes(initialDate);
        const initialTime = initialTimes[0]?.value || '';
        return {
            firstName: user?.firstName || user?.name?.split(' ')[0] || '',
            lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
            phone: user?.phone || user?.mobile || '',
            email: user?.email || '',
            websiteCityId: '', cityName: '',
            websiteCategoryId: '', categoryName: '',
            subcategoryId: '', subcategoryName: '',
            address: '', flat: '', area: '', pincode: '', landmark: '',
            latitude: '', longitude: '',
            bookingDate: initialDate,
            bookingTime: initialTime,
            message: '',
        };
    });

    // Subcategories & Location state
    const [subcategories, setSubcategories] = useState([]);
    const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [otpCopy, setOtpCopy] = useState(() => getOtpGatewayCopy('whatsapp'));

    useEffect(() => {
        let mounted = true;
        (async () => {
            const copy = await fetchOtpGateway();
            if (mounted) setOtpCopy(copy);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // Fees from GlobalSettingsContext
    const { onlineBookingFee, doorstepInspectionFee, loading: feesLoading } = useGlobalSettings() || {};
    const platformFee = onlineBookingFee ?? 99;
    const consultationFee = doorstepInspectionFee ?? 175;

    // Phone verification check
    const cleanPhone = (num) => (num || '').replace(/\D/g, '').slice(-10);
    const userPhone = cleanPhone(user?.phone || user?.mobile || '');
    const enteredPhone = cleanPhone(formData.phone);
    const isPhoneVerified = isAuthenticated && !!userPhone && enteredPhone === userPhone;

    // Terms Modal State
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsContent, setTermsContent] = useState(null);
    const [termsLoading, setTermsLoading] = useState(false);

    // Cities & Categories state
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Auto-fill profile details once authenticated
    const [prevUser, setPrevUser] = useState(user);
    if (user && user !== prevUser) {
        setPrevUser(user);
        setFormData(prev => ({
            ...prev,
            firstName: prev.firstName || user.firstName || user.name?.split(' ')[0] || '',
            lastName: prev.lastName || user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            phone: prev.phone || user.phone || user.mobile || '',
            email: prev.email || user.email || '',
        }));
    }

    useEffect(() => {
        trackLeadEvent({ eventType: 'BOOKING_STARTED', vertical: 'crm' });
    }, []);

    // Timer logic for Resend OTP
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Fetch cities on mount
    useEffect(() => {
        const fetchCities = async () => {
            setCitiesLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/website-management/cities`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    // Filter out legacy static duplicate "Bangalore" in favor of dynamic "Bengaluru"
                    const dynamicCities = data.data.filter(
                        c => c.name && c.name.trim().toLowerCase() !== 'bangalore'
                    );
                    setCities(dynamicCities);
                }
            } catch (err) {
                console.error('Error fetching cities:', err);
            } finally {
                setCitiesLoading(false);
            }
        };
        fetchCities();
    }, []);

    // Fetch categories when city changes
    const [prevCityId, setPrevCityId] = useState(formData.websiteCityId);
    if (prevCityId !== formData.websiteCityId) {
        setPrevCityId(formData.websiteCityId);
        if (!formData.websiteCityId) {
            setCategories([]);
        }
    }

    useEffect(() => {
        if (!formData.websiteCityId) return;
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

    // Fetch subcategories when category changes
    const [prevCatId, setPrevCatId] = useState(formData.websiteCategoryId);
    if (prevCatId !== formData.websiteCategoryId) {
        setPrevCatId(formData.websiteCategoryId);
        if (!formData.websiteCategoryId) {
            setSubcategories([]);
            setFormData(prev => ({ ...prev, subcategoryId: '', subcategoryName: '' }));
        }
    }

    useEffect(() => {
        if (!formData.websiteCategoryId) return;
        const fetchSubcategories = async () => {
            setSubcategoriesLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryId: formData.websiteCategoryId }),
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setSubcategories(data.data);
                } else {
                    setSubcategories([]);
                }
            } catch (err) {
                console.error('Error fetching subcategories:', err);
                setSubcategories([]);
            } finally {
                setSubcategoriesLoading(false);
            }
        };
        fetchSubcategories();
    }, [formData.websiteCategoryId]);

    // Auto Detect Location Handler
    const handleDetectLocation = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setDetectingLocation(true);
        toast.info('Detecting your location via GPS...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    let detectedAddress = '';
                    let detectedArea = '';
                    let detectedCity = '';
                    let detectedPincode = '';

                    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                    if (apiKey) {
                        try {
                            const gRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
                            const gData = await gRes.json();
                            if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results[0]) {
                                const first = gData.results[0];
                                detectedAddress = first.formatted_address || '';
                                first.address_components?.forEach(c => {
                                    if (c.types.includes('sublocality') || c.types.includes('sublocality_level_1') || c.types.includes('neighborhood')) {
                                        detectedArea = detectedArea || c.long_name;
                                    }
                                    if (c.types.includes('locality')) {
                                        detectedCity = c.long_name;
                                    }
                                    if (c.types.includes('postal_code')) {
                                        detectedPincode = c.long_name;
                                    }
                                });
                            }
                        } catch (gErr) {
                            console.warn('Google reverse geocode error:', gErr);
                        }
                    }

                    if (!detectedAddress) {
                        const oRes = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
                            { headers: { 'Accept-Language': 'en' } }
                        );
                        const oData = await oRes.json();
                        const addr = oData.address || {};
                        detectedAddress = oData.display_name || '';
                        detectedArea = addr.suburb || addr.neighbourhood || addr.quarter || addr.subdistrict || addr.locality || addr.village || addr.road || '';
                        detectedCity = addr.city || addr.town || addr.village || addr.county || '';
                        detectedPincode = addr.postcode || '';
                    }

                    setFormData(prev => {
                        const next = {
                            ...prev,
                            address: detectedAddress || prev.address,
                            area: detectedArea || prev.area,
                            pincode: detectedPincode || prev.pincode,
                            latitude: String(latitude),
                            longitude: String(longitude),
                        };

                        if (!prev.websiteCityId && detectedCity && cities.length > 0) {
                            const matchedCity = cities.find(c =>
                                c.name?.toLowerCase().includes(detectedCity.toLowerCase()) ||
                                detectedCity.toLowerCase().includes(c.name?.toLowerCase())
                            );
                            if (matchedCity) {
                                next.websiteCityId = matchedCity._id;
                                next.cityName = matchedCity.name;
                            }
                        }
                        return next;
                    });

                    toast.success('Location detected! Please enter Flat / House No.');
                } catch (err) {
                    console.error('Error reverse geocoding:', err);
                    toast.error('Could not detect exact address. Please enter manually.');
                } finally {
                    setDetectingLocation(false);
                }
            },
            (error) => {
                console.error('GPS error:', error);
                setDetectingLocation(false);
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error('Location permission denied. Please enter your address manually.');
                } else {
                    toast.error('Location unavailable. Please enter your address manually.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    // Send OTP
    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        setOtpLoading(true);
        try {
            const res = await loginWithWhatsApp(formData.phone);
            if (res.success) {
                setOtpSent(true);
                setResendTimer(30);
                toast.success(otpCopy.toastOtpSent);
            } else {
                toast.error(res.message || otpCopy.toastOtpFailed);
            }
        } catch (err) {
            console.error('Error sending OTP:', err);
            toast.error(otpCopy.toastOtpFailed);
        } finally {
            setOtpLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) {
            toast.error('Please enter the 6-digit verification code');
            return;
        }

        setOtpLoading(true);
        try {
            const res = await verifyOtp(formData.phone, otpCode);
            if (res.success) {
                toast.success('Mobile number verified successfully!');
                setOtpSent(false);
                setOtpCode('');
                if (fetchCart) fetchCart();
            } else {
                toast.error(res.message || 'Invalid OTP code');
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            toast.error('Verification failed. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Fetch Terms & Conditions from authoritative customer app policies endpoint
    useEffect(() => {
        if (showTermsModal && !termsContent) {
            const fetchTerms = async () => {
                setTermsLoading(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/privacy-policies?applicationType=customer%20app`, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    const data = await res.json();
                    if (data.success && data.data) {
                        const tc = typeof data.data === 'string'
                            ? data.data
                            : (data.data.termsAndConditions || data.data.content || '');
                        setTermsContent({ termsAndConditions: tc });
                    }
                } catch (err) {
                    console.error('Error fetching terms:', err);
                } finally {
                    setTermsLoading(false);
                }
            };
            fetchTerms();
        }
    }, [showTermsModal, termsContent]);

    // Helpers
    const getMinDate = () => formatLocalDate(new Date());
    

    const availableDates = useMemo(() => getAvailableDates(), []);
    const availableTimes = useMemo(() => getAvailableTimes(formData.bookingDate), [formData.bookingDate]);

    const handleDateSelect = (dateValue) => {
        const times = getAvailableTimes(dateValue);
        setFormData(prev => {
            const isCurrentTimeValid = times.some(t => t.value === prev.bookingTime);
            return {
                ...prev,
                bookingDate: dateValue,
                bookingTime: isCurrentTimeValid ? prev.bookingTime : (times[0]?.value || ''),
            };
        });
    };

    const validateStep = (step = currentStep) => {
        switch (step) {
            case 0:
                if (!formData.firstName.trim()) { toast.error('Please enter your first name'); return false; }
                if (!formData.phone.trim() || formData.phone.length !== 10) { toast.error('Please enter a valid 10-digit mobile number'); return false; }
                if (!isPhoneVerified) {
                    toast.error('Please verify your mobile number with OTP to continue');
                    return false;
                }
                if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                    toast.error('Please enter a valid email address');
                    return false;
                }
                if (!formData.websiteCityId) { toast.error('Please select your city'); return false; }
                if (!formData.websiteCategoryId) { toast.error('Please select a service category'); return false; }
                if (subcategories.length > 0 && !formData.subcategoryId) {
                    toast.error('Please select an appliance type / sub-category');
                    return false;
                }
                if (!formData.flat.trim()) { toast.error('Please enter your Flat / House / Floor No'); return false; }
                if (!formData.area.trim()) { toast.error('Please enter your Apartment / Street / Area'); return false; }
                if (!formData.pincode.trim() || formData.pincode.length !== 6) { toast.error('Please enter a valid 6-digit pincode'); return false; }
                if (!formData.address.trim()) {
                    setFormData(prev => ({
                        ...prev,
                        address: [prev.flat, prev.area, prev.landmark, prev.cityName, prev.pincode].filter(Boolean).join(', ')
                    }));
                }
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
        if (validateStep()) {
            triggerGlobalLoaderStart();
            setCurrentStep(s => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async () => {
        if (!agreed) { toast.error('Please agree to terms and conditions'); return; }
        setSubmitting(true);
        showLoader({
            title: 'Connecting to Secure Payment Gateway...',
            subtitle: 'Please wait while we prepare your ₹99 booking fee transaction...',
        });

        try {
            const rawAddress = formData.address || [formData.flat, formData.area, formData.landmark, formData.cityName, formData.pincode].filter(Boolean).join(', ');
            // Easebuzz address1 parameter disallows non-ASCII and special unicode symbols (like ₹)
            const cleanAddress = rawAddress
                .replace(/[₹$€£]/g, '')
                .replace(/[^a-zA-Z0-9\s,\-\/\.\#\:\(\)]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            const payload = {
                firstName: (formData.firstName || '').replace(/[^a-zA-Z\s]/g, '').trim(),
                lastName: (formData.lastName || '').replace(/[^a-zA-Z\s]/g, '').trim(),
                email: formData.email,
                phone: formData.phone,
                websiteCityId: formData.websiteCityId,
                cityName: formData.cityName,
                categoryId: formData.websiteCategoryId,
                websiteCategoryId: formData.websiteCategoryId,
                categoryName: formData.categoryName,
                subcategoryId: formData.subcategoryId || undefined,
                subcategoryName: formData.subcategoryName || '',
                address: cleanAddress,
                flat: (formData.flat || '').replace(/[₹$€£]/g, '').trim(),
                area: (formData.area || '').replace(/[₹$€£]/g, '').trim(),
                pincode: (formData.pincode || '').replace(/\D/g, '').trim(),
                landmark: (formData.landmark || '').replace(/[₹$€£]/g, '').trim(),
                latitude: formData.latitude || '',
                longitude: formData.longitude || '',
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

            if (data.success && data.access_key) {
                trackPaymentStarted({
                    vertical: 'crm',
                    bookingId: data.bookingId || data.orderId,
                    categoryName: formData.categoryName,
                    city: formData.cityName,
                    customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                    mobile: formData.phone,
                });
                toast.success('Redirecting to payment gateway...');
                try {
                    sessionStorage.setItem('last_checkout_url', '/book-appointment');
                } catch {}
                sessionStorage.setItem('crm_pending_booking', JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    city: formData.cityName,
                    category: formData.categoryName,
                    subcategory: formData.subcategoryName,
                    address: cleanAddress,
                    date: formData.bookingDate,
                    time: formData.bookingTime,
                }));
                window.location.href = `https://pay.easebuzz.in/pay/${data.access_key}`;
            } else {
                hideLoader();
                const errMsg = data.easebuzz?.error_desc || data.easebuzz?.data || data.message || 'Payment initiation failed. Please try again.';
                toast.error(errMsg);
            }
        } catch (err) {
            hideLoader();
            console.error('Submit error:', err);
            toast.error('Something went wrong initiating payment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle return from Easebuzz gateway
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        if (status === 'success') {
            trackBookingCompleted(null, { vertical: 'crm' });
            toast.success('Payment successful! We will contact you to confirm your appointment.');
            window.history.replaceState({}, '', '/book-appointment');
        } else if (status === 'failure') {
            trackPaymentFailed({
                vertical: 'crm',
                eventData: { reason: 'gateway_return_failure', channel: 'book_appointment' },
            });
            toast.error('Payment failed or cancelled. Your details are preserved — please try again.');
            window.history.replaceState({}, '', '/book-appointment');
        }
    }, []);

    const renderStepContent = () => {
        switch (currentStep) {
            /* ─── STEP 0: Personal Details + City + Category + Subcategory + Address ─── */
            case 0:
                return (
                    <div className="space-y-3.5">
                        {/* Section 1: Customer Contact Details (4 Columns on Desktop) */}
                        <div className="bg-white rounded-xl border border-[#D9E5EB] p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3">
                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-[#DDF5EF] text-[#007F70] flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#102B35]">Personal Information</h3>
                                    <p className="text-[11px] text-[#647B8D]">Enter your contact details for technician dispatch</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Col 1: First Name */}
                                <div>
                                    <label className={labelCls}>
                                        First Name <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul"
                                        className={inputCls}
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value.replace(/[^A-Za-z\s.'-]/g, '').slice(0, 50) })}
                                    />
                                </div>

                                {/* Col 2: Last Name */}
                                <div>
                                    <label className={labelCls}>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sharma"
                                        className={inputCls}
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value.replace(/[^A-Za-z\s.'-]/g, '').slice(0, 50) })}
                                    />
                                </div>

                                {/* Col 3: Phone Number */}
                                <div>
                                    <label className={labelCls}>
                                        WhatsApp Phone <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <div className="flex items-center">
                                        <div className="h-[42px] px-2.5 bg-gray-50 border border-r-0 border-[#D9E5EB] rounded-l-xl text-xs font-bold text-[#102B35] flex items-center justify-center select-none shrink-0">
                                            +91
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="tel"
                                                placeholder="10-digit number"
                                                className={`${inputCls} rounded-l-none border-l-0 ${isPhoneVerified ? 'border-green-500 pr-20' : ''}`}
                                                value={formData.phone}
                                                maxLength={10}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, phone: val });
                                                    if (otpSent) setOtpSent(false);
                                                }}
                                            />
                                            {isPhoneVerified && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-green-700 font-bold text-[10px] bg-green-50 px-2 py-0.5 rounded border border-green-300 select-none">
                                                    <CheckCircle className="w-3 h-3 text-green-600" /> Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Col 4: Email Address */}
                                <div>
                                    <label className={labelCls}>
                                        Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="email"
                                            placeholder="e.g. rahul@gmail.com"
                                            className={`${inputCls} pl-8`}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value.trimStart() })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Inline OTP Section */}
                            {formData.phone.length === 10 && !isPhoneVerified && (
                                <div className="p-3 bg-[#DDF5EF]/40 border border-[#B2E7DB] rounded-xl transition-all">
                                    {!otpSent ? (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={otpLoading}
                                            className="w-full h-[40px] bg-[#00594F] text-white hover:bg-[#007F70] font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-xs"
                                        >
                                            {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : otpCopy.sendButton}
                                        </button>
                                    ) : (
                                        <div className="space-y-2.5">
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-[#102B35]">Enter 6-Digit Verification Code</p>
                                                <p className="text-[11px] text-[#647B8D] mt-0.5">{otpCopy.otpScreenSubtitle(formData.phone)}</p>
                                            </div>
                                            <div className="flex justify-center gap-2">
                                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                                    <input
                                                        key={index}
                                                        id={`booking-otp-${index}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={otpCode[index] || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            const newOtp = otpCode.split('');
                                                            newOtp[index] = val ? val[val.length - 1] : '';
                                                            const finalOtp = newOtp.join('').slice(0, 6);
                                                            setOtpCode(finalOtp);
                                                            if (val && index < 5) {
                                                                document.getElementById(`booking-otp-${index + 1}`)?.focus();
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Backspace') {
                                                                if (otpCode[index]) {
                                                                    const newOtp = otpCode.split('');
                                                                    newOtp[index] = '';
                                                                    setOtpCode(newOtp.join(''));
                                                                } else if (index > 0) {
                                                                    const newOtp = otpCode.split('');
                                                                    newOtp[index - 1] = '';
                                                                    setOtpCode(newOtp.join(''));
                                                                    document.getElementById(`booking-otp-${index - 1}`)?.focus();
                                                                }
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        className="w-9 h-10 bg-white border border-[#D9E5EB] rounded-lg text-center text-base font-bold text-[#102B35] focus:border-[#007F70] focus:ring-2 focus:ring-[#007F70]/20 outline-none"
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-center gap-2 max-w-sm mx-auto">
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyOtp}
                                                    disabled={otpLoading || otpCode.length !== 6}
                                                    className="flex-1 h-[38px] bg-[#00594F] text-white font-bold rounded-lg hover:bg-[#007F70] disabled:opacity-50 transition-all text-xs"
                                                >
                                                    {otpLoading ? 'Verifying...' : 'Verify & Continue'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setOtpSent(false); setOtpCode(''); }}
                                                    className="px-3 h-[38px] border border-[#D9E5EB] text-[#647B8D] font-bold rounded-lg hover:bg-gray-100 transition-all text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <div className="text-center">
                                                {resendTimer > 0 ? (
                                                    <span className="text-[#647B8D] text-[11px]">Resend OTP in {resendTimer}s</span>
                                                ) : (
                                                    <button type="button" onClick={handleSendOtp} className="font-bold text-[#007F70] hover:underline text-[11px]">
                                                        Resend OTP
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Service City & Category (3 Columns on Desktop) */}
                        <div className="bg-white rounded-xl border border-[#D9E5EB] p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3">
                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-[#DDF5EF] text-[#007F70] flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#102B35]">Service &amp; Location</h3>
                                    <p className="text-[11px] text-[#647B8D]">Pick your city, appliance category and type</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Col 1: City Dropdown */}
                                <div>
                                    <label className={labelCls}>
                                        Select City <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <div className="relative">
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
                                                    subcategoryId: '',
                                                    subcategoryName: '',
                                                });
                                            }}
                                        >
                                            <option value="">Select Your City</option>
                                            {cities
                                                .filter(c => c.name && c.name.trim().toLowerCase() !== 'bangalore')
                                                .map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        {citiesLoading && (
                                            <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-[#007F70]" />
                                        )}
                                    </div>
                                </div>

                                {/* Col 2: Category Dropdown */}
                                <div>
                                    <label className={labelCls}>
                                        Service Category <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <div className="relative">
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
                                                    subcategoryId: '',
                                                    subcategoryName: '',
                                                });
                                            }}
                                        >
                                            <option value="">{formData.websiteCityId ? 'Choose Category' : 'Choose City first'}</option>
                                            {categories.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        {categoriesLoading && (
                                            <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-[#007F70]" />
                                        )}
                                    </div>
                                </div>

                                {/* Col 3: Sub-category Dropdown */}
                                <div>
                                    <label className={labelCls}>
                                        Appliance Type / Sub-Category <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={selectCls}
                                            value={formData.subcategoryId}
                                            disabled={!formData.websiteCategoryId || subcategoriesLoading}
                                            onChange={e => {
                                                const sub = subcategories.find(s => s._id === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    subcategoryId: e.target.value,
                                                    subcategoryName: sub?.name || '',
                                                });
                                            }}
                                        >
                                            <option value="">
                                                {!formData.websiteCategoryId
                                                    ? 'Choose Category first'
                                                    : subcategoriesLoading
                                                        ? 'Loading sub-categories...'
                                                        : subcategories.length === 0
                                                            ? 'General (No sub-category required)'
                                                            : 'Select Appliance Type'}
                                            </option>
                                            {subcategories.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        {subcategoriesLoading && (
                                            <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-[#007F70]" />
                                        )}
                                    </div>
                                    {subcategoriesLoading && (
                                        <div className="pt-1.5 flex items-center gap-1.5 animate-pulse">
                                            <div className="h-2 w-12 bg-[#007F70]/20 rounded-full" />
                                            <div className="h-2 w-16 bg-[#007F70]/20 rounded-full" />
                                            <div className="h-2 w-10 bg-[#007F70]/20 rounded-full" />
                                            <span className="text-[10px] text-[#007F70] font-medium ml-1">loading options...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Full Service Address Card (4 Columns on Desktop + Directions) */}
                        <div className="bg-white rounded-xl border border-[#D9E5EB] p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#DDF5EF] text-[#007F70] flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#102B35]">Doorstep Address</h3>
                                        <p className="text-[11px] text-[#647B8D]">Detect your location via GPS or enter your full address</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={detectingLocation}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00594F] hover:bg-[#007F70] text-white font-bold text-xs shadow-2xs active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {detectingLocation ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>Locating GPS...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Navigation className="w-3 h-3 fill-current" />
                                            <span>Auto Detect Location</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* 4 Columns for Flat, Area, Landmark, Pincode */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className={labelCls}>
                                        Flat / House / Floor No <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Flat 302, Sai Heights"
                                        className={inputCls}
                                        value={formData.flat}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                flat: val,
                                                address: [val, prev.area, prev.landmark, prev.cityName, prev.pincode].filter(Boolean).join(', ')
                                            }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Apartment / Street / Area <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Madhapur Main Road"
                                        className={inputCls}
                                        value={formData.area}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                area: val,
                                                address: [prev.flat, val, prev.landmark, prev.cityName, prev.pincode].filter(Boolean).join(', ')
                                            }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Landmark (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Near Metro Pillar 104"
                                        className={inputCls}
                                        value={formData.landmark}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                landmark: val,
                                                address: [prev.flat, prev.area, val, prev.cityName, prev.pincode].filter(Boolean).join(', ')
                                            }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Pincode <span className="text-[#E5484D]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 500081"
                                        maxLength={6}
                                        className={inputCls}
                                        value={formData.pincode}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setFormData(prev => ({
                                                ...prev,
                                                pincode: val,
                                                address: [prev.flat, prev.area, prev.landmark, prev.cityName, val].filter(Boolean).join(', ')
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Full Address / Directions Line */}
                            <div>
                                <label className={labelCls}>
                                    Full Address &amp; Directions <span className="text-[#E5484D]">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter complete address or specific directions for the technician"
                                    className={inputCls}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Fee Notice Banner */}
                        <div className="rounded-xl border border-[#B2E7DB] bg-[#E6F7F2] p-3 sm:p-3.5 shadow-2xs flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#00594F] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                                    ₹
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-extrabold text-[#102B35]">
                                        Online Booking Fee: ₹{feesLoading ? '99' : platformFee}/-
                                    </p>
                                    <p className="text-[11px] text-[#647B8D] font-medium leading-tight mt-0.5">
                                        Inspection fee of ₹{feesLoading ? '175' : consultationFee}/- is collected directly at your doorstep only after the technician visits and inspects the appliance.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-4 py-2 rounded-lg bg-[#00594F] hover:bg-[#007F70] text-white font-bold text-xs whitespace-nowrap shadow-2xs transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                            >
                                <span>Continue to Schedule</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                );

            /* ─── STEP 1: Schedule Date & Time ─── */
            case 1:
                return (
                    <div className="space-y-4">
                        {/* Schedule Service Card Matching Reference */}
                        <div className="bg-white rounded-2xl border border-[#D9E5EB] p-4 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-5">
                            {/* Card Header */}
                            <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
                                <span className="w-7 h-7 rounded-full bg-[#007F70] text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                                    1
                                </span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#007F70]" />
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-[#102B35]">Schedule Service</h3>
                                        <p className="text-xs text-[#647B8D]">Pick preferred appointment date and time</p>
                                    </div>
                                </div>
                            </div>

                            {/* CHOOSE Day & Date */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                                    Choose Day & Date
                                </label>
                                {availableDates.length === 0 ? (
                                    <p className="text-gray-500 text-xs">No dates available at this time</p>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                        {availableDates.map((date) => {
                                            const isSelected = formData.bookingDate === date.value;
                                            return (
                                                <button
                                                    key={date.value}
                                                    type="button"
                                                    onClick={() => handleDateSelect(date.value)}
                                                    className={`px-2 py-2.5 sm:py-3 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${isSelected
                                                        ? 'bg-[#00594F] text-white border-[#00594F] shadow-sm ring-2 ring-[#00594F]/20'
                                                        : 'bg-white hover:bg-gray-50 text-[#102B35] border-[#D9E5EB] hover:border-[#00594F]/60 shadow-2xs'
                                                        }`}
                                                >
                                                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#102B35]'}`}>
                                                        {date.dayLabel}
                                                    </span>
                                                    <span className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-emerald-100' : 'text-[#4B5563]'}`}>
                                                        {date.subLabel}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CHOOSE TIME SLOT */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Choose Time Slot
                                    </label>
                                    {formData.bookingTime && (
                                        <span className="text-xs text-[#00594F] font-semibold">
                                            2-Hour Arrival Window
                                        </span>
                                    )}
                                </div>

                                {availableTimes.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center text-xs text-amber-800 font-medium">
                                        No time slots remaining for this date. Please pick another date above.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                        {availableTimes.map((slot) => {
                                            const isSelected = formData.bookingTime === slot.value;
                                            return (
                                                <button
                                                    key={slot.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, bookingTime: slot.value }))}
                                                    className={`px-3.5 py-3 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center justify-between border cursor-pointer ${isSelected
                                                        ? 'bg-[#00594F] text-white border-[#00594F] shadow-sm ring-2 ring-[#00594F]/20'
                                                        : 'bg-white hover:bg-gray-50 text-[#102B35] border-[#D9E5EB] hover:border-[#00594F]/60 shadow-2xs'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Clock className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#00594F]'}`} />
                                                        <span>{slot.label}</span>
                                                    </span>
                                                    {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ADDITIONAL ISSUE DETAILS (OPTIONAL) */}
                            <div className="pt-1">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Additional Issue Details (Optional)
                                </label>
                                <textarea
                                    placeholder="E.g. washing machine making squeaking sound, water not draining..."
                                    className={`${inputCls} h-20 py-2.5 resize-none`}
                                    value={formData.message}
                                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                );

            /* ─── STEP 2: Payment Fee Breakdown & Terms ─── */
            case 2:
                return (
                    <div className="space-y-3.5">
                        {/* Summary Invoice Card */}
                        <div className="bg-white rounded-xl border border-[#D9E5EB] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                            <div className="bg-[#003831] px-4 py-3 flex items-center justify-between text-white">
                                <div>
                                    <p className="font-extrabold text-xs sm:text-sm tracking-wide">Doorstep Service Pricing Summary</p>
                                    <p className="text-[11px] text-[#0ABF83]">Transparent pricing · No hidden costs</p>
                                </div>
                                <span className="bg-[#00594F] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                    Instant Booking
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100 p-4 space-y-3">
                                <div className="flex items-center justify-between pt-1">
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-[#102B35]">Online Platform Booking Fee</p>
                                        <p className="text-[11px] text-[#647B8D]">Charged now to secure partner visit</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm sm:text-base font-extrabold text-[#007F70]">
                                            ₹{feesLoading ? '99' : platformFee}/-
                                        </p>
                                        <span className="text-[10px] font-bold text-emerald-800 bg-[#DDF5EF] px-1.5 py-0.5 rounded">
                                            Pay Online
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3">
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-[#102B35]">Doorstep Inspection Fee</p>
                                        <p className="text-[11px] text-[#647B8D]">Collected by technician upon arrival</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm sm:text-base font-extrabold text-[#102B35]">
                                            ₹{feesLoading ? '175' : consultationFee}/-
                                        </p>
                                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                            Pay at Doorstep
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 bg-gray-50/80 -mx-4 -mb-4 p-3.5 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs sm:text-sm font-extrabold text-[#102B35]">Total Payable Right Now</p>
                                        <p className="text-[11px] text-[#647B8D]">Secure payment via Easebuzz Gateway</p>
                                    </div>
                                    <p className="text-xl sm:text-2xl font-black text-[#007F70]">
                                        ₹{feesLoading ? '99' : platformFee}/-
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Safety & Quality Guarantees */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl border border-[#D9E5EB] bg-white flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#007F70] shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-[#102B35]">Verified Technicians</p>
                                    <p className="text-[10px] text-[#647B8D]">Background checked partners</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl border border-[#D9E5EB] bg-white flex items-center gap-2.5">
                                <Lock className="w-4 h-4 text-[#007F70] shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-[#102B35]">256-Bit SSL Encrypted</p>
                                    <p className="text-[10px] text-[#647B8D]">Safe online payment</p>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="bg-white rounded-xl border border-[#D9E5EB] p-3 shadow-2xs">
                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={e => setAgreed(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded text-[#007F70] border-gray-300 focus:ring-[#007F70]"
                                />
                                <span className="text-xs text-[#102B35] leading-relaxed font-medium">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-[#007F70] font-bold underline hover:text-[#00594F]"
                                    >
                                        Terms &amp; Conditions
                                    </button>{' '}
                                    and authorize Doorstep Hub to process this service appointment.
                                </span>
                            </label>
                        </div>
                    </div>
                );

            /* ─── STEP 3: Review All Details (4 Columns on Desktop) ─── */
            case 3:
                return (
                    <div className="space-y-3.5">
                        <div className="bg-white rounded-xl border border-[#D9E5EB] p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-[#102B35]">Appointment Overview</h3>
                                    <p className="text-[11px] text-[#647B8D]">Verify your details before completing booking</p>
                                </div>
                                <span className="text-xs font-bold text-[#007F70] bg-[#DDF5EF] px-2.5 py-0.5 rounded-full">
                                    Step 4 of 4
                                </span>
                            </div>

                            {/* 4 Cards in 4 Columns on Desktop */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                                {/* Customer Info */}
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                                    <p className="font-bold text-[#007F70] flex items-center gap-1 uppercase tracking-wide text-[10px]">
                                        <User className="w-3 h-3" /> Customer
                                    </p>
                                    <p className="text-[#102B35] font-bold text-xs">{formData.firstName} {formData.lastName}</p>
                                    <p className="text-[#647B8D] text-[11px]">{formData.phone}</p>
                                    <p className="text-[#647B8D] text-[11px] truncate">{formData.email}</p>
                                </div>

                                {/* Service Info */}
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                                    <p className="font-bold text-[#007F70] flex items-center gap-1 uppercase tracking-wide text-[10px]">
                                        <Building2 className="w-3 h-3" /> Service
                                    </p>
                                    <p className="text-[#102B35] font-bold text-xs">{formData.categoryName || 'General Appliance'}</p>
                                    {formData.subcategoryName && (
                                        <p className="text-[#647B8D] text-[11px]">Type: <span className="font-semibold text-[#102B35]">{formData.subcategoryName}</span></p>
                                    )}
                                    <p className="text-[#647B8D] text-[11px]">City: <span className="font-semibold text-[#102B35]">{formData.cityName}</span></p>
                                </div>

                                {/* Address Info */}
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                                    <p className="font-bold text-[#007F70] flex items-center gap-1 uppercase tracking-wide text-[10px]">
                                        <MapPin className="w-3 h-3" /> Doorstep Address
                                    </p>
                                    <p className="text-[#102B35] font-semibold text-xs leading-snug break-words">
                                        {[formData.flat, formData.area].filter(Boolean).join(', ') || formData.address}
                                    </p>
                                    {formData.landmark && (
                                        <p className="text-[#647B8D] text-[11px] leading-tight">
                                            <span className="font-medium text-gray-500">Landmark:</span> {formData.landmark}
                                        </p>
                                    )}
                                    <p className="text-[#647B8D] text-[11px] leading-tight font-medium">
                                        {[formData.cityName, formData.pincode ? `Pincode: ${formData.pincode}` : ''].filter(Boolean).join(' • ')}
                                    </p>
                                </div>

                                {/* Schedule Info */}
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                                    <p className="font-bold text-[#007F70] flex items-center gap-1 uppercase tracking-wide text-[10px]">
                                        <Calendar className="w-3 h-3" /> Schedule
                                    </p>
                                    <p className="text-[#102B35] font-bold text-xs">{formData.bookingDate || 'Not selected'}</p>
                                    <p className="text-[#007F70] font-bold text-[11px]">{formData.bookingTime || 'Not selected'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Amount Due Card */}
                        <div className="bg-[#003831] text-white rounded-xl p-4 shadow-md flex items-center justify-between flex-wrap gap-2.5">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[#0ABF83] font-bold">Payable Online Now</p>
                                <p className="text-2xl font-black text-white mt-0.5">₹{feesLoading ? '99' : platformFee}/-</p>
                                <p className="text-[11px] text-gray-300">Inspection fee (₹{feesLoading ? '175' : consultationFee}) payable to technician after visit.</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-[#00594F] text-white text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-xs">
                                    <Lock className="w-3 h-3" /> 256-Bit Secure
                                </span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F7FAF9] flex flex-col lg:flex-row overflow-x-hidden font-sans">
            {/* ── Mobile Top Sticky Stepper ── */}
            <div className="lg:hidden bg-[#003831] text-white px-3.5 py-2.5 sticky top-20 z-30 shadow-md">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black tracking-wider uppercase text-[#0ABF83]">
                        Step {currentStep + 1} of {STEPS.length}
                    </span>
                    <span className="text-xs font-bold text-gray-200">
                        {STEPS[currentStep].title}
                    </span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-[#0ABF83] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* ── Main Booking Form Area (Left) ── */}
            <div className="flex-1 min-w-0 flex justify-center lg:justify-end px-3 sm:px-6 lg:pl-8 lg:pr-4 xl:pr-6 pt-24 pb-24 lg:pb-12">
                <div className="w-full max-w-4xl xl:max-w-5xl">
                    {/* Header Banner - Compact & Tight */}
                    <div className="mb-3.5">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#007F70] bg-[#DDF5EF] px-3 py-0.5 rounded-full mb-1">
                            <Zap className="w-3 h-3 fill-[#007F70]" /> DOORSTEP SERVICES
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B35] tracking-tight">
                            {STEPS[currentStep].title}
                        </h1>
                        <p className="text-xs sm:text-sm text-[#647B8D] font-medium mt-0.5">
                            {STEPS[currentStep].subtitle}
                        </p>
                    </div>

                    {/* Step Form Content */}
                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3 mt-4 pt-2">
                        {currentStep > 0 ? (
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={submitting}
                                className="px-5 py-2.5 rounded-xl border border-[#D9E5EB] bg-white text-[#102B35] font-bold text-xs sm:text-sm hover:bg-gray-50 transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-7 py-2.5 rounded-xl bg-[#00594F] hover:bg-[#007F70] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#00594F]/20 transition-all flex items-center gap-1.5 active:scale-95 ml-auto"
                            >
                                Next Step <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-7 py-2.5 rounded-xl bg-[#00594F] hover:bg-[#007F70] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#00594F]/30 transition-all flex items-center gap-1.5 active:scale-95 ml-auto disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Redirecting to Gateway...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3.5 h-3.5" /> Pay ₹{feesLoading ? '99' : platformFee} &amp; Confirm Booking
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Desktop Right Sidebar Stepper (Full Height Green Background & Larger Text) ── */}
            <div className="hidden lg:flex w-[380px] xl:w-[440px] 2xl:w-[480px] bg-[#003831] text-white pt-24 pb-8 px-6 xl:px-8 2xl:px-10 flex-col justify-between self-stretch shrink-0 shadow-2xl border-l border-white/10">
                <div className="sticky top-24 w-full flex flex-col justify-between min-h-[calc(100vh-8rem)]">
                    <div>
                        <div className="mb-7">
                            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#0ABF83]">
                                DOORSTEP HUB
                            </span>
                            <h2 className="text-2xl xl:text-3xl font-black text-white mt-1">
                                Booking Progress
                            </h2>
                        </div>

                        {/* Stepper Timeline */}
                        <div className="space-y-6 relative">
                            {STEPS.map((step, idx) => {
                                const isDone = idx < currentStep;
                                const isCurrent = idx === currentStep;

                                return (
                                    <div key={step.id} className="flex items-start gap-3.5 relative">
                                        {/* Line Connector */}
                                        {idx < STEPS.length - 1 && (
                                            <div
                                                className={`absolute left-[21px] top-11 w-0.5 h-10 transition-colors duration-300 ${idx < currentStep ? 'bg-[#0ABF83]' : 'bg-white/20'
                                                    }`}
                                            />
                                        )}

                                        {/* Step Icon Badge */}
                                        <div
                                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all z-10 ${isDone
                                                ? 'bg-[#0ABF83] text-[#003831]'
                                                : isCurrent
                                                    ? 'bg-white text-[#00594F] ring-4 ring-[#0ABF83]/30 shadow-lg'
                                                    : 'bg-transparent text-white/50 border border-white/20'
                                                }`}
                                        >
                                            {isDone ? (
                                                <Check className="w-5 h-5 stroke-[3]" />
                                            ) : (
                                                <step.icon className={`w-5 h-5 ${isCurrent ? 'text-[#00594F]' : 'text-white/60'}`} />
                                            )}
                                        </div>

                                        {/* Step Title & Subtitle */}
                                        <div className="pt-0.5 flex-1">
                                            <p
                                                className={`text-sm sm:text-base font-bold transition-colors ${isCurrent ? 'text-white' : isDone ? 'text-[#DDF5EF]' : 'text-white/50'
                                                    }`}
                                            >
                                                {step.title}
                                            </p>
                                            <p
                                                className={`text-xs sm:text-[13px] leading-relaxed mt-0.5 transition-colors ${isCurrent ? 'text-gray-200' : 'text-white/40'
                                                    }`}
                                            >
                                                {step.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* WhatsApp Support Section */}
                    <div className="pt-6 border-t border-white/10 mt-8 w-full">
                        <div className="flex items-center gap-3.5">
                            <a
                                href="https://api.whatsapp.com/send/?phone=918886688666&text=Hi%2C%20I%20need%20doorstep%20service%20support&type=phone_number&app_absent=0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                                aria-label="Chat with us on WhatsApp"
                            >
                                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                </svg>
                            </a>
                            <div>
                                <p className="text-sm sm:text-base font-bold text-white">Need Support?</p>
                                <a
                                    href="https://api.whatsapp.com/send/?phone=918886688666&text=Hi%2C%20I%20need%20doorstep%20service%20support&type=phone_number&app_absent=0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs sm:text-sm text-[#0ABF83] font-bold hover:underline block cursor-pointer mt-0.5"
                                >
                                    Chat with us on WhatsApp
                                </a>
                                <p className="text-xs text-white/70 leading-normal mt-0.5">
                                    We&apos;re here to help you with your booking.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile Sticky Bottom Action Bar ── */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-2.5 bg-white/95 backdrop-blur-md border-t border-[#D9E5EB] z-40 flex items-center gap-2.5 shadow-lg">
                {currentStep > 0 && (
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={submitting}
                        className="py-2.5 px-3.5 rounded-xl border border-[#D9E5EB] bg-white text-[#102B35] font-bold text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                )}

                {currentStep < 3 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#00594F] hover:bg-[#007F70] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                        Next Step <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#00594F] hover:bg-[#007F70] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Lock className="w-3.5 h-3.5" /> Pay ₹{feesLoading ? '99' : platformFee} &amp; Confirm
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* ── Terms & Conditions Modal ── */}
            {showTermsModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTermsModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#DDF5EF] flex items-center justify-center">
                                    <ScrollText className="w-4 h-4 text-[#007F70]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#102B35]">Terms &amp; Conditions</h3>
                                    <p className="text-xs text-[#647B8D]">Please read carefully before booking</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            {termsLoading ? (
                                <div className="py-16 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-8 h-8 text-[#007F70] animate-spin" />
                                    <p className="text-gray-500 font-medium text-xs">Loading content...</p>
                                </div>
                            ) : termsContent?.termsAndConditions ? (
                                <div
                                    className="prose prose-sm max-w-none text-[#102B35]"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(termsContent.termsAndConditions) }}
                                />
                            ) : (
                                <div className="space-y-4 text-xs sm:text-sm text-[#102B35] leading-relaxed">
                                    <h4 className="font-bold text-sm text-[#00594F]">Doorstep Hub Service Booking Terms &amp; Conditions</h4>
                                    <p>1. <strong>Online Platform Fee:</strong> A non-refundable online booking fee of ₹{feesLoading ? '99' : platformFee}/- is collected to secure appointment scheduling and verified technician allocation.</p>
                                    <p>2. <strong>Doorstep Inspection Fee:</strong> The standard doorstep inspection fee of ₹{feesLoading ? '175' : consultationFee}/- is payable directly to the technician after on-site diagnostic inspection.</p>
                                    <p>3. <strong>Service Warranty:</strong> Eligible repair services include 30 to 90 days warranty on genuine replacement components and professional workmanship.</p>
                                    <p>4. <strong>Safety &amp; Compliance:</strong> All doorstep service partners are background-verified and adhere to strict safety protocols.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => {
                                    setAgreed(true);
                                    setShowTermsModal(false);
                                }}
                                className="px-6 py-2.5 bg-[#00594F] text-white font-bold rounded-xl hover:bg-[#007F70] transition-all shadow-md active:scale-95 text-xs"
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
