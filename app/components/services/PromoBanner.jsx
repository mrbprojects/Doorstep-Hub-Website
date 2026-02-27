'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Tag, ArrowRight } from 'lucide-react';

const promoProducts = [
  {
    image: 'https://images.unsplash.com/photo-1603732133854-4eb5f41d1fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjBzbWFydHBob25lfGVufDF8fHx8MTc2Nzk5MTc2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'iPhone 15 Pro',
    discount: '80%',
    color: 'from-purple-600/20 to-pink-600/20',
  },
  {
    image: 'https://images.unsplash.com/photo-1691449808001-bb8c157f0094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwcGhvbmV8ZW58MXx8fHwxNzY3OTMyMDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Samsung S24 Ultra',
    discount: '75%',
    color: 'from-blue-600/20 to-cyan-600/20',
  },
  {
    image: 'https://images.unsplash.com/photo-1697981812520-d1e056308e52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHh4aWFvbWklMjBzbWFydHBob25lfGVufDF8fHx8MTc2ODAzODIxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Xiaomi 14 Pro',
    discount: '70%',
    color: 'from-orange-600/20 to-red-600/20',
  },
  {
    image: 'https://images.unsplash.com/photo-1603732133854-4eb5f41d1fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjBzbWFydHBob25lfGVufDF8fHx8MTc2Nzk5MTc2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'OnePlus 12',
    discount: '65%',
    color: 'from-green-600/20 to-emerald-600/20',
  },
  {
    image: 'https://images.unsplash.com/photo-1691449808001-bb8c157f0094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwcGhvbmV8ZW58MXx8fHwxNzY3OTMyMDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Google Pixel 8',
    discount: '60%',
    color: 'from-indigo-600/20 to-violet-600/20',
  },
];

export function PromoBanner() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#037166]/20 to-purple-600/20 border border-[#037166]/30 mb-4"
          >
            <Tag className="w-4 h-4 text-[#04a99d]" />
            <h6 className="text-sm font-medium text-[#04a99d]">LIMITED TIME OFFER</h6>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white via-[#04a99d] to-purple-400 bg-clip-text text-transparent">
              Repair & Save Big
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg"
          >
            Get your devices repaired at unbeatable prices—up to 80% off!
          </motion.p>
        </div>

        {/* Auto-scrolling Carousel */}
        <div className="relative">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
            className="flex gap-6"
          >
            {[...promoProducts, ...promoProducts].map((product, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex-shrink-0 w-72 cursor-pointer group"
              >
                <div className={`relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br ${product.color} backdrop-blur-sm border border-white/10`}>
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <motion.div
                      animate={{
                        rotate: [-5, 5, -5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-lg shadow-xl"
                    >
                      <h6 className="text-inherit font-intro">Up to {product.discount} OFF</h6>
                    </motion.div>
                  </div>

                  {/* Product Image */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                      whileHover={{ rotate: 5 }}
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                  {/* Product Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors">
                      {product.name}
                    </h4>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-[#04a99d] font-medium text-sm"
                    >
                      Repair Now
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Glow Effect on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 to-transparent pointer-events-none"
                  />

                  {/* Glass Border */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 rounded-3xl border-2 border-[#037166]/50 pointer-events-none"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
