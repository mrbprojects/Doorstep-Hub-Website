'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MobileNumberPage({ phone, onPhoneChange, onSubmit, loading, error }) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <h2 className="text-2xl font-black text-white">Verify Your Phone</h2>
        <p className="text-sm text-white/60">Enter your number to receive a secure login code.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="provider-phone" className="text-sm font-semibold text-white">
          Mobile Number
        </label>
        <Input
          id="provider-phone"
          type="tel"
          maxLength={10}
          inputMode="numeric"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="Enter 10-digit number"
          className="h-11 border-white/30 bg-white/10 text-white placeholder:text-white/60"
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-[#04a99d] text-white hover:bg-[#037166]"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </Button>
    </form>
  );
}
