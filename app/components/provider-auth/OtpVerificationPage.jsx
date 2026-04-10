'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function OtpVerificationPage({
  phone,
  otp,
  onOtpChange,
  onSubmit,
  onBack,
  loading,
  error,
}) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <h2 className="text-2xl font-black text-white">Secure Login</h2>
        <p className="text-sm text-white/60">Code sent to +91 {phone}</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="provider-otp" className="text-sm font-semibold text-white">
          OTP
        </label>
        <Input
          id="provider-otp"
          type="text"
          maxLength={6}
          inputMode="numeric"
          value={otp}
          onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter OTP"
          className="h-11 border-white/30 bg-white/10 text-white placeholder:text-white/60"
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="h-11 border-white/30 bg-transparent text-white hover:bg-white/10"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 bg-[#04a99d] text-white hover:bg-[#037166]"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </div>
    </form>
  );
}
