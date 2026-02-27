'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Home, Smartphone, Download, Calendar, Clock, MapPin, Sparkles, Gift, Copy, Share2, Check, Facebook, Twitter, Linkedin } from 'lucide-react';
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
                const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/get_global_settings');
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
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a] flex items-center justify-center px-4 py-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full blur-2xl opacity-50 animate-pulse" />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center">
                            <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </motion.div>

                {/* Thank You Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-[#04a99d]" />
                        Thank You!
                    </h1>
                    <p className="text-xl text-white/80 mb-2">Your Booking Has Been Received</p>
                    {bookingDetails?.orderId && (
                        <div className="inline-flex flex-col items-center gap-2 mb-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#04a99d] font-mono text-sm">
                                Booking ID: {bookingDetails.orderId}
                            </div>
                            <p className="text-[11px] text-[#04a99d]/60 font-medium animate-pulse">
                                Payment verification in progress. This usually takes 2-5 minutes.
                            </p>
                        </div>
                    )}
                    <p className="text-white/60">We've sent a Confirmation to your Registered Email </p>
                </motion.div>


                {/* Booking Details Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">
                    {bookingDetails && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 rounded-2xl p-8 flex flex-col h-full"
                        >
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#04a99d]" />
                                Booking Details
                            </h4>

                            <div className="space-y-4 flex-1">
                                {(bookingDetails.date || bookingDetails.time) && (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {bookingDetails.date && (
                                            <div className="flex-1 flex items-center gap-3 text-white/80 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-[#037166]/20 flex items-center justify-center text-[#04a99d] flex-shrink-0">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-white/40 text-[9px] uppercase font-bold tracking-wider">Date</p>
                                                    <p className="font-medium text-xs">{bookingDetails.date}</p>
                                                </div>
                                            </div>
                                        )}
                                        {bookingDetails.time && (
                                            <div className="flex-1 flex items-center gap-3 text-white/80 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-[#037166]/20 flex items-center justify-center text-[#04a99d] flex-shrink-0">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-white/40 text-[9px] uppercase font-bold tracking-wider">Time Slot</p>
                                                    <p className="font-medium text-xs">{bookingDetails.time}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {bookingDetails.address && (
                                    <div className="flex items-start gap-4 text-white/80 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="w-10 h-10 rounded-lg bg-[#037166]/20 flex items-center justify-center text-[#04a99d] flex-shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Address</p>
                                            <p className="font-medium text-xs leading-relaxed">{bookingDetails.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center h-full justify-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center shadow-lg shadow-[#037166]/20 mb-6 font-bold">
                            <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        <h5 className="text-2xl font-bold text-white mb-3">Doorstep Hub App</h5>
                        <p className="text-white/60 text-sm mb-8 max-w-[280px] leading-relaxed">
                            Track your service, manage bookings, and get app-exclusive offers in real-time.
                            <span className="block mt-2 text-[#04a99d]/80 font-medium italic">
                                *If payment status is pending, it will update here within minutes.
                            </span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <a
                                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-[110px] h-8 relative rounded-full overflow-hidden bg-gradient-to-br from-[#037166] to-[#04a99d] border border-white/10"
                                >
                                    <Image
                                        src="/apple2.png"
                                        alt="App Store"

                                        fill
                                        className="object-cover"
                                    />
                                </motion.button>
                            </a>

                            <a
                                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-[110px] h-8 relative rounded-full overflow-hidden bg-gradient-to-br from-[#037166] to-[#04a99d] border border-white/10"
                                >
                                    <Image
                                        src="/android1.png"
                                        alt="Google Play"
                                        fill
                                        className="object-cover"
                                    />
                                </motion.button>
                            </a>
                        </div>
                    </motion.div>
                </div>


                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative rounded-2xl overflow-hidden mb-8 group"
                >
                    {/* Premium gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#037166] via-[#025f56] to-[#013f39]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(4,169,157,0.3),transparent_60%)]" />
                    <div className="absolute top-0 right-0 p-6 opacity-[0.07] pointer-events-none">
                        <Gift className="w-40 h-40 text-white -rotate-12" />
                    </div>

                    <div className="relative z-10 p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <Gift className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Refer & Earn</h4>
                                    <p className="text-white/60 text-xs">Share your link. Earn real rewards.</p>
                                </div>
                            </div>
                            {/* Welcome Bonus Pill */}
                            <div className="flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/30 px-3 py-1.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-yellow-300" />
                                <span className="text-yellow-300 text-[11px] font-bold">₹{registrationBonus} Welcome Bonus</span>
                            </div>
                        </div>

                        {/* Dual Reward Tiles */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">You Earn</p>
                                <p className="text-3xl font-extrabold text-white">₹{referAndEarnAmount}</p>
                                <p className="text-white/60 text-[11px] mt-1">per referral, after 1st booking</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Friend Gets</p>
                                <p className="text-3xl font-extrabold text-yellow-300">₹{registrationBonus}</p>
                                <p className="text-white/60 text-[11px] mt-1">on first registration</p>
                            </div>
                        </div>

                        {/* Invite Link Row */}
                        <div className="bg-black/30 backdrop-blur-md rounded-xl p-3.5 border border-white/10 flex items-center justify-between gap-3 mb-4">
                            <div className="flex-1 overflow-hidden">
                                <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5 font-bold">Your Invite Link</p>
                                <p className="text-white text-xs font-medium truncate">{inviteLink}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={handleCopyLink}
                                    className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/10"
                                    title="Copy Link"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <div className="h-8 w-px bg-white/10" />
                                <div
                                    className="relative group/share"
                                    onMouseEnter={() => setShowSocials(true)}
                                    onMouseLeave={() => setShowSocials(false)}
                                >
                                    <button
                                        className="p-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 border border-white/10"
                                        title="Share"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <AnimatePresence>
                                        {showSocials && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col items-center gap-3 z-50 pointer-events-auto"
                                            >
                                                {socialIcons.map((social, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        className="relative group/social"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: (socialIcons.length - 1 - idx) * 0.05 }}
                                                    >
                                                        <button
                                                            onClick={social.action}
                                                            className="p-3 rounded-full bg-white/10 hover:bg-[#037166] text-white shadow-xl hover:scale-110 active:scale-90 transition-all border border-white/20 outline-none"
                                                        >
                                                            <social.icon className="w-5 h-5" />
                                                        </button>
                                                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded shadow-xl opacity-0 translate-x-2 pointer-events-none group-hover/social:opacity-100 group-hover/social:translate-x-0 transition-all duration-200 whitespace-nowrap z-[100]">
                                                            {social.text}
                                                            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-white" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                <div className="w-3 h-3 bg-[#037166] rotate-45 -mt-1.5 border-r border-b border-white/10 shadow-lg" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Footer note */}
                        <div className="flex items-center gap-2 text-[10px] text-white/40">
                            <Sparkles className="w-3 h-3 text-[#04a99d] flex-shrink-0" />
                            <span>Your reward of ₹{referAndEarnAmount} is credited after your friend completes their first booking successfully.</span>
                        </div>
                    </div>
                </motion.div>

                {/* Home Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleGoHome}
                        className="w-full py-4 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#037166]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Go to Homepage
                    </button>
                </motion.div>

                {/* App Download Promo */}

            </motion.div>
        </div>
    );
}
