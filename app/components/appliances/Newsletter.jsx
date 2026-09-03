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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/subscribe`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/newsletter/verify-otp`, {
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
    <section className="py-24 mt-18 relative overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#03716605,transparent_50%),radial-gradient(circle_at_bottom_left,#04a99d05,transparent_50%)]" />
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#037166] to-[#04a99d] mb-8 shadow-2xl shadow-[#037166]/20"
        >
          <Mail className="w-8 h-8 text-white" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
        >
          <span className="text-gray-900 block mb-2">
            Stay Updated With
          </span>
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
          className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto font-medium"
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
          className="max-w-xl mx-auto"
        >
          <div className="relative group">
            <div className="relative flex items-center gap-3 p-2 rounded-full bg-white border-2 border-gray-100 shadow-xl shadow-gray-200/50 group-hover:border-[#037166]/30 group-hover:shadow-[#037166]/5 transition-all duration-300">
              <div className="pl-4">
                <Mail className="w-5 h-5 text-gray-400 group-hover:text-[#037166] transition-colors" />
              </div>
              <input
                type={step === 'subscribe' ? "email" : "text"}
                value={step === 'subscribe' ? email : otp}
                onChange={(e) => step === 'subscribe' ? setEmail(e.target.value) : setOtp(e.target.value)}
                placeholder={step === 'subscribe' ? "Enter your email address" : "Enter 6-digit OTP"}
                required
                disabled={loading || isSubscribed}
                className="flex-1 bg-transparent text-gray-900 font-bold placeholder:text-gray-300 outline-none py-3 text-base"
                maxLength={step === 'subscribe' ? undefined : 6}
              />
              <motion.button
                type="submit"
                disabled={loading || isSubscribed}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-8 py-4 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[#037166]/20 hover:shadow-[#037166]/40 transition-all flex items-center gap-3 group ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                <span>{loading ? 'Processing...' : step === 'subscribe' ? 'Subscribe' : 'Verify'}</span>
                {!loading && (
                  <motion.div
                    animate={isSubscribed ? { scale: [1, 1.2, 1], rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {isSubscribed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </motion.div>
                )}
              </motion.button>
            </div>

            {/* Status Message */}
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                opacity: message ? 1 : 0,
                height: message ? 'auto' : 0,
                }}
                className="mt-6 overflow-hidden"
            >
                <div className={`flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest ${isError ? 'text-red-500' : 'text-[#037166]'}`}>
                {!isError && <CheckCircle2 className="w-4 h-4" />}
                <p>{message}</p>
                </div>
            </motion.div>
          </div>
        </motion.form>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-10"
        >
          We respect your privacy. Unsubscribe anytime.
        </motion.p>

        {/* Decorative Floating Elements (Refined for Light Theme) */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 -left-4 md:top-10 md:left-4 w-20 h-20 md:w-28 md:h-28 rounded-[2.5rem] bg-white border border-gray-100 flex items-center justify-center p-5 shadow-2xl shadow-gray-200/50"
        >
          <img loading="lazy" decoding="async"
            src="/electric-appliance.png"
            alt="Repair Service"
            className="w-full h-full object-contain filter grayscale-[0.2] group-hover:grayscale-0 transition-all"
          />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 12, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 -right-4 md:top-10 md:right-4 w-20 h-20 md:w-28 md:h-28 rounded-[2.5rem] bg-white border border-gray-100 flex items-center justify-center p-5 shadow-2xl shadow-gray-200/50"
        >
          <img loading="lazy" decoding="async"
            src="/fridge-storage.png"
            alt="Fridge Service"
            className="w-full h-full object-contain filter grayscale-[0.2] group-hover:grayscale-0 transition-all"
          />
        </motion.div>
      </div>
    </section>
  );
}

