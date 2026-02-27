'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('subscribe'); // 'subscribe' or 'verify'
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('verify');
        setMessage('Verification OTP sent to your email.');
      } else {
        setIsError(true);
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setIsError(true);
      setMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/newsletter/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        setMessage('Successfully subscribed! Welcome to our newsletter.');
        setTimeout(() => {
          setStep('subscribe');
          setEmail('');
          setOtp('');
          setIsSubscribed(false);
          setMessage('');
        }, 3000);
      } else {
        setIsError(true);
        setMessage(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setIsError(true);
      setMessage('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1614] via-[#0a0a0a] to-[#0f1614]" />

      {/* Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-1/2 left-1/4 w-96 h-96 bg-[#037166] rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -bottom-1/2 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] mb-6 shadow-xl shadow-[#037166]/30"
        >
          <Mail className="w-8 h-8 text-white" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Stay Updated With
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
            Service Offers
          </span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white/60 text-lg mb-8 max-w-2xl mx-auto"
        >
          Get exclusive deals, maintenance tips, and service updates delivered straight to your inbox.
        </motion.p>

        {/* Subscribe Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onSubmit={step === 'subscribe' ? handleSubscribe : handleVerify}
          className="max-w-md mx-auto"
        >
          <div className="relative">
            <div className="relative flex items-center gap-3 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#037166]/50 transition-all">
              <div className="pl-3">
                <Mail className="w-5 h-5 text-white/40" />
              </div>
              <input
                type={step === 'subscribe' ? "email" : "text"}
                value={step === 'subscribe' ? email : otp}
                onChange={(e) => step === 'subscribe' ? setEmail(e.target.value) : setOtp(e.target.value)}
                placeholder={step === 'subscribe' ? "Enter your email address" : "Enter 6-digit OTP"}
                required
                disabled={loading || isSubscribed}
                className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none py-2"
                maxLength={step === 'subscribe' ? undefined : 6}
              />
              <motion.button
                type="submit"
                disabled={loading || isSubscribed}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium shadow-lg shadow-[#037166]/30 hover:shadow-[#037166]/50 transition-all flex items-center gap-2 group ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                <span>{loading ? 'Processing...' : step === 'subscribe' ? 'Subscribe' : 'Verify'}</span>
                {!loading && (
                  <motion.div
                    animate={isSubscribed ? { scale: [1, 1.2, 1], rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {isSubscribed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </motion.div>
                )}
              </motion.button>
            </div>

            {/* Back to Email link if in verify step */}
            {step === 'verify' && !isSubscribed && (
              <button
                type="button"
                onClick={() => setStep('subscribe')}
                className="mt-2 text-xs text-white/40 hover:text-white transition-colors"
              >
                Change email address
              </button>
            )}

            {/* Glow Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#037166]/20 to-[#04a99d]/20 blur-xl -z-10"
            />
          </div>

          {/* Status Message */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: message ? 1 : 0,
              height: message ? 'auto' : 0,
            }}
            className="mt-4 overflow-hidden"
          >
            <div className={`flex items-center justify-center gap-2 ${isError ? 'text-red-400' : 'text-[#04a99d]'}`}>
              {!isError && <CheckCircle2 className="w-5 h-5" />}
              <h6 className="font-medium">{message}</h6>
            </div>
          </motion.div>
        </motion.form>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-white/40 text-sm mt-6"
        >
          We respect your privacy. Unsubscribe anytime.
        </motion.p>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-10 left-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#037166]/20 to-transparent backdrop-blur-sm border border-white/10"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-transparent backdrop-blur-sm border border-white/10"
        />
      </div>
    </section>
  );
}
