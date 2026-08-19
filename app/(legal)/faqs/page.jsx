'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, MessageSquare, User, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '@/config/env';

export default function FAQPage() {
    const [activeTab, setActiveTab] = useState('customer app');
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [globalSettings, setGlobalSettings] = useState(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/app/products/faqs?applicationType=${encodeURIComponent(activeTab)}`);
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
    }, [activeTab]);

    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/app/get_global_settings`);
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

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 bg-white text-gray-900">
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
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-[#123F4A]">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-base">
                        Find answers to common questions about Doorstep Hub services, bookings, and more.
                    </p>
                </div>

                {/* FAQ Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {[
                        { id: 'customer app', label: 'Customer', icon: User },
                        { id: 'service app', label: 'Service Provider', icon: Briefcase }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setActiveIndex(null); // Reset accordion on tab change
                                setError(null); // Reset error on tab change
                            }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${activeTab === tab.id
                                ? 'bg-[#037166] text-white border-[#037166] shadow-lg shadow-[#037166]/20'
                                : 'bg-slate-100 text-gray-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold text-red-500 mb-4">{error}</h2>
                        <button
                            onClick={() => setActiveTab(activeTab)} // Retrigger useEffect
                            className="px-6 py-2 bg-[#037166] rounded-lg text-white font-medium hover:bg-[#04a99d] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 italic">No questions found for this category.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={faq._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${activeIndex === index
                                    ? 'bg-slate-50 border-[#037166]/40 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                                >
                                    <span className="text-lg font-semibold text-gray-900">
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
                                            <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-slate-100 pt-4 text-base">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Support Section */}
                <div className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center relative overflow-hidden shadow-sm">
                    <MessageSquare className="w-10 h-10 text-[#037166] mx-auto mb-4" />
                    <h3 className="text-2xl text-gray-900 font-bold mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Can't find the answer you're looking for? Please chat with our friendly team.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`mailto:${globalSettings?.email || "help@doorstephub.com"}`}
                            className="px-8 py-3 bg-[#037166] hover:bg-[#04a99d] text-white font-bold rounded-xl transition-all shadow-md shadow-[#037166]/20"
                        >
                            {globalSettings?.email2 || "Email Support"}
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

