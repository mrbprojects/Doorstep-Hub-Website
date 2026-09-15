import React from 'react';
import TermsConditionsClient from './TermsConditionsClient';
import { API_BASE_URL } from '@/config/env';

export const revalidate = 3600;

export const metadata = {
    title: 'Terms of Service | Doorstep Hub',
    description: 'Review the official terms of service, platform rules, and user obligations governing Doorstep Hub.',
    alternates: {
        canonical: 'https://doorstephub.com/terms-conditions',
    },
};

export default async function TermsConditionsPage() {
    let initialContent = null;

    try {
        const response = await fetch(
            `${API_BASE_URL}/app/products/privacy-policies?applicationType=customer%20app`,
            { next: { revalidate: 3600 } }
        );
        const data = await response.json();
        if (data.success && data.data) {
            initialContent = data.data;
        }
    } catch (err) {
        console.error('Error prefetching terms on server:', err);
    }

    return <TermsConditionsClient initialContent={initialContent} />;
}
