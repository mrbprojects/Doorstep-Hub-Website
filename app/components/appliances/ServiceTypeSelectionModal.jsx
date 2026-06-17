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
                    className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm pointer-events-none"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="relative p-8 text-center border-b border-gray-50 bg-white">
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">How can we help?</h3>
                        <p className="text-gray-500 mt-2 font-medium">Select Your Preferred Service Type</p>
                    </div>

                    {/* Options */}
                    <div className="p-8 grid gap-4">
                        {/* Verified Partner Option */}
                        <button
                            onClick={() => onSelect('partner')}
                            className="group relative flex items-center gap-5 p-6 rounded-[1.5rem] bg-white border border-gray-100 hover:border-[#037166]/30 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 text-left"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#037166]/10 flex items-center justify-center group-hover:bg-[#037166] transition-all duration-300 border border-[#037166]/20">
                                <ShieldCheck className="w-7 h-7 text-[#037166] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight">On Demand Appliance Repair</h4>
                                <p className="text-sm text-gray-500 font-medium">Near by local Technicians</p>
                            </div>
                        </button>

                        {/* Service Center Option */}
                         <button
                            onClick={() => onSelect('center')}
                            className="group relative flex items-center gap-5 p-6 rounded-[1.5rem] bg-white border border-gray-100 hover:border-[#037166]/30 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 text-left"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#037166]/10 flex items-center justify-center group-hover:bg-[#037166] transition-all duration-300 border border-[#037166]/20">
                                <Store className="w-7 h-7 text-[#037166] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight">Near by Verified Providers</h4>
                                <p className="text-sm text-gray-500 font-medium">Find and book nearby service centers</p>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Doorstep Hub • India's Trusted Doorstep Service Provider
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
