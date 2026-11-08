'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Smartphone, CheckCircle2 } from 'lucide-react';

export function DownloadApp() {
  return (
    <section className="py-8 sm:py-10 lg:py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1614] via-[#0a0a0a] to-[#0f1614]" />
      <motion.div initial={false}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#037166] rounded-full blur-[150px] pointer-events-none"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-3">
              <Smartphone className="w-3 h-3 text-[#04a99d]" />
              <h6 className="text-xs font-medium text-[#04a99d]">MOBILE APP</h6>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              <span className="bg-[#037166]  bg-clip-text text-transparent">
                Download App now ..
              </span>
              <br />

              <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
               Everything in Your Pocket
              </span>
            </h2>

            <p className="text-white/60 text-sm sm:text-base mb-4 leading-relaxed">
              Manage bookings, track earnings, and connect with customers—all from your mobile device.
              Join thousands of service providers growing their business with us.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-5">
              {[
                'Instant booking notifications',
                'Real-time customer messaging',
                'Easy payment tracking',
                'Performance analytics',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#037166]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#04a99d]" />
                  </div>
                  <p className="text-white/80 text-sm font-normal">{feature}</p>
                </motion.div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-32 sm:w-36 h-10 sm:h-11 bg-[#DEF2EF] rounded-full shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 overflow-hidden border border-[#9ecbc3]"
                title="Download on the App Store"
              >
                <Image src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"  width={500} height={300} />
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-32 sm:w-36 h-10 sm:h-11 bg-[#DEF2EF] rounded-full shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 overflow-hidden border border-[#9ecbc3]"
                title="Get it on Google Play"
              >
                <Image src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"  width={500} height={300} />
              </a>
            </div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: -2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px]"
            >
              {/* Glow Effect */}
              <div className="absolute inset-4 bg-gradient-to-t from-[#037166]/40 via-[#04a99d]/25 to-transparent blur-3xl" />

              {/* Real Doorstep Hub Customer App Mockup */}
              <Image
                src="/apps/customer-app-mockup.png"
                alt="Doorstep Hub Customer App"
                className="relative z-10 w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
               width={500} height={300} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
