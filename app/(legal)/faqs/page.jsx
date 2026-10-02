import React, { Suspense } from 'react';
import FaqPageClient from './FaqPageClient';
import { API_BASE_URL } from '@/config/env';
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/schemaGenerator';

export const revalidate = 3600;

export default async function FAQPage() {
    let initialFaqs = [];

    try {
        const response = await fetch(
            `${API_BASE_URL}/app/products/faqs?applicationType=customer%20app`,
            { next: { revalidate: 3600 } }
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            // Only published / active FAQs
            initialFaqs = data.data.filter(item => item.status !== 'inactive' && item.status !== 'archived');
        }
    } catch (err) {
        console.error('Error prefetching FAQs on server:', err);
    }

    // Build Structured Data
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Legal', url: '/terms-conditions' },
        { name: 'FAQs', url: '/faqs' }
    ]);

    const faqSchema = getFAQSchema(initialFaqs);

    return (
        <>
            {/* JSON-LD Structured Data for SEO */}
            {breadcrumbSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            )}
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}

            <Suspense
                fallback={
                    <div className="py-12 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                        <div className="h-64 w-full bg-slate-200 rounded-3xl animate-pulse" />
                        <div className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse" />
                    </div>
                }
            >
                <FaqPageClient initialFaqs={initialFaqs} />
            </Suspense>
        </>
    );
}
