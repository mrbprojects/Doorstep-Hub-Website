import React from 'react';
import PrivacyPolicyClient from './PrivacyPolicyClient';
import { API_BASE_URL } from '@/config/env';

export const revalidate = 3600;

export const metadata = {
    title: 'Privacy Policy | Doorstep Hub',
    description: 'Learn how Doorstep Hub collects, protects, manages, and respects your personal, transaction, and device data across our digital ecosystem.',
    alternates: {
        canonical: 'https://doorstephub.com/privacy-policy',
    },
};

export default async function PrivacyPolicyPage() {
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
        console.error('Error prefetching privacy policy on server:', err);
    }

    return <PrivacyPolicyClient initialContent={initialContent} />;
}
