'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Clock, Info } from 'lucide-react';

export default function TermsConditions() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTermsConditions = async () => {
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/privacy-policies?applicationType=customer%20app');
                const data = await response.json();
                if (data.success) {
                    setContent(data.data);
                } else {
                    setError('Failed to load terms and conditions');
                }
            } catch (err) {
                console.error('Error fetching terms:', err);
                setError('An error occurred while fetching the terms and conditions');
            } finally {
                setLoading(false);
            }
        };

        fetchTermsConditions();
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 w-3/4 bg-gray-800 rounded mx-auto"></div>
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-gray-800 rounded"></div>
                        <div className="h-4 w-full bg-gray-800 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
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
                className="space-y-8"
            >
                {/* Header */}
                <div className="text-center space-y-4 border-b border-white/10 pb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#037166]/10 border border-[#037166]/20 mb-4">
                        <FileText className="w-8 h-8 text-[#037166]" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-white to-[#037166] bg-clip-text text-transparent">
                        Terms & Conditions
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Last Updated: {new Date(content?.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            <span>v{content?.__v || '1.0'}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-invert max-w-none">
                    <div
                        className="text-gray-300 leading-relaxed space-y-6"
                        dangerouslySetInnerHTML={{ __html: content?.termsAndConditions }}
                    />
                </div>

                {/* Footer Info */}
                <div className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <h3 className="text-xl font-bold mb-4">Need Clarification?</h3>
                    <p className="text-gray-400 mb-6">
                        By using Doorstep Hub, you agree to these terms. If you have any questions, please reach out.
                    </p>
                    <a
                        href="mailto:help@doorstephub.com"
                        className="text-2xl font-bold text-[#037166] hover:text-[#04a99d] transition-colors"
                    >
                        help@doorstephub.com
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
