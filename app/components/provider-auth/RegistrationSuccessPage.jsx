'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download } from 'lucide-react';

export function RegistrationSuccessPage() {
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
    <div className="flex flex-col items-center text-center py-2 px-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="w-16 h-16 bg-[#04a99d]/20 rounded-full flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-10 h-10 text-[#04a99d]" />
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl sm:text-2xl font-black mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
      >
        Registration Successful!
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 text-sm sm:text-base mb-6 max-w-sm mx-auto leading-relaxed"
      >
        Thank you for joining our professional network. Please download the Doorstep Hub Partner app to manage your service requests.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3 w-full"
      >
        <a
          href={appLinks.android}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-36 h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-lg hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden border border-white/10 px-2"
          title="Get it on Google Play"
        >
          <img src="/andriod1.png" alt="Google Play" className="h-7 w-auto brightness-0 invert" />
        </a>

        <a
          href={appLinks.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-36 h-12 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-lg hover:shadow-[#037166]/40 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden border border-white/10 px-2"
          title="Download on the App Store"
        >
          <img src="/apple2.png" alt="App Store" className="h-7 w-auto brightness-0 invert" />
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-6 text-white/20 text-[10px] uppercase tracking-widest"
      >
        Redirecting to start in 5 seconds...
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex items-center gap-2 text-white/30 text-xs"
      >
        <Download className="w-3 h-3" />
        <span>Available for Android and iOS</span>
      </motion.div>
    </div>
  );
}
