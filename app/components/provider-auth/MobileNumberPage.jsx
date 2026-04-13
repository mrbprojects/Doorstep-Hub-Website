'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function MobileNumberPage({ phone, onPhoneChange, onSubmit, loading, error }) {
  const inputRefs = useRef([]);

  const digits = phone.split('').concat(Array(10 - phone.length).fill(''));

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newPhone = phone.split('');
    
    if (cleanValue) {
      newPhone[index] = cleanValue;
      onPhoneChange(newPhone.join('').slice(0, 10));
      if (index < 9) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newPhone = phone.split('');
        newPhone[index - 1] = '';
        onPhoneChange(newPhone.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newPhone = phone.split('');
        newPhone[index] = '';
        onPhoneChange(newPhone.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
    onPhoneChange(pastedData);
    const nextIndex = Math.min(pastedData.length, 9);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <form className="space-y-6 flex flex-col items-center" onSubmit={onSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">Verify Your Phone</h2>
        <p className="text-sm text-white/60">Enter your 10-digit number to receive a secure login code.</p>
      </div>
      
      <div className="space-y-3 w-full flex flex-col items-center">
        <label className="text-sm font-semibold text-white">Mobile Number</label>
        <div className="flex justify-center gap-1 sm:gap-1.5 w-full" onPaste={handlePaste}>
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
              className="w-full max-w-[36px] h-11 sm:h-12 md:h-14 text-center font-bold text-lg rounded-lg border border-white/20 bg-white/5 text-white focus:border-[#04a99d] focus:ring-1 focus:ring-[#04a99d] outline-none transition-all"
              autoFocus={i === 0 && phone.length === 0}
            />
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        {error ? <p className="text-sm text-red-300 font-medium mb-4">{error}</p> : null}

        <Button
          type="submit"
          disabled={loading || phone.length < 10}
          className="h-12 w-full max-w-sm bg-[#04a99d] text-white font-bold hover:bg-[#037166] shadow-lg shadow-[#04a99d]/20"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </div>
    </form>
  );
}
