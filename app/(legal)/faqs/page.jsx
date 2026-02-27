'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';

export default function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [globalSettings, setGlobalSettings] = useState(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/faqs?applicationType=customer%20app');
                const data = await response.json();
                if (data.success) {
                    setFaqs(data.data);
                } else {
                    setError('Failed to load FAQs');
                }
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setError('An error occurred while fetching the FAQs');
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/get_global_settings');
                const data = await response.json();
                if (data.success && data.policy) {
                    setGlobalSettings(data.policy);
                }
            } catch (error) {
                console.error("Error fetching global settings:", error);
            }
        };
        fetchGlobalSettings();
    }, []);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 w-3/4 bg-gray-800 rounded mx-auto"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 w-full bg-gray-800 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#037166] rounded-lg text-white font-medium"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#037166]/10 border border-[#037166]/20 mb-4">
                        <HelpCircle className="w-8 h-8 text-[#037166]" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-white to-[#037166] bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Find answers to common questions about Doorstep Hub services, bookings, and more.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${activeIndex === index
                                ? 'bg-white/5 border-[#037166]/50 shadow-lg shadow-[#037166]/5'
                                : 'bg-transparent border-white/10 hover:border-white/20'
                                }`}
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                            >
                                <span className="text-lg font-medium text-white/90">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-[#037166] transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Support Section */}
                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#037166]/20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#037166]/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#037166]/20 transition-colors"></div>

                    <MessageSquare className="w-10 h-10 text-[#037166] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Can't find the answer you're looking for? Please chat with our friendly team.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`mailto:${globalSettings?.email || "help@doorstephub.com"}`}
                            className="px-8 py-3 bg-[#037166] hover:bg-[#04a99d] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#037166]/20"
                        >
                            {globalSettings?.email || "Email Support"}
                        </a>
                        <a
                            href="/contact"
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
