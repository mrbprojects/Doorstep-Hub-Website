'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    Share2,
    Check,
    CalendarCheck,
    ShieldCheck,
    Wrench,
    MessageCircle,
    Star,
    Radio,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function ThankYouPage({ bookingDetails }) {
    const router = useRouter();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [idCopied, setIdCopied] = useState(false);
    const [showSocials, setShowSocials] = useState(false);
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
            } catch (e) { /* use defaults */ }
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

    const WhatsAppSvg = ({ className }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );

    const GooglePlaySvg = ({ className }) => (
        <svg viewBox="0 0 512 512" className={className}>
            <path fill="#4285F4" d="M32.5 28.5L278.4 256 32.5 483.5c-4.4-4.4-6.5-10.5-6.5-17.5V46c0-7 2.1-13.1 6.5-17.5z" />
            <path fill="#FBBC04" d="M362.4 177.6L278.4 256l84 78.4 46.2-26.4c13.2-7.5 21.4-21.6 21.4-36.8 0-15.2-8.2-29.3-21.4-36.8l-46.2-26.8z" />
            <path fill="#EA4335" d="M278.4 256L32.5 28.5c6.3-6.3 15.6-8.5 24.5-3.4l242.4 138.4L278.4 256z" />
            <path fill="#34A853" d="M278.4 256l21 12.5 242.4 138.4c-8.9 5.1-18.2 2.9-24.5-3.4L278.4 256z" />
        </svg>
    );

    const AppleSvg = ({ className }) => (
        <svg viewBox="0 0 170 170" fill="currentColor" className={className}>
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.01-6.74-10.43-12.03-21.9-15.87-34.42-3.83-12.51-5.75-24.3-5.75-35.35 0-15.75 4.12-28.71 12.35-38.89 8.24-10.18 18.57-15.39 31-15.64 4.58 0 9.85 1.25 15.82 3.76 5.97 2.51 9.94 3.76 11.91 3.76 1.63 0 5.76-1.31 12.38-3.93 6.62-2.62 12.16-3.75 16.63-3.39 12.51.99 22.42 5.56 29.74 13.72-10.96 6.64-16.32 15.66-16.08 27.05.25 9.04 3.72 16.71 10.42 23.01 6.7 6.3 14.59 10.05 23.68 11.25-2.22 6.84-4.87 13.62-7.94 20.35zM119.22 31.84c0-7.72 2.76-14.89 8.28-21.52 5.53-6.63 12.35-10.32 20.47-11.08.13 1.01.19 1.83.19 2.45 0 7.47-2.92 14.75-8.77 21.84-5.84 7.08-12.78 10.95-20.81 11.61-.39-1.12-.59-2.22-.59-3.3z" />
        </svg>
    );

    const socialIcons = [
        { icon: WhatsAppSvg, text: 'WhatsApp', action: handleShareWhatsApp, color: 'hover:bg-[#25D366]' },
        { icon: ({ className }) => <span className={`font-black ${className}`}>f</span>, text: 'Facebook', action: handleShareFacebook, color: 'hover:bg-[#1877F2]' },
        { icon: ({ className }) => <span className={`font-black ${className}`}>X</span>, text: 'X (Twitter)', action: handleShareTwitter, color: 'hover:bg-black' },
        { icon: ({ className }) => <span className={`font-black ${className}`}>in</span>, text: 'LinkedIn', action: handleShareLinkedin, color: 'hover:bg-[#0A66C2]' },
    ];

    return (
        <div className="min-h-screen bg-[#F4F7F9] py-6 sm:py-10 px-3.5 sm:px-6">
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
                    <p className="text-xs sm:text-sm text-[#647B8D] max-w-xl mx-auto leading-relaxed">
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
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#647B8D]">Booked Service</p>
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
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#647B8D]">Scheduled Date</p>
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
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#647B8D]">Preferred Slot</p>
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
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#647B8D]">Doorstep Address</p>
                                            <p className="text-xs sm:text-sm font-medium text-[#102B35] leading-relaxed">
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
                                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                                            <Gift className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black text-white leading-tight">Refer &amp; Earn</h3>
                                            <p className="text-white/80 text-[11px]">Share your link. Earn real cash rewards.</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 bg-yellow-400/20 border border-yellow-400/30 px-2.5 py-1 rounded-full text-yellow-300 text-[10px] font-bold">
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                        ₹{registrationBonus} Bonus
                                    </span>
                                </div>

                                {/* Dual Reward Tiles */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                        <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold">You Earn</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">₹{referAndEarnAmount}</p>
                                        <p className="text-white/70 text-[10px] mt-0.5">after friend&apos;s 1st service</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                        <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold">Friend Gets</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">₹{registrationBonus}</p>
                                        <p className="text-white/70 text-[10px] mt-0.5">on first registration</p>
                                    </div>
                                </div>

                                {/* Referral Link Bar */}
                                <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/15 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Your Referral Link</p>
                                            <p className="text-white text-xs font-mono font-bold truncate mt-0.5">{inviteLink}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCopyLink}
                                            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 border border-white/20 text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Instant Share Buttons */}
                                <div className="space-y-1.5 pt-1">
                                    <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Share Instantly Via</p>
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
                                            className="py-2 px-2.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
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

                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                                Track Your Service Live on Doorstep Hub App
                            </h2>

                            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                                Get live technician GPS arrival updates, direct chat, one-click OTP verification, and download instant GST service invoices right from your mobile.
                            </p>

                            {/* Features list */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                    <Radio className="w-3.5 h-3.5 text-[#0ABF83] animate-pulse" /> Live GPS Tracking
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                    <Smartphone className="w-3.5 h-3.5 text-[#0ABF83]" /> Real-Time Updates
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                    <FileText className="w-3.5 h-3.5 text-[#0ABF83]" /> Tax Invoices
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
                                className="group/gp flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-black/90 hover:bg-black text-white border-2 border-white/25 hover:border-[#0ABF83] shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer justify-center"
                            >
                                <GooglePlaySvg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 drop-shadow-md group-hover/gp:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-gray-400 font-semibold leading-none">
                                        GET IT ON
                                    </p>
                                    <p className="text-base sm:text-lg font-black text-white tracking-wide leading-tight mt-0.5">
                                        Google Play
                                    </p>
                                </div>
                            </a>

                            {/* Apple App Store Button */}
                            <a
                                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/ios flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-black/90 hover:bg-black text-white border-2 border-white/25 hover:border-[#0ABF83] shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer justify-center"
                            >
                                <AppleSvg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 text-white drop-shadow-md group-hover/ios:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="text-[10px] sm:text-[11px] tracking-wide text-gray-400 font-semibold leading-none">
                                        Download on the
                                    </p>
                                    <p className="text-base sm:text-lg font-black text-white tracking-wide leading-tight mt-0.5">
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
