'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Loader2, Save, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const inputCls =
    'w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-[#123F4A] text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] transition-all';
const labelCls = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

export default function ProfilePage() {
    const { user, updateProfile, token } = useAuth();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    // Email OTP states
    const [emailVerified, setEmailVerified] = useState(true);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const initialEmail = (user?.email || '').trim().toLowerCase();
    const isEmailChanged = Boolean(
        initialEmail &&
        formData.email.trim().toLowerCase() !== initialEmail
    );

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: user.phone || user.mobile || '',
            });
            setEmailVerified(true);
            setOtpSent(false);
            setEmailOtp('');
            if (user.image) {
                setPreviewImage(
                    user.image.startsWith('http')
                        ? user.image
                        : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${user.image}`
                );
            }
        }
    }, [user]);

    const handleEmailChange = (newEmail) => {
        setFormData((prev) => ({ ...prev, email: newEmail }));
        const normalized = newEmail.trim().toLowerCase();
        if (normalized === initialEmail) {
            setEmailVerified(true);
            setOtpSent(false);
            setEmailOtp('');
        } else {
            setEmailVerified(false);
            setOtpSent(false);
            setEmailOtp('');
        }
    };

    const handleSendOtp = async () => {
        const trimmedEmail = formData.email.trim().toLowerCase();
        if (!trimmedEmail) {
            toast.error('Please enter an email address');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }
        if (!token) {
            toast.error('Please log in to verify your email');
            return;
        }

        setSendingOtp(true);
        try {
            const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
            const res = await fetch(`${apiBase}/app/user/profile/email-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: trimmedEmail }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to send verification code');
            }
            setOtpSent(true);
            toast.success(data.message || 'Verification code sent to your email');
        } catch (err) {
            toast.error(err.message || 'Failed to send verification code');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        const trimmedEmail = formData.email.trim().toLowerCase();
        const trimmedOtp = emailOtp.trim();
        if (!/^\d{6}$/.test(trimmedOtp)) {
            toast.error('Enter the six-digit verification code');
            return;
        }
        if (!token) {
            toast.error('Please log in to verify your email');
            return;
        }

        setVerifyingOtp(true);
        try {
            const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
            const res = await fetch(`${apiBase}/app/user/profile/verify-email-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: trimmedEmail, otp: trimmedOtp }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Invalid verification code');
            }
            setEmailVerified(true);
            setOtpSent(false);
            setEmailOtp('');
            toast.success(data.message || 'Email verified successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to verify email');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('Please enter your email');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            toast.error('Please enter a valid email address');
            return;
        }
        if (isEmailChanged && !emailVerified) {
            toast.error('Verify your new email address before saving');
            return;
        }

        setLoading(true);
        try {
            const payload = new FormData();
            payload.append('name', formData.name.trim());
            payload.append('email', formData.email.trim());
            payload.append('phone', formData.phone.trim());
            if (selectedFile) payload.append('image', selectedFile);

            await updateProfile(payload);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
            >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#037166] text-white flex items-center justify-center shadow-lg hover:bg-[#025951] transition-all"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="font-bold text-lg text-gray-900">{formData.name || 'Your Name'}</p>
                        <p className="text-sm text-gray-500">{formData.phone || 'Phone number'}</p>
                        {user?.userUniqueId && (
                            <p className="text-xs text-[#037166] font-mono mt-1">ID: {user.userUniqueId}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelCls}>Full Name *</label>
                        <input
                            type="text"
                            className={inputCls}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelCls}>Email *</label>
                            {isEmailChanged ? (
                                emailVerified ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                        <AlertCircle className="w-3.5 h-3.5" /> Not Verified
                                    </span>
                                )
                            ) : initialEmail ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                </span>
                            ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                className={inputCls}
                                value={formData.email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                required
                            />
                            {isEmailChanged && !emailVerified && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || !formData.email.trim()}
                                    className="shrink-0 px-4 py-3.5 bg-[#037166]/10 text-[#037166] hover:bg-[#037166]/20 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                                >
                                    {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? 'Resend' : 'Verify'}
                                </button>
                            )}
                        </div>

                        {otpSent && !emailVerified && (
                            <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                                <p className="text-xs font-medium text-emerald-800">
                                    Enter the six-digit code sent to <span className="font-bold">{formData.email.trim()}</span>:
                                </p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-36 px-3 py-2 text-center text-sm font-bold tracking-[0.25em] bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#037166]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={verifyingOtp || emailOtp.length !== 6}
                                        className="px-4 py-2 bg-[#037166] text-white text-xs font-bold rounded-lg hover:bg-[#025951] transition-all disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {verifyingOtp && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className={labelCls}>Mobile Number</label>
                        <input
                            type="tel"
                            className={`${inputCls} bg-gray-100 cursor-not-allowed`}
                            value={formData.phone}
                            readOnly
                        />
                        <p className="text-xs text-gray-400 mt-1">Mobile number cannot be changed here</p>
                    </div>
                    {(user?.referalCode || user?.referralCode) && (
                        <div>
                            <label className={labelCls}>Your Referral Code</label>
                            <input
                                type="text"
                                className={`${inputCls} bg-gray-100 cursor-not-allowed font-mono uppercase`}
                                value={user.referalCode || user.referralCode}
                                readOnly
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || (isEmailChanged && !emailVerified)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold rounded-xl shadow-lg shadow-[#037166]/20 hover:opacity-95 transition-all disabled:opacity-60"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </motion.form>
        </div>
    );
}
