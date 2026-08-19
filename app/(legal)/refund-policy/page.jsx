'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Clock, FileCheck } from 'lucide-react';

import { API_BASE_URL } from '@/config/env';

export default function RefundPolicy() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRefundPolicy = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/app/products/privacy-policies?applicationType=customer%20app`);
                const data = await response.json();
                if (data.success) {
                    setContent(data.data);
                } else {
                    setError('Failed to load refund policy');
                }
            } catch (err) {
                console.error('Error fetching refund policy:', err);
                setError('An error occurred while fetching the refund policy');
            } finally {
                setLoading(false);
            }
        };

        fetchRefundPolicy();
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 w-3/4 bg-slate-200 rounded mx-auto"></div>
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-slate-200 rounded"></div>
                        <div className="h-4 w-full bg-slate-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
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
                    className="px-6 py-2 bg-[#037166] rounded-lg text-white font-medium hover:bg-[#025951] transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 text-slate-800 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="text-center space-y-4 border-b border-slate-200 pb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#037166]/10 border border-[#037166]/20 mb-4">
                        <CreditCard className="w-8 h-8 text-[#037166]" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-[#037166] bg-clip-text text-transparent">
                        Refund &amp; Cancellation Policy
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Last Updated: {content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4" />
                            <span>v{content?.__v || '1.0'}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                    <div
                        className="leading-relaxed space-y-6 text-slate-800 [&_*]:text-slate-800 [&_h1]:text-slate-900 [&_h1]:font-black [&_h2]:text-slate-900 [&_h2]:font-bold [&_h3]:text-slate-900 [&_h3]:font-bold [&_strong]:text-slate-900 [&_strong]:font-bold [&_p]:text-slate-700 [&_p]:leading-relaxed [&_li]:text-slate-700 [&_a]:text-[#037166] [&_a]:underline text-base"
                        dangerouslySetInnerHTML={{ __html: content?.refundPolicy }}
                    />
                </div>

                {/* Footer Info */}
                <div className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                    <h3 className="text-xl text-slate-900 font-bold mb-4">Need Refund Help?</h3>
                    <p className="text-slate-600 mb-6">
                        For any refund or cancellation requests, please contact our support team.
                    </p>
                    <a
                        href="mailto:help@doorstephub.com"
                        className="text-2xl font-bold text-[#037166] hover:text-[#025951] transition-colors"
                    >
                        help@doorstephub.com
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
