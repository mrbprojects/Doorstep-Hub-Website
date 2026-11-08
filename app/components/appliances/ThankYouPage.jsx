'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    CheckCircle,
    Home,
    Smartphone,
    Calendar,
    Clock,
    MapPin,
    Sparkles,
    Gift,
    Copy,
    Check,
    CalendarCheck,
    ShieldCheck,
    Wrench,
    Star,
    Radio,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const WhatsAppSvg = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const GooglePlaySvg = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3.608 1.636a1.442 1.442 0 0 0-.358.988v18.752c0 .385.127.733.358.988l.056.056 10.5-10.428v-.248L3.664 1.58l-.056.056Z" fill="#2196F3" />
        <path d="M17.664 15.492l-3.5-3.48v-.248l3.5-3.48.08.046 4.148 2.357c1.184.673 1.184 1.774 0 2.447l-4.148 2.358-.08.046Z" fill="#FFC107" />
        <path d="M14.244 11.764L3.608 22.364c.389.412 1.05.464 1.79.043l12.346-7.015-3.5-3.628Z" fill="#F44336" />
        <path d="M14.244 11.764l3.5-3.628L5.398 1.121c-.74-.421-1.401-.369-1.79.043l10.636 10.6Z" fill="#4CAF50" />
    </svg>
);

const AppleSvg = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.86.96-2.84-.93.04-2.05.62-2.7 1.39-.58.67-1.08 1.76-.95 2.82 1.04.08 2.06-.59 2.69-1.37z" />
    </svg>
);
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function ThankYouPage({ bookingDetails }) {
    const router = useRouter();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [idCopied, setIdCopied] = useState(false);
    const [referAndEarnAmount, setReferAndEarnAmount] = useState('49');
    const [registrationBonus, setRegistrationBonus] = useState('99');

    React.useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
                const data = await res.json();
                if (data.success && data.policy) {
                    if (data.policy.customerReferedAmount) setReferAndEarnAmount(data.policy.customerReferedAmount);
                    if (data.policy.referedAmount) setRegistrationBonus(data.policy.referedAmount);
                }
            } catch { /* use defaults */ }
        };
        fetchGlobalSettings();
    }, []);

    const rawId = bookingDetails?.orderId || bookingDetails?.rawOrderId || '';
    // Format display ID: if it's a 24-character hex MongoDB ID, format clean user-friendly ID
    const isMongoId = /^[a-f\d]{24}$/i.test(rawId);
    const displayBookingId = isMongoId ? `DH-${rawId.slice(-8).toUpperCase()}` : (rawId || 'DH-CONFIRMED');

    const referralCode = bookingDetails?.referalCode || user?.phone || `DH${referAndEarnAmount}`;
    const inviteLink = `https://doorstephub.com?ref=${referralCode}`;

    const handleCopyId = () => {
        if (!displayBookingId) return;
        navigator.clipboard.writeText(displayBookingId);
        setIdCopied(true);
        toast.success(`Booking ID ${displayBookingId} copied!`);
        setTimeout(() => setIdCopied(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const message = `Hey! I just booked a service on Doorstep Hub. Use my link to get amazing doorstep services with verified technicians and earn rewards: ${inviteLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`, '_blank');
    };

    const handleShareTwitter = () => {
        const text = `Hey! I just booked a service on Doorstep Hub. Use my link to get amazing doorstep services and earn rewards!`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(inviteLink)}`, '_blank');
    };

    const handleShareLinkedin = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`, '_blank');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    const handleGoMyBookings = () => {
        router.push('/account/bookings');
    };

    return (
        <div className="thank-you-page-root min-h-screen bg-[#F4F7F9] py-6 sm:py-10 px-3.5 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-5xl mx-auto w-full space-y-5"
            >
                {/* ── Top Celebration Header ── */}
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
                        className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#00594F] to-[#007F70] text-white shadow-lg shadow-[#007F70]/25 mb-1"
                    >
                        <CheckCircle className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={2.5} />
                    </motion.div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#102B35] flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#007F70] shrink-0" />
                        <span>Booking Confirmed!</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#374151] max-w-xl mx-auto leading-relaxed">
                        Your doorstep service appointment has been received successfully. We have sent the booking details & confirmation to your registered mobile number and email.
                    </p>

                    {/* ── Prominent Booking ID Box ── */}
                    <div className="pt-2 flex justify-center">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-[#D9E5EB] shadow-xs flex-wrap justify-center">
                            <span className="px-2 py-0.5 rounded-md bg-[#DDF5EF] text-[#007F70] font-extrabold text-[11px] uppercase tracking-wider">
                                Booking ID
                            </span>
                            <span className="text-sm sm:text-base font-black font-mono text-[#102B35] tracking-wide select-all">
                                {displayBookingId}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyId}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-[#007F70] transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                                title="Copy Booking ID"
                            >
                                {idCopied ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                                        <span className="text-emerald-700 text-[11px]">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span className="text-[11px] hidden sm:inline">Copy</span>
                                    </>
                                )}
                            </button>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block"></span>
                            <span className="text-[11px] font-bold text-emerald-700 hidden sm:inline-block">
                                Status: Confirmed
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Main 2-Column Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Left Column (7 cols): Appointment Details */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                        <div className="bg-white rounded-2xl border border-[#D9E5EB] p-4 sm:p-6 shadow-xs h-full flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                                    <h3 className="text-sm sm:text-base font-extrabold text-[#102B35] flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#007F70]" />
                                        <span>Appointment Details</span>
                                    </h3>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        CONFIRMED
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {/* Service Title */}
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-[#DDF5EF] text-[#007F70] flex items-center justify-center shrink-0 mt-0.5">
                                            <Wrench className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#00594F]">Booked Service</p>
                                            <p className="text-xs sm:text-sm font-extrabold text-[#102B35] truncate">
                                                {bookingDetails?.serviceName || 'Appliance Repair & Doorstep Service'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Scheduled Date & Time Slot Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-[#DDF5EF] text-[#007F70] flex items-center justify-center shrink-0">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#00594F]">Scheduled Date</p>
                                                <p className="text-xs sm:text-sm font-extrabold text-[#102B35] truncate">
                                                    {bookingDetails?.date && bookingDetails.date !== 'Confirmed'
                                                        ? bookingDetails.date
                                                        : 'Scheduled as Requested'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-[#DDF5EF] text-[#007F70] flex items-center justify-center shrink-0">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#00594F]">Preferred Slot</p>
                                                <p className="text-xs sm:text-sm font-extrabold text-[#007F70] truncate">
                                                    {bookingDetails?.time || '2-Hour Arrival Window'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Doorstep Location */}
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-[#DDF5EF] text-[#007F70] flex items-center justify-center shrink-0 mt-0.5">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#00594F]">Doorstep Address</p>
                                            <p className="text-xs sm:text-sm font-bold text-[#102B35] leading-relaxed">
                                                {bookingDetails?.address || 'Your verified doorstep service address'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Guarantee Box */}
                            <div className="p-3 rounded-xl bg-[#E6F7F2] border border-[#B2E7DB] flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#00594F] shrink-0" />
                                <p className="text-xs font-medium text-[#00594F] leading-tight">
                                    <strong className="font-bold">Doorstep Hub Guarantee:</strong> A verified expert technician will arrive on time with genuine tools. You pay inspection fee only after visit.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (5 cols): Refer & Earn Card */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#003831] via-[#004D43] to-[#00594F] text-white p-5 shadow-md flex flex-col justify-between h-full space-y-4">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Gift className="w-36 h-36 text-white -rotate-12" />
                            </div>

                            <div className="relative z-10 space-y-3.5">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0">
                                            <Gift className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 style={{ color: '#ffffff' }} className="text-base sm:text-lg font-black leading-tight !text-white">Refer &amp; Earn</h3>
                                            <p style={{ color: '#ffffff' }} className="font-medium text-[11px] !text-white">Share your link. Earn real cash rewards.</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 bg-yellow-400 text-black px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm">
                                        <Sparkles className="w-3 h-3 text-black" />
                                        ₹{registrationBonus} Bonus
                                    </span>
                                </div>

                                {/* Dual Reward Tiles */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/25 shadow-sm">
                                        <p style={{ color: '#ffffff' }} className="text-[10px] uppercase tracking-wider font-extrabold !text-white">You Earn</p>
                                        <p style={{ color: '#ffffff' }} className="text-2xl sm:text-3xl font-black mt-0.5 drop-shadow-sm !text-white">₹{referAndEarnAmount}</p>
                                        <p style={{ color: '#ffffff' }} className="text-[10px] font-medium mt-0.5 !text-white">after friend&apos;s 1st service</p>
                                    </div>
                                    <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/25 shadow-sm">
                                        <p style={{ color: '#ffffff' }} className="text-[10px] uppercase tracking-wider font-extrabold !text-white">Friend Gets</p>
                                        <p style={{ color: '#ffffff' }} className="text-2xl sm:text-3xl font-black mt-0.5 drop-shadow-sm !text-white">₹{registrationBonus}</p>
                                        <p style={{ color: '#ffffff' }} className="text-[10px] font-medium mt-0.5 !text-white">on first registration</p>
                                    </div>
                                </div>

                                {/* Referral Link Bar */}
                                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/25 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p style={{ color: '#ffffff' }} className="text-[10px] font-extrabold uppercase tracking-wider !text-white">Your Referral Link</p>
                                            <p style={{ color: '#ffffff' }} className="text-xs font-mono font-bold truncate mt-0.5 select-all !text-white">{inviteLink}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCopyLink}
                                            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-white/90 text-[#00594F] transition-all active:scale-95 text-xs font-black cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-[#00594F]" />}
                                            <span>{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Instant Share Buttons */}
                                <div className="space-y-1.5 pt-1">
                                    <p style={{ color: '#ffffff' }} className="text-[11px] font-extrabold uppercase tracking-wider !text-white">Share Instantly Via</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            type="button"
                                            onClick={handleShareWhatsApp}
                                            className="py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                                            title="Share on WhatsApp"
                                        >
                                            <WhatsAppSvg className="w-4 h-4 shrink-0" />
                                            <span className="hidden sm:inline">WhatsApp</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleShareFacebook}
                                            className="py-2 px-2.5 rounded-xl bg-[#1877F2] hover:bg-[#0C63D4] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                                            title="Share on Facebook"
                                        >
                                            <span className="font-black text-sm">f</span>
                                            <span className="hidden sm:inline">Facebook</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleShareTwitter}
                                            className="py-2 px-2.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer border border-white/20"
                                            title="Share on X / Twitter"
                                        >
                                            <span className="font-black text-sm">X</span>
                                            <span className="hidden sm:inline">Twitter</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleShareLinkedin}
                                            className="py-2 px-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#084E96] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                                            title="Share on LinkedIn"
                                        >
                                            <span className="font-black text-sm">in</span>
                                            <span className="hidden sm:inline">LinkedIn</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── HIGHLIGHTED APP DOWNLOAD SECTION (Android & iOS) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl bg-gradient-to-r from-[#002B25] via-[#003831] to-[#00594F] border border-[#007F70]/40 p-5 sm:p-7 shadow-xl text-white relative overflow-hidden"
                >
                    {/* Background Decorative Circles */}
                    <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-[#007F70]/20 blur-2xl pointer-events-none"></div>
                    <div className="absolute -left-10 -top-10 w-60 h-60 rounded-full bg-[#0ABF83]/15 blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Left Side: App Intro & Features */}
                        <div className="space-y-3 max-w-xl text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0ABF83]/20 border border-[#0ABF83]/40 text-[#0ABF83] text-xs font-extrabold uppercase tracking-wider">
                                <Star className="w-3.5 h-3.5 fill-current text-[#0ABF83]" />
                                <span>Top Rated Service App · 4.8 ★★★★★</span>
                            </div>

                            <h2 style={{ color: '#ffffff' }} className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight !text-white">
                                Track Your Service Live on Doorstep Hub App
                            </h2>

                            <p style={{ color: '#ffffff' }} className="text-xs sm:text-sm font-medium leading-relaxed !text-white">
                                Get live technician GPS arrival updates, direct chat, one-click OTP verification, and download instant GST service invoices right from your mobile.
                            </p>

                            {/* Features list */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                                <span style={{ color: '#ffffff' }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-sm shadow-xs !text-white">
                                    <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> Live GPS Tracking
                                </span>
                                <span style={{ color: '#ffffff' }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-sm shadow-xs !text-white">
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-300" /> Real-Time Updates
                                </span>
                                <span style={{ color: '#ffffff' }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-sm shadow-xs !text-white">
                                    <FileText className="w-3.5 h-3.5 text-emerald-300" /> Tax Invoices
                                </span>
                            </div>
                        </div>

                        {/* Right Side: LARGE Highlighted Android & iOS Store Download Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
                            {/* Google Play Store Button */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.4)' }}
                                className="group/gp flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-white border-2 hover:border-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer justify-center"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shrink-0 shadow-md group-hover/gp:scale-110 transition-transform">
                                    <GooglePlaySvg className="w-7 h-7 shrink-0" />
                                </div>
                                <div className="text-left">
                                    <p style={{ color: '#ffffff' }} className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold leading-none !text-white">
                                        GET IT ON
                                    </p>
                                    <p style={{ color: '#ffffff' }} className="text-base sm:text-lg font-black tracking-wide leading-tight mt-1 !text-white">
                                        Google Play
                                    </p>
                                </div>
                            </a>

                            {/* Apple App Store Button */}
                            <a
                                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.4)' }}
                                className="group/ios flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-white border-2 hover:border-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer justify-center"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shrink-0 shadow-md group-hover/ios:scale-110 transition-transform">
                                    <AppleSvg className="w-7 h-7 shrink-0 text-black" />
                                </div>
                                <div className="text-left">
                                    <p style={{ color: '#ffffff' }} className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold leading-none !text-white">
                                        Download on the
                                    </p>
                                    <p style={{ color: '#ffffff' }} className="text-base sm:text-lg font-black tracking-wide leading-tight mt-1 !text-white">
                                        App Store
                                    </p>
                                </div>
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* ── Bottom Navigation Action Buttons ── */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-lg mx-auto w-full">
                    <button
                        type="button"
                        onClick={handleGoHome}
                        className="w-full sm:w-1/2 py-3 px-5 bg-white border-2 border-[#00594F] text-[#00594F] hover:bg-[#00594F]/5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        <span>Go to Homepage</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleGoMyBookings}
                        className="w-full sm:w-1/2 py-3 px-5 bg-gradient-to-r from-[#00594F] to-[#007F70] hover:from-[#00473F] hover:to-[#00594F] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-[#00594F]/25 hover:scale-[1.01] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
                    >
                        <CalendarCheck className="w-4 h-4" />
                        <span>Go to My Bookings</span>
                    </button>
                </div>

                {/* Help Footnote */}
                <p className="text-center text-xs text-[#647B8D] pt-1">
                    Need instant help with your booking? Chat with us on{' '}
                    <a
                        href="https://wa.me/919441457677"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007F70] font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                        WhatsApp Support
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
