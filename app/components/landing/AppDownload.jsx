'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, Star, Shield, Zap, Apple } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function AppDownload() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <section id="app-download" className="relative min-h-screen flex items-center overflow-hidden py-16">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/40 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <a href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-8">
                <Download className="w-4 h-4 text-[#037166]" />
                <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Download Our App</h6>
              </div>
            </a>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent whitespace-nowrap">
                Everything in Your Pocket
              </span>
            </h2>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Access All Services, Book Appointments, Track Orders, and Manage Your Daily Needs — All from One Powerful App.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {[
                { icon: Zap, text: 'Lightning-fast booking' },
                { icon: Shield, text: 'Secure & private' },
                { icon: Star, text: 'Exclusive app-only deals' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#037166]/20 to-[#025951]/20 border border-[#037166]/30 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-[#037166]" />
                  </div>
                  <h5 className="text-lg text-white">{feature.text}</h5>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#037166] to-[#025951] rounded-2xl text-white font-semibold shadow-xl shadow-[#037166]/40 hover:shadow-2xl hover:shadow-[#037166]/50 transition-all w-full"
                >
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs text-white/90">Download on the</div>
                    <h5 className="text-base ">App Store</h5>
                  </div>
                </motion.button>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-3 px-8 py-4 bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-[#037166]/30 rounded-2xl text-white font-semibold hover:bg-[#037166]/10 transition-all w-full"
                >
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs text-white/90">Get it on</div>
                    <h5 className="text-white font-bold text-transparent">Google Play</h5>
                  </div>
                </motion.button>
              </a>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-8 mt-10 pt-10 border-t border-[#037166]/20"
            >
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">4.8★</div>
                <h6 className="text-sm text-gray-400">App Rating</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">50K+</div>
                <h6 className="text-sm text-gray-400">Downloads</h6>
              </div>
              <div className="h-12 w-px bg-[#037166]/20" />
              <div>
                <div className="text-3xl font-bold text-[#037166] mb-1">10K+</div>
                <h6 className="text-sm text-gray-400">Reviews</h6>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Floating Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[700px] hidden lg:block"
          >
            {/* Main Phone */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-20 left-[32%] -translate-x-1/2 z-10"
            >
              <div className="relative w-72 h-[580px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[3rem] border-8 border-[#2a2a2a] shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#0a0a0a] rounded-b-3xl z-20" />

                {/* Screen */}
                <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-[2.5rem]">
                  <video
                    ref={videoRef}
                    src="/dhubvideo.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-110"
                  />
                </div>

                {/* Screen Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#037166]/30 to-[#02b39a]/30 blur-2xl -z-10" />
              </div>
            </motion.div>

            {/* Secondary Phone (Behind) */}
            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-28 left-[32%] -translate-x-1/2 opacity-40 scale-90 -rotate-12"
            >
              <div className="w-72 h-[580px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[3rem] border-8 border-[#2a2a2a] shadow-2xl" />
            </motion.div>

            {/* Floating Icons */}
            {[
              { Icon: Download, position: { top: '15%', right: '20%' } },
              { Icon: Star, position: { top: '30%', right: '5%' } },
              { Icon: Shield, position: { bottom: '25%', right: '20%' } },
              { Icon: Zap, position: { bottom: '15%', right: '5%' } },
            ].map(({ Icon, position }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  delay: 0.5 + index * 0.1,
                  y: { duration: 2 + index, repeat: Infinity },
                  rotate: { duration: 3 + index, repeat: Infinity },
                }}
                className="absolute"
                style={position}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#037166]/30 to-[#025951]/30 backdrop-blur-md border border-[#037166]/40 rounded-2xl flex items-center justify-center shadow-lg shadow-[#037166]/20">
                  <Icon className="w-8 h-8 text-[#037166]" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
