import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ContactUsClient from './ContactUsClient';
import { API_BASE_URL } from '@/config/env';
import { getBreadcrumbSchema, getOrganizationSchema } from '@/lib/seo/schemaGenerator';

export const revalidate = 3600;

export default async function ContactUsPage() {
    let settings = null;

    try {
        const res = await fetch(`${API_BASE_URL}/app/get_global_settings`, {
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        if (data.success && data.policy) {
            settings = data.policy;
        }
    } catch (err) {
        console.error('Error prefetching global settings on server:', err);
    }

    // Structured Data
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Contact Us', url: '/contact-us' }
    ]);

    const organizationSchema = getOrganizationSchema();

    const contactPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        'name': 'Contact Doorstep Hub',
        'description': 'Contact Doorstep Hub for doorstep appliance repairs, home services, support tickets, and service partner inquiries.',
        'url': 'https://doorstephub.com/contact-us',
        'mainEntity': {
            '@type': 'LocalBusiness',
            'name': 'Doorstep Hub',
            'telephone': settings?.phone ? `+91-${settings.phone}` : '+91-8886688666',
            'email': settings?.email || 'support@doorstephub.com',
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': settings?.address || 'Panjagutta',
                'addressLocality': 'Hyderabad',
                'addressRegion': 'Telangana',
                'addressCountry': 'IN'
            }
        }
    };

    return (
        <div className="bg-white min-h-screen text-slate-900 font-sans flex flex-col justify-between">
            {/* Structured Data for SEO */}
            {breadcrumbSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            )}
            {organizationSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
            )}
            {contactPageSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
                />
            )}

            <Header />
            <main className="pt-16 sm:pt-20 pb-4 flex-grow">
                <ContactUsClient initialSettings={settings} />
            </main>
            <Footer />
        </div>
    );
}
