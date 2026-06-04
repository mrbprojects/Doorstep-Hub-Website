'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, ShieldCheck, Mail, User, LogOut, Camera, Chrome, Pencil, ChevronRight, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function AuthModal({ isOpen, onClose, theme = {} }) {
    const { user, loginWithWhatsApp, verifyOtp, loginWithGoogle, loginWithApple, updateProfile, logout, isAuthenticated } = useAuth();
    const [step, setStep] = useState('login'); // login, otp, profile
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [profileSavedForBooking, setProfileSavedForBooking] = useState(false);
    const [showRequiredErrors, setShowRequiredErrors] = useState(false);

    // Auto-fill referral code from URL ?ref= param
    React.useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref) setReferralCode(ref);
        } catch (e) { }
    }, []);
    const fileInputRef = React.useRef(null);
    const profileToastShown = React.useRef(false);

    const resetModalState = React.useCallback(() => {
        setStep('login');
        setMobile('');
        setOtp('');
        setLoading(false);
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewImage(null);
        setResendTimer(0);
        setProfileSavedForBooking(false);
        setShowRequiredErrors(false);
        profileToastShown.current = false;
    }, []);

    const handleClose = React.useCallback(() => {
        resetModalState();
        onClose?.();
    }, [onClose, resetModalState]);

    const handleLogout = React.useCallback(() => {
        const trimmedName = (profileData.name || '').trim();
        const trimmedEmail = (profileData.email || '').trim();
        const trimmedPhone = (profileData.phone || '').trim();
        const hasCompletedRequiredProfile =
            /^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test(trimmedName) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) &&
            /^[6-9]\d{9}$/.test(trimmedPhone);

        // In complete-profile flow, prevent logout until required details are filled.
        if (step === 'profile' && !hasCompletedRequiredProfile) {
            setShowRequiredErrors(true);
            toast.error('Please complete your profile details before logout');
            return;
        }

        resetModalState();
        logout();
        onClose?.();
    }, [logout, onClose, profileData.email, profileData.name, profileData.phone, resetModalState, step]);

    // Timer logic for Resend OTP
    React.useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Initial load of profile data
    React.useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: user.phone || user.mobile || ''
            });
        }
    }, [user]);

    // Default Dark Theme (Fallback)
    const defaultTheme = {
        bgMobile: 'bg-white/80',
        textMain: 'text-[#0f172a]',
        textHover: 'text-[#037166]', // Accent
        border: 'border-[#037166]/30',
        buttonBg: 'bg-[#111111]', // Input bg
        accentGradientFrom: 'from-[#037166]',
        accentGradientTo: 'to-[#04a99d]',
        accent: 'bg-[#037166]'
    };

    const t = typeof theme === 'object' && Object.keys(theme).length > 0 ? theme : defaultTheme;

    // Derived colors for cleaner JSX
    const inputBg = t.buttonBg;
    const borderColor = t.border;
    const accentText = t.textHover;
    const isValidIndianMobile = (value) => /^[6-9]\d{9}$/.test((value || '').trim());
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
    const isValidName = (value) => /^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test((value || '').trim());
    const isValidReferralCode = (value) => /^[A-Z0-9_-]{3,20}$/.test((value || '').trim());

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!isValidIndianMobile(mobile)) {
            toast.error('Please enter a valid 10-digit mobile number starting with 6-9');
            return;
        }

        setLoading(true);
        try {
            const data = await loginWithWhatsApp(mobile);
            if (data.success || data.status === 'success') {
                if (step !== 'otp') setStep('otp');
                setResendTimer(30);
                toast.success('OTP sent to WhatsApp');
            } else {
                toast.error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = () => {
        if (resendTimer === 0) {
            handleSendOtp();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otp)) {
            toast.error('Please enter 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            const data = await verifyOtp(mobile, otp);
            if (data.success || data.status === 'success') {
                // Seed profile data immediately from the API response so fields
                // are pre-filled for existing users BEFORE the step changes.
                const returnedUser = data.data || data.user || null;
                if (returnedUser) {
                    const hasProfile = returnedUser.name || returnedUser.firstName || returnedUser.lastName;
                    setProfileData({
                        name: returnedUser.name || `${returnedUser.firstName || ''} ${returnedUser.lastName || ''}`.trim(),
                        email: returnedUser.email || ''
                    });
                    // Existing user → view mode; new user → edit mode
                    setIsEditing(!hasProfile);
                } else {
                    // Fallback: will be handled by useEffect once user loads
                    setIsEditing(false);
                }
                setStep('profile');
            } else {
                toast.error(data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (isAuthenticated && user && step === 'profile') {
            const hasProfile = (user.name || user.firstName || user.lastName) && (user.phone || user.mobile);
            // Always re-seed profileData from the latest user object
            setProfileData({
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: user.phone || user.mobile || ''
            });
            if (!hasProfile && !profileSavedForBooking) {
                setIsEditing(true);
                if (!profileToastShown.current) {
                    toast.info('Please complete your profile to continue');
                    profileToastShown.current = true;
                }
            } else {
                // Existing user — ensure we're NOT in edit mode on first open
                if (!profileToastShown.current) {
                    profileToastShown.current = true;
                }
            }
        }
    }, [user, isAuthenticated, step, profileSavedForBooking]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const data = await loginWithGoogle();
            if (data.success || data.status === 'success') {
                setStep('profile');
            }
        } catch (error) {
            console.error('Google login error:', error);
            // Error toast is already shown in AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSave = async () => {
        const trimmedName = (profileData.name || '').trim();
        const trimmedEmail = (profileData.email || '').trim();
        const trimmedPhone = (profileData.phone || '').trim();
        const trimmedReferral = referralCode.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPhone) {
            toast.error('Please fill in phone, email and full name');
            return false;
        }
        if (!isValidName(trimmedName)) {
            toast.error('Please enter a valid full name (min 2 characters)');
            return false;
        }
        if (!isValidEmail(trimmedEmail)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!isValidIndianMobile(trimmedPhone)) {
            toast.error('Please enter a valid 10-digit phone number starting with 6-9');
            return false;
        }
        if (trimmedReferral && !isValidReferralCode(trimmedReferral)) {
            toast.error('Referral code should be 3-20 characters (A-Z, 0-9, _ or -)');
            return false;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('email', trimmedEmail);
            formData.append('mobile', trimmedPhone);
            if (selectedFile) {
                formData.append('image', selectedFile);
            }
            if (trimmedReferral) {
                formData.append('referalCode', trimmedReferral);
            }

            await updateProfile(formData);
            setProfileSavedForBooking(true);
            setShowRequiredErrors(false);
            setIsEditing(false);
            setSelectedFile(null);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isFirstTimeUser = isAuthenticated && user && !((user.name || user.firstName || user.lastName) && (user.phone || user.mobile));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#037166] bg-gradient-to-r from-[#037166]/20 to-[#025951]/20 shadow-2xl shadow-[#037166]/10 backdrop-blur-2xl transition-all duration-500"
            >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#037166]/12 via-white/5 to-[#025951]/10" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[#037166]/10 blur-2xl" />
                {/* Header */}
                <div className={`relative p-6 border-b border-opacity-10 ${borderColor} flex items-center justify-between`}>
                    <h2 className={`text-xl font-bold !text-white`}>
                        {!isAuthenticated
                            ? 'Sign In'
                            : isFirstTimeUser
                                ? 'Complete Profile'
                                : isEditing
                                    ? 'Edit Profile'
                                    : 'Your Profile'}
                    </h2>
                    <button onClick={handleClose} className="p-2 rounded-xl border border-white/35 bg-white/10 transition-colors hover:bg-white/20 text-white opacity-90 hover:opacity-100">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="relative p-6">
                    {!isAuthenticated ? (
                        step === 'login' ? (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-opacity-10 ${t.accent} border border-white/40`}>
                                        <Phone className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className={`text-lg font-bold !text-white mb-2`}>Login with WhatsApp</h3>
                                    <p className={`!text-white opacity-60 text-sm`}>We'll send you a one-time password on WhatsApp</p>
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/90" />
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            maxLength={10}
                                            className={`w-full pl-12 pr-4 py-3.5 ${inputBg} border border-opacity-20 ${borderColor} rounded-xl text-white placeholder:text-white/70 focus:border-opacity-100 transition-all outline-none`}
                                            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff' }}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || mobile.length !== 10}
                                        className={`w-full py-3.5 bg-gradient-to-r ${t.accentGradientFrom} ${t.accentGradientTo} text-white font-bold rounded-xl hover:shadow-lg hover:shadow-current/30 disabled:opacity-50 transition-all`}
                                    >
                                        {loading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </form>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className={`w-full border-t border-opacity-10 ${borderColor}`}></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className={`px-4 ${t.bgMobile} ${t.textMain} opacity-50 text-sm italic`}>or continue with</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    className={`w-full py-3.5 ${inputBg} glass-button-premium border border-opacity-20 ${borderColor} text-white hover:bg-opacity-80 font-bold rounded-xl flex items-center justify-center gap-3 transition-all`}
                                >
                                    <Chrome className="w-5 h-5" />
                                    Sign in with Google
                                </button>

                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const data = await loginWithApple();
                                            if (data.success || data.status === 'success') {
                                                setStep('profile');
                                            }
                                        } catch (error) {
                                            console.error('Apple login error:', error);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className={`w-full py-3.5 ${inputBg} glass-button-premium border border-opacity-20 ${borderColor} text-white hover:bg-opacity-80 font-bold rounded-xl flex items-center justify-center gap-3 transition-all`}
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                        <path d="M17.05 20.28c-.98.95-2.05 1.78-3.19 1.76-1.14-.02-1.5-.72-2.82-.72-1.32 0-1.74.7-2.82.74-1.14.04-2.26-.88-3.26-1.87-2.02-1.99-3.57-5.59-1.55-9.1C4.4 9.1 6.5 7.85 8.42 7.82c1.44-.03 2.8.96 3.68.96.88 0 2.54-1.2 4.26-1.03.72.03 2.73.29 4.02 2.18-.1.06-2.4 1.4-2.38 4.19.03 3.32 2.92 4.51 2.95 4.52-.02.05-.46 1.58-1.6 3.2v-.01zM12.03 7.25c-.02-2.3 2.12-4.26 4.38-4.25-.01 2.37-2.22 4.36-4.38 4.25z" />
                                    </svg>
                                    Sign in with Apple
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-opacity-10 ${t.accent} border border-white/40`}>
                                        <ShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className={`text-lg font-bold !text-white mb-2`}>Enter Verification Code</h3>
                                    <p className={`!text-white opacity-60 text-sm`}>Code sent to +91 {mobile}</p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="flex justify-between gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={otp[index] || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    const newOtp = otp.split('');
                                                    newOtp[index] = val ? val[val.length - 1] : '';
                                                    const finalOtp = newOtp.join('').slice(0, 6);
                                                    setOtp(finalOtp);
                                                    if (val && index < 5) {
                                                        document.getElementById(`otp-${index + 1}`).focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace') {
                                                        if (otp[index]) {
                                                            // Current box has a digit — clear it, stay here
                                                            const newOtp = otp.split('');
                                                            newOtp[index] = '';
                                                            setOtp(newOtp.join(''));
                                                        } else if (index > 0) {
                                                            // Current box is empty — go back and clear previous
                                                            const newOtp = otp.split('');
                                                            newOtp[index - 1] = '';
                                                            setOtp(newOtp.join(''));
                                                            document.getElementById(`otp-${index - 1}`).focus();
                                                        }
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className={`w-12 h-14 ${inputBg} border border-opacity-20 ${borderColor} rounded-xl text-white text-center text-xl font-bold placeholder:text-white/70 focus:border-opacity-100 outline-none transition-all`}
                                                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff' }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className={`w-full py-4 bg-gradient-to-r ${t.accentGradientFrom} ${t.accentGradientTo} text-white font-bold rounded-xl hover:shadow-lg hover:shadow-current/30 disabled:opacity-50 transition-all`}
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>

                                    <div className="text-center">
                                        {resendTimer > 0 ? (
                                            <p className={`!text-white opacity-40 text-sm`}>
                                                Resend code in <span className="font-bold text-white">{resendTimer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={loading}
                                                className={`text-sm font-bold text-white hover:underline disabled:opacity-50 transition-all`}
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('login');
                                            setOtp('');
                                        }}
                                        className={`w-full text-white opacity-60 text-sm hover:opacity-100 hover:underline transition-colors`}
                                    >
                                        Back to Mobile Login
                                    </button>
                                </form>
                            </div>
                        )
                    ) : (
                        // Profile View
                        <div className="space-y-6">
                            <div className="relative flex flex-col items-center">
                                <div className="relative group">
                                    <div className={`w-24 h-24 rounded-full border-2 border-opacity-50 ${borderColor} overflow-hidden ${inputBg}`}>
                                        {previewImage || user?.image ? (
                                            <img loading="lazy" decoding="async"
                                                src={previewImage || (user.image?.startsWith('http') ? user.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${user.image}`)}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${accentText}`}>
                                                {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                setPreviewImage(URL.createObjectURL(file));
                                                // Auto-enable edit mode if image is changed
                                                setIsEditing(true);
                                            }

                                        }}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`absolute bottom-0 right-0 p-2 ${t.accent} rounded-full text-white shadow-lg group-hover:scale-110 transition-transform cursor-pointer hover:bg-opacity-90`}
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className={`text-xl font-bol !text-white`}>{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}</h3>
                                    <p className="!text-white text-sm select-none">{profileData.phone || user?.phone || user?.mobile || 'No phone'}</p>
                                </div>
                                {!isEditing && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsEditing(true)}
                                        className="absolute top-0 right-0 p-2.5 rounded-xl border transition-all bg-white/10 border-white/30 text-white hover:bg-white/20"
                                    >
                                        <Pencil className="w-5 h-5 text-white" />
                                    </motion.button>
                                )}
                            </div>

                            <form
                                className="space-y-4"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    await handleProfileSave();
                                }}
                            >
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={profileData.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                        maxLength={10}
                                        required
                                        className={`auth-modal-input w-full pl-12 pr-4 py-4 ${inputBg} border border-opacity-20 ${borderColor} rounded-xl text-white placeholder:text-white/70 focus:border-opacity-100 transition-all outline-none ${showRequiredErrors && !/^[6-9]\d{9}$/.test((profileData.phone || '').trim()) ? 'border-red-500 border-opacity-100' : ''} ${!isEditing && 'cursor-not-allowed'}`}
                                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff' }}
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={profileData.email}
                                        disabled={!isEditing}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value.trimStart() }))}
                                        required
                                        className={`auth-modal-input w-full pl-12 pr-4 py-4 ${inputBg} border border-opacity-20 ${borderColor} rounded-xl text-white placeholder:text-white/70 focus:border-opacity-100 transition-all outline-none ${showRequiredErrors && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((profileData.email || '').trim()) ? 'border-red-500 border-opacity-100' : ''} ${!isEditing && 'cursor-not-allowed'}`}
                                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff' }}
                                    />
                                </div>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={profileData.name}
                                        disabled={!isEditing}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value.replace(/[^A-Za-z\s.'-]/g, '').slice(0, 50) }))}
                                        required
                                        className={`auth-modal-input w-full pl-12 pr-4 py-4 ${inputBg} border border-opacity-20 ${borderColor} rounded-xl text-white placeholder:text-white/70 focus:border-opacity-100 transition-all outline-none ${showRequiredErrors && !/^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test((profileData.name || '').trim()) ? 'border-red-500 border-opacity-100' : ''} ${!isEditing && 'cursor-not-allowed'}`}
                                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff' }}
                                    />
                                </div>
                                {showRequiredErrors && (
                                    <p className="text-red-400 text-sm px-1">Phone, email and full name are required.</p>
                                )}

                                {/* Referral Code — only shown on first-time profile completion */}
                                {isFirstTimeUser && (
                                    <div className="relative">
                                        <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" />
                                        <input
                                            type="text"
                                            placeholder="Referral Code (optional)"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 20))}
                                            maxLength={20}
                                        className={`auth-modal-input w-full pl-12 pr-4 py-4 ${inputBg} border border-opacity-20 ${borderColor} rounded-xl text-white placeholder:text-white/70 focus:border-opacity-100 transition-all outline-none font-mono tracking-widest`}
                                            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff' }}
                                        />
                                    </div>
                                )}

                            {isEditing && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 border border-green-500/30 text-green-500 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-green-500/10 transition-all disabled:opacity-50`}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </motion.button>
                            )}
                            </form>

                            {!isEditing && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleClose}
                                    className={`w-full py-4 border border-green-500/30 text-green-500 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-green-500/10 transition-all`}
                                >
                                    Continue to Booking
                                    <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            )}

                            <button
                                onClick={handleLogout}
                                className={`w-full py-4 border border-red-500/30 text-red-500 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-red-500/10 transition-all`}
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
            <style jsx global>{`
                .auth-modal-input:-webkit-autofill,
                .auth-modal-input:-webkit-autofill:hover,
                .auth-modal-input:-webkit-autofill:focus,
                .auth-modal-input:-webkit-autofill:active {
                    -webkit-text-fill-color: #ffffff !important;
                    caret-color: #ffffff !important;
                    box-shadow: 0 0 0 1000px #111111 inset !important;
                    -webkit-box-shadow: 0 0 0 1000px #111111 inset !important;
                    transition: background-color 9999s ease-in-out 0s;
                }
            `}</style>
        </div>
    );
}
