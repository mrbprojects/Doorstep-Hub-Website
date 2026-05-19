'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function OtpVerificationPage({
  phone,
  otp,
  onOtpChange,
  onSubmit,
  onBack,
  loading,
  error,
}) {
  const inputRefs = useRef([]);

  // Split OTP into array of 6 digits
  const digits = otp.split('').concat(Array(6 - otp.length).fill(''));

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newOtp = otp.split('');
    
    if (cleanValue) {
      newOtp[index] = cleanValue;
      onOtpChange(newOtp.join('').slice(0, 6));
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newOtp = otp.split('');
        newOtp[index - 1] = '';
        onOtpChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = otp.split('');
        newOtp[index] = '';
        onOtpChange(newOtp.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onOtpChange(pastedData);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <form className="space-y-6 flex flex-col items-center" onSubmit={onSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-black text-[#0f172a]">Secure Login</h2>
        <p className="text-sm text-gray-600">A 6-digit code has been sent to +91 {phone}</p>
      </div>

      <div className="space-y-3 w-full flex flex-col items-center">
        <label className="text-sm font-semibold text-[#334155]">Verification Code</label>
        {/* Centered with justify-center and max-width */}
        <div className="flex justify-center gap-3 w-full" onPaste={handlePaste}>
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
              className="w-full max-w-[48px] h-12 md:h-14 text-center font-bold text-xl rounded-lg border border-[#cbd5e1] bg-white text-[#0f172a] focus:border-[#04a99d] focus:ring-1 focus:ring-[#04a99d] outline-none transition-all"
              autoFocus={i === 0 && otp.length === 0}
            />
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        {error ? <p className="text-sm text-red-300 font-medium mb-4">{error}</p> : null}

        <div className="grid grid-cols-2 gap-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="h-12 border-[#cbd5e1] bg-white text-[#0f172a] font-bold hover:bg-[#f8fafc] transition-all"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading || otp.length < 6}
            className="h-12 bg-[#04a99d] text-white font-bold hover:bg-[#037166] shadow-lg shadow-[#04a99d]/20"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </div>
      </div>
    </form>
  );
}
