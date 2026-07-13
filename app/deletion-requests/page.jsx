'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, CheckCircle, Loader2, ShieldAlert, Send, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';

const USER_TYPES = [
    { value: 'customer', label: 'Customer' },
    { value: 'service_provider', label: 'Service Provider' },
];

const inputCls =
    'w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] transition-all';
const labelCls = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

export default function DeletionRequestsPage() {
    const [formData, setFormData] = useState({
        name: '',
        userType: 'customer',
        email: '',
        mobileNumber: '',
        reason: '',
    });
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const otp = otpValues.join('');

    const handleOtpChange = (index, value) => {
        const val = value.replace(/[^0-9]/g, '');
        const next = [...otpValues];
        next[index] = val.slice(-1);
        setOtpValues(next);
        if (val && index < 5) {
            const el = document.getElementById(`del-otp-${index + 1}`);
            if (el) el.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const el = document.getElementById(`del-otp-${index - 1}`);
            if (el) el.focus();
        }
    };

    const triggerSendOtp = async (phone) => {
        if (!phone || phone.length !== 10) return;
        setSendingOtp(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/web/account-deletion/send-otp`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobileNumber: phone }),
                }
            );
            const data = await response.json();
            if (data.success) {
                setIsOtpSent(true);
                toast.success(data.details || data.message || 'OTP has been sent to your mobile number');
            } else {
                toast.error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleMobileChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        setFormData((prev) => ({ ...prev, mobileNumber: val }));
        if (val.length === 10 && !isOtpSent) {
            triggerSendOtp(val);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (formData.mobileNumber.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!isOtpSent) {
            toast.error('Please verify your mobile number first');
            return;
        }
        if (otp.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            return;
        }
        if (!formData.reason.trim()) {
            toast.error('Please provide a reason for deletion');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/web/account-deletion/verify-and-submit`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, otp }),
                }
            );
            const data = await response.json();
            if (data.success) {
                setSubmitted(true);
                toast.success('Your account deletion request has been submitted');
            } else {
                toast.error(data.message || 'Verification failed. Please check your OTP.');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Header />

            <main className="pt-28 pb-20 px-4 bg-gradient-to-b from-[#037166]/5 to-white">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#037166]/10 border border-[#037166]/20 mb-4 shadow-sm">
                            <Trash2 className="w-8 h-8 text-[#037166]" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
                            Account Deletion Request
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                            Request permanent deletion of your Doorstep Hub account and associated data.
                            We verify your identity via WhatsApp OTP before processing.
                        </p>
                        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-[#037166]/10 border border-[#037166]/20">
                            <Clock className="w-4 h-4 text-[#037166]" />
                            <span className="text-xs md:text-sm text-[#037166] font-semibold">
                                Requests are processed within 72 hours
                            </span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-[#037166]/20 rounded-2xl p-8 text-center shadow-sm"
                            >
                                <CheckCircle className="w-16 h-16 text-[#037166] mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">Request Submitted</h2>
                                <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                                    Your account deletion request has been received successfully. Our team will
                                    review and <span className="text-[#037166] font-semibold">process your request within 72 hours</span>.
                                    You may be contacted for confirmation before deletion.
                                </p>
                                <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-[#037166]/10 border border-[#037166]/20">
                                    <Clock className="w-4 h-4 text-[#037166]" />
                                    <span className="text-xs md:text-sm text-[#037166] font-semibold">
                                        Processing time: within 72 hours
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit}
                                className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm"
                            >
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Account deletion is permanent. Your profile, bookings and personal data
                                        will be removed and cannot be recovered.
                                    </p>
                                </div>

                                <div>
                                    <label className={labelCls}>Full Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className={inputCls}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Type of User *</label>
                                    <select
                                        className={`${inputCls} appearance-none cursor-pointer`}
                                        value={formData.userType}
                                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                        required
                                    >
                                        {USER_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Email (optional)</label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className={inputCls}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Mobile Number *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            placeholder="10-digit mobile number"
                                            className={`${inputCls} pl-12`}
                                            value={formData.mobileNumber}
                                            onChange={handleMobileChange}
                                            required
                                        />
                                    </div>
                                    {sendingOtp && (
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Sending OTP...
                                        </p>
                                    )}
                                    {isOtpSent && !sendingOtp && (
                                        <button
                                            type="button"
                                            onClick={() => triggerSendOtp(formData.mobileNumber)}
                                            className="text-xs text-[#037166] font-semibold mt-2 hover:underline"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>

                                {isOtpSent && (
                                    <div>
                                        <label className={labelCls}>Enter WhatsApp OTP *</label>
                                        <div className="flex gap-2">
                                            {otpValues.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`del-otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className="w-11 h-11 text-center text-lg font-bold rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] transition-all"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className={labelCls}>Reason for Deletion *</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us why you want to delete your account"
                                        className={`${inputCls} resize-none`}
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || sendingOtp}
                                    className="w-full py-4 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#04a99d] hover:to-[#037166] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#037166]/20 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-wider text-sm disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" /> Submit Deletion Request
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#037166]" />
                                    Once submitted, your request will be processed within 72 hours.
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}
