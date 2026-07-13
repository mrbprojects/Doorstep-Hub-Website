'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, CheckCircle, Loader2, ShieldAlert, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { sendAccountDeletionOtp, submitAccountDeletionRequest } from '@/lib/accountApi';

const inputCls =
    'w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] transition-all';
const labelCls = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

export default function AccountDeletionPage() {
    const { user } = useAuth();
    const lastOtpMobile = useRef('');
    const [formData, setFormData] = useState({
        name: '',
        userType: 'customer',
        email: '',
        mobileNumber: '',
        reason: '',
    });
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showVerifyWarning, setShowVerifyWarning] = useState(false);

    const otp = otpValues.join('');

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                mobileNumber: (user.phone || user.mobile || '').replace(/\D/g, '').slice(-10),
            }));
        }
    }, [user]);

    const triggerSendOtp = async (phone) => {
        if (!phone || phone.length !== 10) return;
        setSendingOtp(true);
        setShowVerifyWarning(false);
        try {
            const data = await sendAccountDeletionOtp(phone);
            if (data.success) {
                setIsOtpSent(true);
                setIsOtpVerified(false);
                setOtpValues(['', '', '', '', '', '']);
                lastOtpMobile.current = phone;
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

    // Auto-send OTP when mobile is pre-filled from logged-in profile
    useEffect(() => {
        const phone = formData.mobileNumber;
        if (phone.length === 10 && lastOtpMobile.current !== phone && !sendingOtp) {
            triggerSendOtp(phone);
        }
    }, [formData.mobileNumber]);

    const handleOtpChange = (index, value) => {
        const val = value.replace(/[^0-9]/g, '');
        const next = [...otpValues];
        next[index] = val.slice(-1);
        setOtpValues(next);
        if (val && index < 5) {
            document.getElementById(`acc-del-otp-${index + 1}`)?.focus();
        }
        if (next.join('').length === 6) {
            setIsOtpVerified(true);
            setShowVerifyWarning(false);
        } else {
            setIsOtpVerified(false);
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            document.getElementById(`acc-del-otp-${index - 1}`)?.focus();
        }
    };

    const handleMobileChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        if (val !== formData.mobileNumber) {
            setIsOtpSent(false);
            setIsOtpVerified(false);
            setOtpValues(['', '', '', '', '', '']);
            if (lastOtpMobile.current !== val) {
                lastOtpMobile.current = '';
            }
        }
        setFormData((prev) => ({ ...prev, mobileNumber: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) return toast.error('Please enter your name');
        if (formData.mobileNumber.length !== 10) return toast.error('Please enter a valid 10-digit mobile number');
        if (!isOtpSent || !isOtpVerified || otp.length !== 6) {
            setShowVerifyWarning(true);
            toast.error('Please verify your mobile number first');
            document.getElementById('deletion-otp-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!formData.reason.trim()) return toast.error('Please provide a reason for deletion');

        setSubmitting(true);
        try {
            const data = await submitAccountDeletionRequest({ ...formData, otp });
            if (data.success) {
                setSubmitted(true);
                toast.success('Your account deletion request has been submitted');
            } else {
                toast.error(data.message || 'Verification failed. Please check your OTP.');
                setIsOtpVerified(false);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const showOtpSection = formData.mobileNumber.length === 10;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Account Deletion Request</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Submit a request to permanently delete your account. Requests are stored and reviewed by our admin team.
                </p>
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
                            Your account deletion request has been received and stored for admin review.
                            Our team will process your request within 72 hours.
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
                                Account deletion is permanent. Your profile, bookings, and personal data will be removed and cannot be recovered.
                            </p>
                        </div>

                        <div>
                            <label className={labelCls}>Full Name *</label>
                            <input type="text" className={inputCls} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>

                        <div>
                            <label className={labelCls}>Email (optional)</label>
                            <input type="email" className={inputCls} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div>
                            <label className={labelCls}>Mobile Number *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
                                <input type="tel" className={`${inputCls} pl-12`} value={formData.mobileNumber} onChange={handleMobileChange} required />
                            </div>
                            {sendingOtp && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Sending OTP to WhatsApp...
                                </p>
                            )}
                            {isOtpSent && !sendingOtp && (
                                <p className="text-xs text-[#037166] font-medium mt-2 flex items-center gap-1.5">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    OTP sent to WhatsApp. Enter it below to verify.
                                </p>
                            )}
                            {showOtpSection && !isOtpSent && !sendingOtp && (
                                <button
                                    type="button"
                                    onClick={() => triggerSendOtp(formData.mobileNumber)}
                                    className="text-xs text-[#037166] font-semibold mt-2 hover:underline"
                                >
                                    Send OTP to verify number
                                </button>
                            )}
                        </div>

                        {showOtpSection && (
                            <div id="deletion-otp-section" className={`rounded-xl border p-4 space-y-3 transition-colors ${
                                showVerifyWarning && !isOtpVerified
                                    ? 'border-amber-300 bg-amber-50'
                                    : isOtpVerified
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}>
                                <label className={labelCls}>Enter WhatsApp OTP *</label>
                                <div className="flex gap-2 flex-wrap">
                                    {otpValues.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`acc-del-otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-11 h-11 text-center text-lg font-bold rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#037166]/40"
                                        />
                                    ))}
                                </div>
                                {showVerifyWarning && !isOtpVerified && (
                                    <p className="text-sm text-amber-700 font-medium">
                                        Please verify your mobile number first
                                    </p>
                                )}
                                {isOtpVerified && (
                                    <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4" /> Mobile number verified
                                    </p>
                                )}
                                {isOtpSent && (
                                    <button
                                        type="button"
                                        onClick={() => triggerSendOtp(formData.mobileNumber)}
                                        disabled={sendingOtp}
                                        className="text-xs text-[#037166] font-semibold hover:underline disabled:opacity-50"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        )}

                        <div>
                            <label className={labelCls}>Reason for Deletion *</label>
                            <textarea rows={4} className={`${inputCls} resize-none`} placeholder="Tell us why you want to delete your account" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || sendingOtp}
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Submit Deletion Request
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
