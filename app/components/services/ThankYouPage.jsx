'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Home, Smartphone, Download, Calendar, Clock, MapPin, Sparkles, Gift, Copy, Share2, Check, Facebook, Twitter, Linkedin, CalendarCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function ThankYouPage({ bookingDetails }) {
    const router = useRouter();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
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

    const inviteLink = `https://doorstephub.com?ref=${user?.phone || `DH${referAndEarnAmount}`}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const message = `Hey! I just booked a service on Doorstep Hub. Use my link to get amazing services and help me earn rewards: ${inviteLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`, '_blank');
    };

    const handleShareTwitter = () => {
        const text = `Hey! I just booked a service on Doorstep Hub. Use my link to get amazing services and help me earn rewards!`;
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

    const WhatsAppIcon = ({ className }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );

    const socialIcons = [
        { icon: WhatsAppIcon, text: 'WhatsApp', action: handleShareWhatsApp },
        { icon: Facebook, text: 'Facebook', action: handleShareFacebook },
        { icon: Twitter, text: 'Twitter', action: handleShareTwitter },
        { icon: Linkedin, text: 'LinkedIn', action: handleShareLinkedin },
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] flex flex-col justify-center px-4 py-4 sm:py-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-7xl mx-auto w-full"
            >
                {/* Header: Success Icon & Confirmed Heading */}
                <div className="text-center mb-3 sm:mb-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
                        className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-md shadow-[#037166]/20 mb-2"
                    >
                        <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.5} />
                    </motion.div>

                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#037166]" />
                        <span>Booking Confirmed!</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        Your service booking has been received. We've sent confirmation to your registered email & phone.
                    </p>

                    {bookingDetails?.orderId && (
                        <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#037166] text-xs font-mono font-bold">
                            <span>Booking ID:</span>
                            <span className="text-gray-900">{bookingDetails.orderId}</span>
                        </div>
                    )}
                </div>

                {/* Main 2-Column Content Layout (Fits in 1 Screen) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-stretch mb-3.5 sm:mb-4">
                    {/* Left Column (5 cols): Booking Summary & App Download */}
                    <div className="md:col-span-5 flex flex-col gap-3">
                        {/* Booking Details Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex-1 flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-[#037166]" />
                                    <span>Booking Details</span>
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Confirmed
                                </span>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-7 h-7 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                        <Calendar className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Scheduled Date</p>
                                        <p className="font-bold text-gray-900 truncate">{bookingDetails?.date || 'Confirmed'}</p>
                                    </div>
                                </div>

                                {bookingDetails?.time && (
                                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-7 h-7 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time Slot</p>
                                            <p className="font-bold text-gray-900 truncate">{bookingDetails.time}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-7 h-7 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0 mt-0.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Service Location</p>
                                        <p className="font-medium text-gray-800 line-clamp-2 leading-relaxed text-xs">
                                            {bookingDetails?.address || 'Your saved service address'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Doorstep Hub App Download Strip */}
                        <motion.div
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white border border-gray-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-gray-900 truncate">Doorstep Hub App</h4>
                                    <p className="text-[10px] text-gray-500 truncate">Track service & get live updates</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <a
                                    href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-transform hover:scale-105 active:scale-95"
                                >
                                    <div className="w-[105px] h-8 relative rounded-full overflow-hidden bg-gradient-to-br from-[#037166] to-[#04a99d] border border-[#037166]/30 shadow-xs">
                                        <Image src="/apple2.png" alt="App Store" fill className="object-cover" />
                                    </div>
                                </a>
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-transform hover:scale-105 active:scale-95"
                                >
                                    <div className="w-[105px] h-8 relative rounded-full overflow-hidden bg-gradient-to-br from-[#037166] to-[#04a99d] border border-[#037166]/30 shadow-xs">
                                        <Image src="/android1.png" alt="Google Play" fill className="object-cover" />
                                    </div>
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column (7 cols): Refer & Earn Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-7 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#037166] via-[#025f56] to-[#013f39] text-white p-4 sm:p-5 flex flex-col justify-between shadow-sm"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-[0.08] pointer-events-none">
                            <Gift className="w-36 h-36 text-white -rotate-12" />
                        </div>

                        <div className="relative z-10">
                            {/* Refer Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
                                        <Gift className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">Refer & Earn</h3>
                                        <p className="text-white/80 text-[11px]">Share your link. Earn real cash rewards.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-400/20 border border-yellow-400/30 px-2.5 py-1 rounded-full flex-shrink-0">
                                    <Sparkles className="w-3 h-3 text-yellow-300" />
                                    <span className="text-yellow-300 text-[10px] font-bold">₹{registrationBonus} Bonus</span>
                                </div>
                            </div>

                            {/* Dual Reward Tiles */}
                            <div className="grid grid-cols-2 gap-2.5 mb-3">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                    <p className="text-white/80 text-[9px] uppercase tracking-wider font-bold">You Earn</p>
                                    <p className="text-2xl font-black text-white mt-0.5">₹{referAndEarnAmount}</p>
                                    <p className="text-white/70 text-[10px] mt-0.5">after friend's 1st booking</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                    <p className="text-white/80 text-[9px] uppercase tracking-wider font-bold">Friend Gets</p>
                                    <p className="text-2xl font-black text-white mt-0.5">₹{registrationBonus}</p>
                                    <p className="text-white/70 text-[10px] mt-0.5">on first registration</p>
                                </div>
                            </div>

                            {/* Referral Code & Social Share Box */}
                            <div className="bg-black/30 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/10 flex items-center justify-between gap-2.5 mb-2.5">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/60 text-[9px] uppercase tracking-wider font-bold">Your Referral Link</p>
                                    <p className="text-white text-xs font-mono font-bold truncate mt-0.5">{inviteLink}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 border border-white/15 flex items-center gap-1 text-xs font-semibold"
                                        title="Copy Link"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                                    </button>

                                    {/* Share Popover */}
                                    <div
                                        className="relative group/share"
                                        onMouseEnter={() => setShowSocials(true)}
                                        onMouseLeave={() => setShowSocials(false)}
                                    >
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 border border-white/15"
                                            title="Share on Social Media"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <AnimatePresence>
                                            {showSocials && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    className="absolute bottom-full right-0 mb-2 flex items-center gap-2 p-2 bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/20 shadow-xl z-50 pointer-events-auto"
                                                >
                                                    {socialIcons.map((social, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={social.action}
                                                            className="p-2 rounded-lg bg-white/10 hover:bg-[#037166] text-white transition-all hover:scale-110 active:scale-95"
                                                            title={social.text}
                                                        >
                                                            <social.icon className="w-4 h-4" />
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Footer micro-note */}
                            <p className="text-[10px] text-white/70 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-[#04a99d] flex-shrink-0" />
                                <span>Reward of ₹{referAndEarnAmount} credited once your friend completes their first service booking.</span>
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Actions: 1. Go to Homepage  2. Go to My Bookings */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto w-full"
                >
                    <button
                        type="button"
                        onClick={handleGoHome}
                        className="w-full py-2.5 sm:py-3 px-4 bg-white border-2 border-[#037166] text-[#037166] hover:bg-[#037166]/5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        <span>Go to Homepage</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleGoMyBookings}
                        className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#025a51] hover:to-[#038e83] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-[#037166]/20 hover:scale-[1.01] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
                    >
                        <CalendarCheck className="w-4 h-4" />
                        <span>Go to My Bookings</span>
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
