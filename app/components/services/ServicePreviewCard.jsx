'use client';

import React from 'react';
import { motion } from 'motion/react';

export function ServicePreviewCard({ service, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group cursor-pointer"
    >
      <div className="w-48 h-64 rounded-2xl overflow-hidden bg-[#1a1a1a]/90 backdrop-blur-xl border border-[#037166]/30 shadow-xl relative group-hover:border-[#037166]/50 transition-colors duration-300">
        <div className="relative h-full">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

          {/* Hover Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-[#037166]/40 to-transparent transition-opacity duration-300"
          />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-center mb-1 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-poppins">
              {service.title}
            </h3>
            <div className="h-0.5 w-0 bg-gradient-to-r from-[#037166] via-white to-[#037166] mx-auto group-hover:w-16 transition-all duration-300" />
          </div>

          {/* Glass Effect Border on Hover */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl border-2 border-[#037166]/50 pointer-events-none"
          /> */}
        </div>
      </div>
    </motion.div>
  );
}
