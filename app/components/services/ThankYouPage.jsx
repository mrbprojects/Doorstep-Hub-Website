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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
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
                        <div className="absolute inset-0 bg-[#04a99d]/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
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
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                        Booking Confirmed!
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">Your service request has been received</p>
                    {bookingDetails?.orderId && (
                        <div className="inline-flex flex-col items-center gap-2 mb-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-[#037166] font-mono text-sm shadow-sm">
                                Booking ID: {bookingDetails.orderId}
                            </div>
                            <p className="text-[11px] text-[#037166]/60 font-medium">
                                We are assigning a professional to your request.
                            </p>
                        </div>
                    )}
                </motion.div>


                {/* Booking Details Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">
                    {bookingDetails && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col h-full shadow-sm"
                        >
                            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#04a99d]" />
                                Booking Details
                            </h4>

                            <div className="space-y-4 flex-1">
                                {(bookingDetails.date || bookingDetails.time) && (
                                    <div className="flex flex-col gap-3">
                                        {bookingDetails.date && (
                                            <div className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Date</p>
                                                    <p className="font-bold text-sm">{bookingDetails.date}</p>
                                                </div>
                                            </div>
                                        )}
                                        {bookingDetails.time && (
                                            <div className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Time Slot</p>
                                                    <p className="font-bold text-sm">{bookingDetails.time}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {bookingDetails.address && (
                                    <div className="flex items-start gap-4 text-gray-700 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Address</p>
                                            <p className="font-medium text-xs leading-relaxed line-clamp-2">{bookingDetails.address}</p>
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
                        className="bg-gradient-to-br from-[#037166] to-[#04a99d] rounded-3xl p-8 flex flex-col items-center text-center h-full justify-center shadow-lg text-white"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mb-6 font-bold">
                            <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        <h5 className="text-2xl font-bold mb-3">Download App</h5>
                        <p className="text-white/80 text-sm mb-8 max-w-[280px] leading-relaxed">
                            Track your professional in real-time and get exclusive offers on the app.
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <a
                                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-12 relative rounded-xl overflow-hidden bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <Image
                                    src="/apple2.png"
                                    alt="App Store"
                                    fill
                                    className="object-cover"
                                />
                            </a>

                            <a
                                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-12 relative rounded-xl overflow-hidden bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <Image
                                    src="/android1.png"
                                    alt="Google Play"
                                    fill
                                    className="object-cover"
                                />
                            </a>
                        </div>
                    </motion.div>
                </div>


                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative rounded-3xl overflow-hidden mb-8 group bg-white border border-gray-200 shadow-sm"
                >
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-[#037166]/10 flex items-center justify-center border border-[#037166]/20">
                                    <Gift className="w-5 h-5 text-[#037166]" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Refer & Earn</h4>
                                    <p className="text-gray-500 text-xs">Earn rewards on every successful booking.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-yellow-600" />
                                <span className="text-yellow-700 text-[11px] font-bold">₹{registrationBonus} Bonus</span>
                            </div>
                        </div>

                        {/* Dual Reward Tiles */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">You Earn</p>
                                <p className="text-3xl font-extrabold text-gray-900">₹{referAndEarnAmount}</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">Friend Gets</p>
                                <p className="text-3xl font-extrabold text-[#037166]">₹{registrationBonus}</p>
                            </div>
                        </div>

                        {/* Invite Link Row */}
                        <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 flex items-center justify-between gap-3 mb-4">
                            <div className="flex-1 overflow-hidden">
                                <p className="text-gray-400 text-[9px] uppercase tracking-widest mb-0.5 font-bold">Invite Link</p>
                                <p className="text-gray-900 text-xs font-medium truncate">{inviteLink}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={handleCopyLink}
                                    className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-[#037166] hover:border-[#037166] transition-all"
                                    title="Copy Link"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={handleShareWhatsApp}
                                    className="p-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
                                    title="WhatsApp"
                                >
                                    <WhatsAppIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Footer note */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <Sparkles className="w-3 h-3 text-[#04a99d] flex-shrink-0" />
                            <span>Rewards are credited after your friend's first successful service.</span>
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
                        className="w-full py-4 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-[#037166]/20 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Go to Homepage
                    </button>
                </motion.div>

            </motion.div>
        </div>
    );
}

