'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Bell } from 'lucide-react';

export function NewsletterWidget({ compact = false }) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('subscribe'); // 'subscribe' | 'verify'
    const [loading, setLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [message, setMessage] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success' | 'error' | 'info'

    const validateEmail = (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).toLowerCase());
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const trimmed = email.trim();

        if (!trimmed) {
            setStatusType('error');
            setMessage('Enter your email address.');
            return;
        }

        if (!validateEmail(trimmed)) {
            setStatusType('error');
            setMessage('Enter a valid email address.');
            return;
        }

        setLoading(true);
        setMessage('');
        setStatusType('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmed }),
            });

            const data = await response.json();

            if (data.success) {
                setStep('verify');
                setStatusType('info');
                setMessage('Verification code sent to your email. Please enter the 6-digit OTP below.');
            } else {
                const msg = data.message || '';
                if (msg.toLowerCase().includes('already subscribed')) {
                    setStatusType('info');
                    setMessage('This email is already subscribed to Doorstep Hub updates.');
                } else {
                    setStatusType('error');
                    setMessage(msg || "We couldn't complete your subscription right now. Please try again.");
                }
            }
        } catch {
            setStatusType('error');
            setMessage("We couldn't complete your subscription right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const trimmedOtp = otp.trim();

        if (!trimmedOtp || trimmedOtp.length < 4) {
            setStatusType('error');
            setMessage('Enter the verification OTP sent to your email.');
            return;
        }

        setLoading(true);
        setMessage('');
        setStatusType('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp: trimmedOtp }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubscribed(true);
                setStatusType('success');
                setMessage("You're subscribed! We'll send useful Doorstep Hub updates to this email.");
                setTimeout(() => {
                    setStep('subscribe');
                    setEmail('');
                    setOtp('');
                    setIsSubscribed(false);
                    setMessage('');
                    setStatusType('');
                }, 4000);
            } else {
                setStatusType('error');
                setMessage(data.message || 'Invalid or expired OTP. Please try again.');
            }
        } catch {
            setStatusType('error');
            setMessage("We couldn't verify your OTP right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        // Compact version for sidebars
        return (
            <div className="p-6 sm:p-7 bg-[#F0FAF8] border border-[#BCE3DE] rounded-3xl">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#BCE3DE] flex items-center justify-center text-[#008C80] mb-3 shadow-xs">
                    <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black mb-1.5 text-[#101828]">Stay Updated</h3>
                <p className="text-[#475467] text-xs leading-relaxed mb-5">
                    Get latest service tips, important help-center updates, and useful offers delivered to your inbox.
                </p>

                <form onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify} className="space-y-3">
                    {step === 'subscribe' ? (
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                disabled={loading || isSubscribed}
                                className="w-full px-4 py-3 bg-white border border-[#D0D5DD] rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008C80]/20 focus:border-[#008C80]"
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                disabled={loading || isSubscribed}
                                className="w-full px-4 py-3 bg-white border border-[#D0D5DD] rounded-xl text-center text-sm font-bold tracking-widest text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008C80]/20 focus:border-[#008C80]"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isSubscribed}
                        className="w-full py-3 px-5 bg-[#008C80] hover:bg-[#006D65] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#008C80]/20 flex items-center justify-center gap-2"
                    >
                        <span>{loading ? 'Subscribing...' : step === 'subscribe' ? 'Subscribe Now' : 'Verify OTP'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {step === 'verify' && !isSubscribed && (
                        <button
                            type="button"
                            onClick={() => { setStep('subscribe'); setMessage(''); }}
                            className="text-[11px] text-gray-500 hover:text-[#008C80] block mx-auto font-medium"
                        >
                            Change email address
                        </button>
                    )}

                    {message && (
                        <div className={`text-xs p-2.5 rounded-lg font-medium text-center ${
                            statusType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            statusType === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        );
    }

    // Full redesign version matching the reference image
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-6xl mx-auto rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-r from-[#F0FAF8] via-white to-[#E8F7F4] border border-[#BCE3DE] shadow-[0_8px_30px_-4px_rgba(0,140,128,0.08)]"
        >
            {/* Ambient Background Gradient Circles */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-[#008C80]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#008C80]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left Decorative Vector Illustration (Open Envelope with Notification Bell) */}
            <div className="hidden lg:block absolute left-6 bottom-4 xl:bottom-6 w-48 xl:w-56 pointer-events-none select-none">
                <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm">
                    {/* Mint Background Leaves */}
                    <path d="M40 160C30 130 50 100 80 90C70 120 60 145 40 160Z" fill="#CDEAE5" opacity="0.8"/>
                    <path d="M25 145C15 125 30 105 50 100C45 120 38 135 25 145Z" fill="#B2DFD8" opacity="0.6"/>
                    <path d="M60 170C55 145 75 125 100 120C90 145 80 160 60 170Z" fill="#DDF2EE" opacity="0.8"/>
                    
                    {/* Letter inside */}
                    <rect x="75" y="55" width="90" height="75" rx="8" fill="#F8FAFC" stroke="#BCE3DE" strokeWidth="2"/>
                    <line x1="88" y1="72" x2="135" y2="72" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="88" y1="84" x2="152" y2="84" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="88" y1="94" x2="140" y2="94" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round"/>
                    
                    {/* Envelope Body */}
                    <path d="M55 90L120 135L185 90V160C185 166.627 179.627 172 173 172H67C60.3726 172 55 166.627 55 160V90Z" fill="white" stroke="#BCE3DE" strokeWidth="2"/>
                    {/* Flap fold lines */}
                    <path d="M55 90L120 135L185 90" stroke="#008C80" strokeWidth="1.5" strokeOpacity="0.25"/>
                    <path d="M55 170L102 122" stroke="#BCE3DE" strokeWidth="1.5"/>
                    <path d="M185 170L138 122" stroke="#BCE3DE" strokeWidth="1.5"/>
                    
                    {/* Notification Bell Badge */}
                    <circle cx="158" cy="138" r="18" fill="#006D65"/>
                    <path d="M158 129C154.686 129 152 131.686 152 135V140L150 142V143H166V142L164 140V135C164 131.686 161.314 129 158 129Z" fill="white"/>
                    <path d="M156.5 144.5C156.5 145.328 157.172 146 158 146C158.828 146 159.5 145.328 159.5 144.5H156.5Z" fill="white"/>
                </svg>
            </div>

            {/* Right Decorative Vector Illustration (Paper Plane with dashed trail & leaves) */}
            <div className="hidden lg:block absolute right-6 top-8 xl:top-10 w-52 xl:w-60 pointer-events-none select-none">
                <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                    {/* Dashed trail */}
                    <path d="M20 130C60 145 110 135 130 95C145 65 170 60 195 55" stroke="#008C80" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" opacity="0.6"/>
                    
                    {/* Paper Airplane */}
                    <g transform="translate(180, 30) rotate(-10)">
                        <path d="M0 25L45 0L28 38L18 27L0 25Z" fill="#008C80"/>
                        <path d="M45 0L18 27L28 38L45 0Z" fill="#006D65"/>
                        <path d="M24 29L16 35V27L24 29Z" fill="#004D47"/>
                    </g>
                    
                    {/* Mint Leaves in bottom corner */}
                    <path d="M200 170C215 150 205 125 185 115C190 138 195 155 200 170Z" fill="#CDEAE5" opacity="0.9"/>
                    <path d="M215 160C225 145 220 125 205 120C210 135 212 150 215 160Z" fill="#B2DFD8" opacity="0.7"/>
                </svg>
            </div>

            {/* Center Content */}
            <div className="relative z-10 max-w-2xl mx-auto text-center">
                {/* Top Mail Icon */}
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-[#BCE3DE] shadow-xs text-[#008C80] mb-3 sm:mb-4">
                    <Mail className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Heading */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101828] mb-2 tracking-tight">
                    Stay Updated
                </h3>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-[#475467] leading-relaxed max-w-xl mx-auto mb-6 sm:mb-8">
                    Get latest service tips, important help-center updates, and useful offers delivered to your inbox.
                </p>

                {/* Form */}
                <form
                    onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify}
                    className="max-w-xl mx-auto"
                >
                    {step === 'subscribe' ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2 bg-white p-2 sm:p-2 sm:pl-4 rounded-2xl sm:rounded-full border border-[#D0D5DD] focus-within:border-[#008C80] focus-within:ring-2 focus-within:ring-[#008C80]/20 shadow-sm transition-all">
                            <div className="flex items-center gap-3 px-2 sm:px-0 flex-1 py-1.5 sm:py-0">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    disabled={loading || isSubscribed}
                                    className="w-full text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || isSubscribed}
                                className="btn-newsletter-subscribe px-6 sm:px-8 py-3 rounded-xl sm:rounded-full bg-[#008C80] hover:bg-[#006D65] disabled:opacity-50 !text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 inline-flex items-center justify-center gap-2 group w-full sm:w-auto"
                                style={{ color: '#ffffff' }}
                            >
                                <span className="!text-white font-bold" style={{ color: '#ffffff' }}>{loading ? 'Subscribing...' : 'Subscribe Now'}</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 !text-white" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 sm:p-2 sm:pl-4 rounded-2xl sm:rounded-full border border-[#D0D5DD] shadow-sm">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP code"
                                    maxLength={6}
                                    disabled={loading || isSubscribed}
                                    className="w-full text-center text-sm font-bold tracking-widest text-gray-900 placeholder:text-gray-400 bg-transparent outline-none py-2"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || isSubscribed}
                                    className="btn-newsletter-subscribe w-full sm:w-auto px-8 py-3 rounded-xl sm:rounded-full bg-[#008C80] hover:bg-[#006D65] disabled:opacity-50 !text-white text-xs sm:text-sm font-bold transition-all shrink-0 inline-flex items-center justify-center gap-2"
                                    style={{ color: '#ffffff' }}
                                >
                                    <span className="!text-white font-bold" style={{ color: '#ffffff' }}>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                                    <CheckCircle2 className="w-4 h-4 !text-white" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setStep('subscribe'); setMessage(''); }}
                                className="text-xs text-[#008C80] hover:underline font-semibold"
                            >
                                Change email address
                            </button>
                        </div>
                    )}

                    {/* Feedback message banner */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-4 p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 ${
                                    statusType === 'success'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : statusType === 'error'
                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                                }`}
                            >
                                {statusType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                {statusType === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                                {statusType === 'info' && <Bell className="w-4 h-4 text-[#008C80] shrink-0" />}
                                <span>{message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </motion.div>
    );
}
