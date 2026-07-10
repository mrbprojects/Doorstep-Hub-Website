'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { MobileNumberPage } from '@/components/provider-auth/MobileNumberPage';
import { OtpVerificationPage } from '@/components/provider-auth/OtpVerificationPage';
import {
    getProviderProfile,
    saveStoredProviderSession,
    sendWhatsAppOtp,
    verifyProviderOtp,
} from '@/lib/providerAuthApi';

export function PartnerLoginModal({ isOpen, onClose }) {
    const router = useRouter();
    const [step, setStep] = useState('mobile');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState({ mobile: false, otp: false });
    const [error, setError] = useState({ mobile: '', otp: '' });

    useEffect(() => {
        if (!isOpen) {
            setStep('mobile');
            setPhone('');
            setOtp('');
            setError({ mobile: '', otp: '' });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError((prev) => ({ ...prev, mobile: '' }));
        if (!/^[6-9]\d{9}$/.test(phone)) {
            setError((prev) => ({ ...prev, mobile: 'Enter a valid 10-digit mobile number.' }));
            return;
        }
        setLoading((prev) => ({ ...prev, mobile: true }));
        try {
            const response = await sendWhatsAppOtp(phone);
            setOtp('');
            toast.success(response?.message || 'OTP sent');
            setStep('otp');
        } catch (err) {
            setError((prev) => ({ ...prev, mobile: err.message || 'Failed to send OTP' }));
        } finally {
            setLoading((prev) => ({ ...prev, mobile: false }));
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError((prev) => ({ ...prev, otp: '' }));
        if (!/^\d{4,6}$/.test(otp)) {
            setError((prev) => ({ ...prev, otp: 'Enter a valid OTP.' }));
            return;
        }
        setLoading((prev) => ({ ...prev, otp: true }));
        try {
            const { token, userId } = await verifyProviderOtp(phone, otp);
            if (!token) throw new Error('No auth token received.');

            let profile = null;
            try {
                profile = await getProviderProfile(token, userId);
            } catch {
                profile = null;
            }

            saveStoredProviderSession({ token, userId, phone, profile });
            onClose?.();

            if (profile) {
                toast.success('Partner login successful');
                router.push('/partner/dashboard');
                return;
            }

            toast.info('Complete your partner registration to continue');
            router.push('/service-partner#join-partner');
            window.dispatchEvent(new CustomEvent('partner:continue-registration'));
        } catch (err) {
            setError((prev) => ({ ...prev, otp: err.message || 'OTP verification failed' }));
        } finally {
            setLoading((prev) => ({ ...prev, otp: false }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                aria-hidden="true"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#037166]/20 bg-white shadow-2xl"
            >
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Partner Login</h2>
                        <p className="text-xs text-gray-500">Verify your mobile to access the partner dashboard</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 sm:p-6">
                    <AnimatePresence mode="wait">
                        {step === 'mobile' ? (
                            <motion.div key="mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <MobileNumberPage
                                    phone={phone}
                                    onPhoneChange={setPhone}
                                    onSubmit={handleSendOtp}
                                    loading={loading.mobile}
                                    error={error.mobile}
                                />
                            </motion.div>
                        ) : (
                            <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <OtpVerificationPage
                                    phone={phone}
                                    otp={otp}
                                    onOtpChange={setOtp}
                                    onSubmit={handleVerifyOtp}
                                    onBack={() => setStep('mobile')}
                                    loading={loading.otp}
                                    error={error.otp}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
