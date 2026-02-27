'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, CheckCircle2 } from 'lucide-react';

export function NewsletterWidget({ compact = false }) {
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
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/newsletter/subscribe', {
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
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/newsletter/verify-otp', {
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
            <div className="p-6 bg-[#1a1a1a] border border-white/10 rounded-2xl">
                <h3 className="text-xl font-bold mb-2">Subscribe to our Newsletter</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Get the latest tips and updates delivered directly to your inbox.
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
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white mb-4 focus:outline-none focus:border-[#037166] transition-colors placeholder:text-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || isSubscribed}
                        className="w-full px-4 py-3 bg-[#037166] hover:bg-[#025951] disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : step === 'subscribe' ? 'Subscribe' : 'Verify'}
                        {isSubscribed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    {step === 'verify' && !isSubscribed && (
                        <button
                            type="button"
                            onClick={() => setStep('subscribe')}
                            className="mt-2 text-xs text-white/40 hover:text-white transition-colors w-full text-center"
                        >
                            Change email address
                        </button>
                    )}
                    {message && (
                        <p className={`mt-3 text-sm text-center ${isError ? 'text-red-400' : 'text-[#04a99d]'}`}>
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
            className="mt-20 max-w-3xl mx-auto p-8 bg-gradient-to-r from-[#1a1a1a]/80 via-[#1a1a1a]/90 to-[#1a1a1a]/80 backdrop-blur-xl border-2 border-[#037166]/30 rounded-3xl"
        >
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
                <p className="text-gray-400">
                    Get the latest articles and exclusive insights delivered to your inbox
                </p>
            </div>

            <form onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Mail className="w-5 h-5 text-white/40" />
                        </div>
                        <input
                            type={step === 'subscribe' ? 'email' : 'text'}
                            value={step === 'subscribe' ? email : otp}
                            onChange={(e) => step === 'subscribe' ? setEmail(e.target.value) : setOtp(e.target.value)}
                            placeholder={step === 'subscribe' ? 'Enter your email' : 'Enter 6-digit OTP'}
                            required
                            disabled={loading || isSubscribed}
                            maxLength={step === 'subscribe' ? undefined : 6}
                            className="w-full pl-12 pr-6 py-4 bg-[#0a0a0a]/80 border border-[#037166]/30 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#037166] transition-colors"
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading || isSubscribed}
                        whileHover={{ scale: loading || isSubscribed ? 1 : 1.02 }}
                        whileTap={{ scale: loading || isSubscribed ? 1 : 0.98 }}
                        className="px-8 py-4 bg-gradient-to-r from-[#037166] to-[#025951] rounded-full text-white font-semibold shadow-lg shadow-[#037166]/40 hover:shadow-xl hover:shadow-[#037166]/50 transition-all whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : step === 'subscribe' ? 'Subscribe Now' : 'Verify OTP'}
                        {isSubscribed && <CheckCircle2 className="w-5 h-5" />}
                    </motion.button>
                </div>
                {step === 'verify' && !isSubscribed && (
                    <button
                        type="button"
                        onClick={() => setStep('subscribe')}
                        className="mt-3 text-xs text-white/40 hover:text-white transition-colors mx-auto block"
                    >
                        Change email address
                    </button>
                )}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 text-center"
                    >
                        <p className={`flex items-center justify-center gap-2 ${isError ? 'text-red-400' : 'text-[#04a99d]'}`}>
                            {!isError && <CheckCircle2 className="w-5 h-5" />}
                            {message}
                        </p>
                    </motion.div>
                )}
            </form>
        </motion.div>
    );
}
