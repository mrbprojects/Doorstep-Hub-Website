'use client';

import React from 'react';
import { motion } from 'framer-motion';

const paymentMethods = [
  {
    name: 'UPI',
    badge: 'U₹',
    badgeBg: 'bg-[#5f259f]',
    badgeText: 'text-white',
    customIcon: null
  },
  {
    name: 'PhonePe',
    badge: 'Pe',
    badgeBg: 'bg-[#5f259f]',
    badgeText: 'text-white',
    customIcon: null
  },
  {
    name: 'Google Pay',
    badge: 'G',
    badgeBg: 'bg-[#4285F4]',
    badgeText: 'text-white',
    customIcon: null
  },
  {
    name: 'Paytm',
    badge: 'P',
    badgeBg: 'bg-[#00BAF2]',
    badgeText: 'text-white',
    customIcon: null
  },
  {
    name: 'Visa',
    badge: 'V',
    badgeBg: 'bg-[#1A1F71]',
    badgeText: 'text-white',
    customIcon: null
  },
  {
    name: 'Mastercard',
    badge: 'M',
    badgeBg: 'bg-[#EB001B]',
    badgeText: 'text-white',
    isMastercard: true
  },
  {
    name: 'Net Banking',
    badge: 'NB',
    badgeBg: 'bg-[#0F172A]',
    badgeText: 'text-white',
    customIcon: null
  },
  {
    name: 'Cash',
    badge: '₹',
    badgeBg: 'bg-[#334155]',
    badgeText: 'text-white',
    customIcon: null
  }
];

export function PaymentMethodsSection() {
  return (
    <section className="relative py-8 sm:py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50/50 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          
          {/* Left: Text Info */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-md"
          >
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2563EB] mb-2">
              PAY YOUR WAY
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 tracking-tight leading-tight">
              All Indian payment methods accepted.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 font-medium">
              Sirf service ke baad pay karein.
            </p>
          </motion.div>

          {/* Right: Payment Pills / Badges (Excluded EMI) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex-1 flex flex-wrap items-center gap-3 sm:gap-3.5 lg:justify-end"
          >
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                {/* Custom Badge / Icon */}
                {method.isMastercard ? (
                  <div className="w-7 h-7 rounded-lg bg-[#EB001B] flex items-center justify-center text-white font-black text-xs shadow-inner relative overflow-hidden flex-shrink-0">
                    <div className="absolute -left-0.5 w-4 h-4 rounded-full bg-[#EB001B] opacity-90" />
                    <div className="absolute -right-0.5 w-4 h-4 rounded-full bg-[#F79E1B] opacity-80" />
                    <span className="relative z-10 text-[10px] font-black">M</span>
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-lg ${method.badgeBg} flex items-center justify-center ${method.badgeText} font-black text-xs shadow-inner flex-shrink-0`}>
                    <span className={method.badge.length > 1 ? 'text-[10px]' : 'text-xs'}>
                      {method.badge}
                    </span>
                  </div>
                )}

                {/* Name */}
                <span className="text-sm font-bold text-gray-800 tracking-tight whitespace-nowrap group-hover:text-gray-900">
                  {method.name}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
