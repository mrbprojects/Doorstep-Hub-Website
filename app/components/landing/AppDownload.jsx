'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Download, Star, Shield, Zap } from 'lucide-react';

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
    <section id="app-download" className="relative flex items-center overflow-hidden pt-0 pb-2 lg:pb-3 -mt-8 md:-mt-10">
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
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/35 rounded-full blur-[170px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/25 rounded-full blur-[170px]"
        />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 xl:gap-10 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <a href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-5">
                <Download className="w-4 h-4 text-[#037166]" />
                <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Download Our App</h6>
              </div>
            </a>

            {/* Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-[4.25rem] lg:leading-[1.04] font-bold mb-5">
              <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
                <span className="whitespace-nowrap">Everything in Your Pocket</span>
              </span>
            </h2>

            <p className="text-lg xl:text-xl text-gray-400 mb-6 leading-relaxed max-w-4xl">
              Access All Services, Book Appointments, Track Orders, and Manage Your Daily Needs — All from One Powerful App.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
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
                  <div className="w-11 h-11 bg-gradient-to-br from-[#037166]/20 to-[#025951]/20 border border-[#037166]/30 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-[#037166]" />
                  </div>
                  <h5 className="text-lg text-white">{feature.text}</h5>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 mb-6">
              <a
                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-36 xs:w-44 md:w-44 h-12 xs:h-14 md:h-14 bg-[#DEF2EF] rounded-full shadow-xl shadow-[#037166]/15 hover:shadow-2xl hover:shadow-[#037166]/25 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden flex-shrink-0 border border-[#9ecbc3]"
                title="Get it on Google Play"
              >
                <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert" />
              </a>

              <a
                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-36 xs:w-44 md:w-44 h-12 xs:h-14 md:h-14 bg-[#DEF2EF] rounded-full shadow-xl shadow-[#037166]/15 hover:shadow-2xl hover:shadow-[#037166]/25 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden flex-shrink-0 border border-[#9ecbc3]"
                title="Download on the App Store"
              >
                <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert" />
              </a>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-5 lg:ml-3 shrink-0"
              >
                <div>
                  <div className="text-2xl xl:text-3xl font-bold text-[#037166] mb-0.5">4.8★</div>
                  <h6 className="text-xs xl:text-sm text-gray-400">App Rating</h6>
                </div>
                <div className="h-11 w-px bg-[#037166]/20" />
                <div>
                  <div className="text-2xl xl:text-3xl font-bold text-[#037166] mb-0.5">50K+</div>
                  <h6 className="text-xs xl:text-sm text-gray-400">Downloads</h6>
                </div>
                <div className="h-11 w-px bg-[#037166]/20" />
                <div>
                  <div className="text-2xl xl:text-3xl font-bold text-[#037166] mb-0.5">10K+</div>
                  <h6 className="text-xs xl:text-sm text-gray-400">Reviews</h6>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Floating Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[calc(100vh-6rem)] min-h-[520px] max-h-[650px] hidden lg:flex items-center justify-center"
          >
            {/* Main Phone */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="relative w-[clamp(15rem,16vw,18rem)] h-[clamp(30rem,70vh,36rem)] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[3rem] border-8 border-[#2a2a2a] shadow-2xl overflow-hidden">
                {/* Notch */}
                {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#037166] rounded-b-3xl z-20" /> */}

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

          </motion.div>
        </div>
      </div>
    </section>
  );
}


