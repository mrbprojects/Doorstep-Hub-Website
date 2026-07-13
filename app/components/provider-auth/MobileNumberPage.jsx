'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';
import { getOtpGatewayCopy } from '@/lib/otpGateway';

export function MobileNumberPage({
    phone,
    onPhoneChange,
    onSubmit,
    loading,
    error,
    otpCopy,
}) {
    const copy = otpCopy || getOtpGatewayCopy('whatsapp');

    const handleChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        onPhoneChange(val);
    };

    const isValid = /^[6-9]\d{9}$/.test(phone);

    return (
        <form className="w-full max-w-md mx-auto py-2" onSubmit={onSubmit}>
            <div className="text-center mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#037166]/10 text-[#037166] text-[11px] font-bold uppercase tracking-wider mb-5">
                    Step 1 of 4 · Phone Verification
                </span>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#037166]/20">
                    <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-[1.65rem] font-extrabold text-[#0f172a] tracking-tight">
                    Enter {copy.label}
                </h2>
                <p className="text-sm text-[#64748b] mt-2 leading-relaxed max-w-xs mx-auto">
                    {copy.loginSubtitle}
                </p>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 sm:p-6 space-y-4">
                <div>
                    <label htmlFor="partner-phone" className="block text-xs font-bold uppercase tracking-wide text-[#475569] mb-2">
                        {copy.label}
                    </label>
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-[#037166] text-sm font-bold select-none">+91</span>
                        <input
                            id="partner-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder={copy.placeholder}
                            value={phone}
                            onChange={handleChange}
                            maxLength={10}
                            autoFocus
                            className="w-full h-12 py-3.5 pl-14 pr-4 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] text-lg font-semibold tracking-widest placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal focus:border-[#04a99d] focus:ring-2 focus:ring-[#04a99d]/25 outline-none transition-all"
                        />
                    </div>
                    <p className="text-[11px] text-[#94a3b8] mt-2">Indian number · 10 digits starting with 6–9</p>
                </div>

                {error && (
                    <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={loading || !isValid}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold hover:opacity-95 shadow-md shadow-[#037166]/25 disabled:opacity-50"
                >
                    {loading ? (
                        'Sending OTP...'
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            {copy.sendButton}
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}
