'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Check } from 'lucide-react';

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Doorstep Hub',
        description: 'Let us show you around directly from your pocket. Your journey starts here!',
        target: null, // Center modal
    },
    {
        id: 'navbar-services',
        title: 'Explore Services',
        description: 'Browse our wide range of professional services, from repairs to spiritual guidance.',
        target: 'navbar-services',
        placement: 'bottom',
    },
    {
        id: 'location-bar',
        title: 'Set Your Location',
        description: 'Choose your area to see verified experts available near you right now.',
        target: 'location-bar', // Ensure this ID exists in Header -> LocationBar wrapper
        placement: 'bottom',
    },
    {
        id: 'booking-services',
        title: 'Instant Booking',
        description: 'Book verified professionals in just a few taps. Fast, secure, and reliable.',
        target: 'booking-services',
        placement: 'top',
    },
    {
        id: 'app-download',
        title: 'Get the App',
        description: 'For the best experience, download our mobile app. Everything you need, right in your pocket.',
        target: 'app-download',
        placement: 'top',
    },
];

export function WebsiteTour() {
    const [currentStep, setCurrentStep] = useState(-1); // -1: Not started
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if tour has been seen
        const seen = localStorage.getItem('dhub_tour_completed');
        if (!seen) {
            // Start tour
            setTimeout(() => {
                setCurrentStep(0);
                setIsVisible(true);
            }, 1500); // Slight delay after page load
        }
    }, []);

    useEffect(() => {
        if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
            const step = TOUR_STEPS[currentStep];

            if (step.target) {
                // Find target
                const element = document.getElementById(step.target);
                if (element) {
                    // Scroll to element with offset
                    const rect = element.getBoundingClientRect();
                    const scrollTop = window.scrollY || document.documentElement.scrollTop;

                    // Scroll logic
                    window.scrollTo({
                        top: rect.top + scrollTop - 200, // Offset for header/visibility
                        behavior: 'smooth',
                    });

                    // Update tooltip position (simple centering for now, can be improved)
                    // Wait for scroll? Usually better to use ResizeObserver or just recalc after delay
                    setTimeout(() => {
                        const updatedRect = element.getBoundingClientRect();
                        // Just center it horizontally on the element, position vertically based on placement
                        let top = 0;
                        let left = updatedRect.left + (updatedRect.width / 2);

                        if (step.placement === 'bottom') {
                            top = updatedRect.bottom + 20;
                        } else {
                            top = updatedRect.top - 200; // Place above
                        }

                        // Clamp to viewport
                        setPosition({
                            top: Math.max(100, top + scrollTop), // Absolute position
                            left: left
                        });
                    }, 500);

                } else {
                    console.warn(`Tour target ${step.target} not found`);
                }
            }
        }
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('dhub_tour_completed', 'true');
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];
    const isModal = step.target === null;

    return (
        <AnimatePresence>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 pointer-events-none"
            />

            {/* Spotlight for targeted steps (Optional, simple implementation just uses modal over dark bg) */}

            {/* Tour Card */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring" }}
                style={isModal ? {} : {
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    transform: 'translateX(-50%)'
                }}
                className={`z-[101] w-full max-w-sm p-6 bg-[#0a0f0d] border border-[#037166]/40 rounded-2xl shadow-2xl shadow-[#037166]/20 
          ${isModal ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'absolute -translate-x-1/2'}
        `}
            >
                {/* Progress */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[#037166] text-xs font-bold tracking-widest uppercase">
                        Step {currentStep + 1} of {TOUR_STEPS.length}
                    </span>
                    <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                    {step.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {TOUR_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-[#037166]' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#037166] to-[#02b39a] text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-[#037166]/20 transition-all"
                    >
                        {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                        {currentStep === TOUR_STEPS.length - 1 ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                </div>

                {/* Arrow (Visual enhancement for non-modal) */}
                {!isModal && (
                    <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0a0f0d] border-l border-t border-[#037166]/40 rotate-45 
                ${step.placement === 'bottom' ? '-top-2' : '-bottom-2 border-l-0 border-t-0 border-r border-b'}
            `} />
                )}

            </motion.div>
        </AnimatePresence>
    );
}
