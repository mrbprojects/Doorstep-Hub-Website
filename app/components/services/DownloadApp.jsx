'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';

export function DownloadApp() {
  return (
    <section className="py-20 relative overflow-hidden">
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

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-6">
              <Smartphone className="w-3 h-3 text-[#04a99d]" />
              <h6 className="text-xs font-medium text-[#04a99d]">MOBILE APP</h6>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Download the App &
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#037166] to-[#04a99d] bg-clip-text text-transparent">
                Grow Your Service Business
              </span>
            </h2>

            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Manage bookings, track earnings, and connect with customers—all from your mobile device.
              Join thousands of service providers growing their business with us.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
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
                  <div className="w-6 h-6 rounded-full bg-[#037166]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#04a99d]" />
                  </div>
                  <p className="text-white/80 font-normal">{feature}</p>
                </motion.div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <a
                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 50px rgba(3, 113, 102, 0.35)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full min-h-[180px] flex items-center justify-between px-8 py-8 rounded-[2.5rem] bg-gradient-to-r from-[#3f7f77] to-[#62aca4] text-white shadow-2xl shadow-[#037166]/30 transition-all group"
                >
                  <div className="flex flex-col items-start gap-5 text-left">
                    <img src="/apple2.png" alt="App Store" className="h-9 w-auto object-contain brightness-0 invert opacity-95" loading="lazy" decoding="async" />
                    <div>
                      <div className="text-2xl md:text-3xl font-semibold leading-tight text-white/90">Download on the</div>
                      <span className="text-4xl md:text-5xl font-bold leading-tight">App Store</span>
                    </div>
                  </div>
                  <ArrowRight className="w-12 h-12 text-white/95 group-hover:translate-x-2 transition-transform ml-4 shrink-0" />
                </motion.button>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 50px rgba(3, 113, 102, 0.35)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full min-h-[180px] flex items-center justify-between px-8 py-8 rounded-[2.5rem] bg-gradient-to-r from-[#3f7f77] to-[#62aca4] text-white shadow-2xl shadow-[#037166]/30 transition-all group"
                >
                  <div className="flex flex-col items-start gap-5 text-left">
                    <img src="/andriod1.png" alt="Google Play" className="h-9 w-auto object-contain brightness-0 invert opacity-95" loading="lazy" decoding="async" />
                    <div>
                      <div className="text-2xl md:text-3xl font-semibold leading-tight text-white/90">Get it on</div>
                      <span className="text-4xl md:text-5xl font-bold leading-tight">Google Play</span>
                    </div>
                  </div>
                  <ArrowRight className="w-12 h-12 text-white/95 group-hover:translate-x-2 transition-transform ml-4 shrink-0" />
                </motion.button>
              </a>
            </div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: -5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 via-[#04a99d]/20 to-transparent blur-3xl" />

              {/* Phone Frame */}
              <div className="relative w-[280px] h-[560px] rounded-[3rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-4 border-white/10 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#037166] rounded-b-3xl z-20" />

                {/* Screen Content */}
                <div className="absolute inset-3 rounded-[2.5rem] overflow-hidden bg-black">
                  <video
                    src="/dhubvideo.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#037166]/20 to-transparent" />
                </div>

                {/* Floating App Icons */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -right-4 top-20 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] shadow-xl flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  className="absolute -left-4 bottom-32 w-14 h-14 rounded-xl bg-gradient-to-br from-[#037166] to-[#065f46] shadow-xl flex items-center justify-center"
                >
                  <Smartphone className="w-7 h-7 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
