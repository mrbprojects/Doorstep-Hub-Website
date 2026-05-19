'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, CheckCircle2 } from 'lucide-react';

export function NewsletterWidget({ compact = false, splitLayout = false }) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('subscribe'); // 'subscribe' or 'verify'
    const [loading, setLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setStep('verify');
                setMessage('Verification OTP sent to your email.');
            } else {
                setIsError(true);
                setMessage(data.message || 'Subscription failed. Please try again.');
            }
        } catch (error) {
            setIsError(true);
            setMessage('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubscribed(true);
                setMessage('Successfully subscribed! Welcome to our newsletter.');
                setTimeout(() => {
                    setStep('subscribe');
                    setEmail('');
                    setOtp('');
                    setIsSubscribed(false);
                    setMessage('');
                }, 3000);
            } else {
                setIsError(true);
                setMessage(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            setIsError(true);
            setMessage('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        // Compact version for sidebars
        return (
            <div className="p-8 bg-white rounded-3xl">
                <h3 className="text-xl font-extrabold mb-3 text-gray-900 leading-tight">Subscribe to our Newsletter</h3>
                <p className="text-gray-500 text-sm mb-8">
                    Get the latest repair tips and service updates delivered to your inbox.
                </p>
                <form onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify}>
                    <input
                        type={step === 'subscribe' ? 'email' : 'text'}
                        value={step === 'subscribe' ? email : otp}
                        onChange={(e) => step === 'subscribe' ? setEmail(e.target.value) : setOtp(e.target.value)}
                        placeholder={step === 'subscribe' ? 'Your email address' : 'Enter 6-digit OTP'}
                        required
                        disabled={loading || isSubscribed}
                        maxLength={step === 'subscribe' ? undefined : 6}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-[#037166]/20 focus:border-[#037166] transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={loading || isSubscribed}
                        className="w-full px-5 py-4 bg-gradient-to-r from-[#037166] to-[#04a99d] shadow-lg shadow-[#037166]/20 hover:shadow-[#037166]/40 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : step === 'subscribe' ? 'Subscribe' : 'Verify'}
                        {isSubscribed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                    {step === 'verify' && !isSubscribed && (
                        <button
                            type="button"
                            onClick={() => setStep('subscribe')}
                            className="mt-3 text-xs text-gray-400 hover:text-[#037166] transition-colors w-full text-center font-medium"
                        >
                            Change email address
                        </button>
                    )}
                    {message && (
                        <p className={`mt-4 text-sm text-center font-medium ${isError ? 'text-red-500' : 'text-[#037166]'}`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        );
    }

    // Full version for landing pages
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-20 mb-10 max-w-5xl mx-auto rounded-[40px] shadow-2xl shadow-[#9fbfb8]/30 overflow-hidden ${
                splitLayout ? 'bg-white border-2 border-[#bcd4ce] p-0 opacity-100' : 'p-10 bg-white border-2 border-[#bcd4ce]'
            }`}
        >
            <div className={`${splitLayout ? 'grid lg:grid-cols-2 items-stretch bg-white' : ''}`}>
            <div className={`mb-8 ${splitLayout ? 'mb-0 text-center bg-white px-10 py-12 flex flex-col items-center justify-center border-y-2 border-l-2 border-[#bcd4ce]' : 'text-center'}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#037166]/10 rounded-2xl mb-4">
                    <Mail className="w-8 h-8 text-[#037166]" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Stay Updated</h3>
                <p className={`text-gray-500 max-w-lg ${splitLayout ? '' : 'mx-auto'}`}>
                  Get Latest Service Coupons, Exclusive Discounts, and Helpful Updates Delivered Straight To Your Inbox.
                </p>
            </div>

            <form
                onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify}
                className={`${splitLayout ? 'bg-white px-10 py-12 border-y-2 border-r-2 border-[#bcd4ce] flex items-center opacity-100' : ''}`}
            >
                <div className={`${splitLayout ? 'flex w-full flex-col gap-5' : 'flex flex-col sm:flex-row gap-4'}`}>
                    <div className="flex-1 relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                            <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type={step === 'subscribe' ? 'email' : 'text'}
                            value={step === 'subscribe' ? email : otp}
                            onChange={(e) => step === 'subscribe' ? setEmail(e.target.value) : setOtp(e.target.value)}
                            placeholder={step === 'subscribe' ? 'Enter your email' : 'Enter 6-digit OTP'}
                            required
                            disabled={loading || isSubscribed}
                            maxLength={step === 'subscribe' ? undefined : 6}
                            className={`w-full pl-14 pr-6 ${splitLayout ? 'py-5 text-xl rounded-3xl' : 'py-4.5 rounded-2xl'} bg-white border border-[#c9d9d4] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#037166]/20 focus:border-[#037166] transition-all`}
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading || isSubscribed}
                        whileHover={{ scale: loading || isSubscribed ? 1 : 1.02 }}
                        whileTap={{ scale: loading || isSubscribed ? 1 : 0.98 }}
                        className={`${splitLayout ? 'w-full py-5 text-2xl rounded-3xl' : 'py-4.5 rounded-2xl'} px-10 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold shadow-xl shadow-[#037166]/30 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-3`}
                    >
                        {loading ? 'Processing...' : step === 'subscribe' ? 'Subscribe Now' : 'Verify OTP'}
                        {isSubscribed && <CheckCircle2 className="w-5 h-5" />}
                    </motion.button>
                </div>
                {step === 'verify' && !isSubscribed && (
                    <button
                        type="button"
                        onClick={() => setStep('subscribe')}
                        className="mt-4 text-xs text-gray-400 hover:text-[#037166] transition-colors mx-auto block font-medium"
                    >
                        Change email address
                    </button>
                )}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 text-center"
                    >
                        <p className={`flex items-center justify-center gap-2 font-bold ${isError ? 'text-red-500' : 'text-[#037166]'}`}>
                            {!isError && <CheckCircle2 className="w-5 h-5" />}
                            {message}
                        </p>
                    </motion.div>
                )}
            </form>
            </div>
        </motion.div>
    );
}

