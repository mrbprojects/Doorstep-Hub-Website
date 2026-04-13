'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, X, UserCheck } from 'lucide-react';

export function RegistrationSuccessPage({ onClose, isNewUser = true }) {
  const [appLinks, setAppLinks] = useState({
    android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
    ios: 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi'}/app/get_global_settings`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success && data.policy) {
          setAppLinks({
            android: data.policy.vendorAndroidAppLink
                || data.policy.partnerAndroidAppLink
                || 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
            ios: data.policy.vendorIosAppLink
                || data.policy.partnerIosAppLink
                || 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
          });
        }
      } catch (error) {
        console.error('Error fetching dynamic app links:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-2 px-0 relative w-full">
      {/* Prominent Close Button */}
      <button 
        onClick={onClose}
        className="absolute -top-2 -right-2 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/60 hover:text-white transition-all shadow-xl border border-white/20 z-50 group"
        aria-label="Close"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 bg-[#04a99d]/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(4,169,157,0.3)]"
      >
        {isNewUser ? (
          <CheckCircle className="w-10 h-10 text-[#04a99d]" />
        ) : (
          <UserCheck className="w-10 h-10 text-[#04a99d]" />
        )}
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl sm:text-3xl font-black mb-2 text-white tracking-tight leading-tight"
      >
        {isNewUser ? 'Registration Successful!' : "You're Already With Us!"}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-white/60 text-[13px] sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed"
      >
        {isNewUser ? (
          "Thank you for joining our professional network. Please download the Doorstep Hub Partner app to manage your service requests."
        ) : (
          "Welcome back! You are already a registered partner. Please download the Doorstep Hub Partner app to access your profile and bookings."
        )}
      </motion.p>

      {/* MATCHED EXACTLY TO LANDING PAGE APP DOWNLOAD SECTION */}
      <div className="flex flex-wrap justify-center gap-4 w-full px-2">
        <a
          href={appLinks.android}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-[135px] sm:w-[160px] h-11 sm:h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden flex-shrink-0"
          title="Get it on Google Play"
        >
          <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover scale-110 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
        </a>

        <a
          href={appLinks.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-[135px] sm:w-[160px] h-11 sm:h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl shadow-[#037166]/20 hover:shadow-2xl hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden flex-shrink-0"
          title="Download on the App Store"
        >
          <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover scale-110 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex items-center gap-2 text-white/40 text-[9px] font-bold uppercase tracking-[0.3em]"
      >
        <Download className="w-3 h-3" />
        <span>Manage Jobs on the Go</span>
      </motion.div>
    </div>
  );
}
