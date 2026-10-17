'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, Wind, Refrigerator, ShieldCheck, Zap } from 'lucide-react';

const GlobalLoaderContext = createContext({
    showLoader: () => {},
    hideLoader: () => {},
    isLoading: false,
});

const SERVICE_ICONS = [
    { id: 'appliance', icon: Wrench, label: 'Appliance Repair', color: '#007F70' },
    { id: 'ac', icon: Wind, label: 'AC & Cooling', color: '#00594F' },
    { id: 'fridge', icon: Refrigerator, label: 'Refrigerator Care', color: '#0ABF83' },
    { id: 'safety', icon: ShieldCheck, label: 'Verified Technician', color: '#007F70' },
];

export function GlobalLoaderProvider({ children }) {
    const [loaderState, setLoaderState] = useState({
        isOpen: false,
        title: 'Processing Your Request...',
        subtitle: 'Please wait while we connect with verified technicians',
    });
    const [currentIconIndex, setCurrentIconIndex] = useState(0);

    const showLoader = (options = {}) => {
        setLoaderState({
            isOpen: true,
            title: options.title || 'Processing Your Request...',
            subtitle: options.subtitle || 'Please wait while we connect with verified technicians',
        });
    };

    const hideLoader = () => {
        setLoaderState(prev => ({ ...prev, isOpen: false }));
    };

    // Cycle through service icons smoothly while open
    useEffect(() => {
        let interval;
        if (loaderState.isOpen) {
            interval = setInterval(() => {
                setCurrentIconIndex(prev => (prev + 1) % SERVICE_ICONS.length);
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [loaderState.isOpen]);

    const CurrentIcon = SERVICE_ICONS[currentIconIndex].icon;

    return (
        <GlobalLoaderContext.Provider value={{ showLoader, hideLoader, isLoading: loaderState.isOpen }}>
            {children}
            <AnimatePresence>
                {loaderState.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 10 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-4 overflow-hidden"
                        >
                            {/* Glowing Background Radial */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#007F70]/10 blur-xl pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#0ABF83]/10 blur-xl pointer-events-none" />

                            {/* Center Animated Service Icons Ring */}
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                {/* Pulsing Radar Wave 1 */}
                                <div className="absolute inset-0 rounded-full border-2 border-[#007F70]/30 animate-ping opacity-30" />
                                {/* Rotating Dual Ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#007F70] border-r-[#0ABF83] animate-spin" />
                                
                                {/* Inner Icon Circle with Spring transition */}
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00594F] to-[#007F70] text-white flex items-center justify-center shadow-md">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={SERVICE_ICONS[currentIconIndex].id}
                                            initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            exit={{ scale: 0.4, opacity: 0, rotate: 30 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <CurrentIcon className="w-7 h-7 text-white" />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Service Category Chip */}
                            <div className="px-3 py-1 rounded-full bg-[#DDF5EF] border border-[#B2E7DB] text-[#007F70] text-[11px] font-extrabold uppercase tracking-wider">
                                {SERVICE_ICONS[currentIconIndex].label}
                            </div>

                            {/* Headings */}
                            <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-black text-[#102B35] leading-snug">
                                    {loaderState.title}
                                </h3>
                                <p className="text-xs text-[#647B8D] leading-relaxed">
                                    {loaderState.subtitle}
                                </p>
                            </div>

                            {/* Indeterminate Progress Line */}
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#00594F] via-[#007F70] to-[#0ABF83] rounded-full"
                                    animate={{
                                        x: ['-100%', '100%'],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.4,
                                        ease: 'easeInOut',
                                    }}
                                    style={{ width: '60%' }}
                                />
                            </div>

                            {/* Security Micro-Badge */}
                            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 pt-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#007F70]" />
                                100% Verified Doorstep Service
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlobalLoaderContext.Provider>
    );
}

export function useGlobalLoader() {
    return useContext(GlobalLoaderContext);
}
