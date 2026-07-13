'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { getOtpGatewayCopy } from '@/lib/otpGateway';

export function OtpVerificationPage({
    phone,
    otp,
    onOtpChange,
    onSubmit,
    onBack,
    loading,
    error,
    otpCopy,
    otpMessage,
}) {
    const copy = otpCopy || getOtpGatewayCopy('whatsapp');
    const inputRefs = useRef([]);
    const digits = otp.split('').concat(Array(6 - otp.length).fill(''));

    const handleChange = (index, value) => {
        const cleanValue = value.replace(/\D/g, '').slice(-1);
        const newOtp = otp.split('');

        if (cleanValue) {
            newOtp[index] = cleanValue;
            onOtpChange(newOtp.join('').slice(0, 6));
            if (index < 5) inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            const newOtp = otp.split('');
            if (!digits[index] && index > 0) {
                newOtp[index - 1] = '';
                onOtpChange(newOtp.join(''));
                inputRefs.current[index - 1]?.focus();
            } else {
                newOtp[index] = '';
                onOtpChange(newOtp.join(''));
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onOtpChange(pastedData);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    return (
        <form className="w-full max-w-md mx-auto py-2" onSubmit={onSubmit}>
            <div className="text-center mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#037166]/10 text-[#037166] text-[11px] font-bold uppercase tracking-wider mb-5">
                    Step 2 of 4 · Security Check
                </span>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#037166]/20">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-[1.65rem] font-extrabold text-[#0f172a] tracking-tight">
                    {copy.otpScreenTitle}
                </h2>
                <p className="text-sm text-[#64748b] mt-2 leading-relaxed">
                    {otpMessage || copy.otpScreenSubtitle(phone)}
                </p>
                <button
                    type="button"
                    onClick={onBack}
                    className="text-xs text-[#037166] font-semibold mt-2 hover:underline"
                >
                    {copy.changeNumberLabel}
                </button>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 sm:p-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#475569] mb-3 text-center">
                        6-Digit OTP
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputRefs.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-10 h-12 sm:w-11 sm:h-12 text-center font-bold text-xl rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] focus:border-[#04a99d] focus:ring-2 focus:ring-[#04a99d]/25 outline-none transition-all"
                                autoFocus={i === 0 && otp.length === 0}
                            />
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
                        {error}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={loading}
                        className="h-12 rounded-xl border-[#cbd5e1] bg-white text-[#334155] font-semibold hover:bg-[#f1f5f9]"
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="h-12 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold hover:opacity-95 shadow-md shadow-[#037166]/25 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
