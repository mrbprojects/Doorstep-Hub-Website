'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Store, X } from 'lucide-react';

export function ServiceTypeSelectionModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#333] rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-6 text-center border-b border-[#333] bg-[#111]">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 rounded-full hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-2xl font-bold text-white">What are you looking for?</h3>
                        <p className="text-gray-400 mt-1">Select the type of service you need</p>
                    </div>

                    {/* Options */}
                    <div className="p-6 grid gap-4">
                        {/* Verified Partner Option */}
                        <button
                            onClick={() => onSelect('partner')}
                            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-[#333] hover:border-[#037166] hover:bg-[#037166]/10 transition-all duration-300 text-left"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#037166]/20 flex items-center justify-center group-hover:bg-[#037166] transition-colors border border-[#037166]/30">
                                <ShieldCheck className="w-6 h-6 text-[#037166] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white group-hover:text-[#04a99d] transition-colors">Verified Partner</h4>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300">Book certified professionals for doorstep service</p>
                            </div>
                        </button>

                        {/* Service Center Option */}
                        <button
                            onClick={() => onSelect('center')}
                            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-[#333] hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300 text-left"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors border border-blue-500/30">
                                <Store className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Service Center</h4>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300">Find nearby authorized service centers</p>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-[#111] border-t border-[#333] text-center text-xs text-gray-500">
                        DoorstepHub • Trusted Services
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
