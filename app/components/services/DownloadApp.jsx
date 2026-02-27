'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Apple, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';

export function DownloadApp() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1614] via-[#0a0a0a] to-[#0f1614]" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#037166] rounded-full blur-[150px]"
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
            <div className="flex flex-wrap gap-4">
              <a
                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(3, 113, 102, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium shadow-xl shadow-[#037166]/30 transition-all group"
                >
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <span className="text-sm font-bold">App Store</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-2" />
                </motion.button>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#037166]/50 text-white font-medium backdrop-blur-sm transition-all group"
                >
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Get it on</div>
                    <span className="text-sm font-bold">Google Play</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-2" />
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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-20" />

                {/* Screen Content */}
                <div className="absolute inset-3 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#0f1614] to-[#0a0a0a]">
                  <img
                    src="https://images.unsplash.com/photo-1629697776809-f37ceac39e77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBtb2NrdXB8ZW58MXx8fHwxNzY4MDE3MDA3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="App Interface"
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
                  className="absolute -left-4 bottom-32 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl flex items-center justify-center"
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
