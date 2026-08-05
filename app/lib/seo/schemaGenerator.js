/**
 * JSON-LD Structured Data Engine
 * Generates verified schema graphs for Doorstep Hub entity types.
 */

const BASE_URL = 'https://doorstephub.com';
const LOGO_URL = 'https://doorstephub.com/logo.png';

/**
 * Generates Organization Schema
 */
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Doorstep Hub',
        'url': BASE_URL,
        'logo': LOGO_URL,
        'sameAs': [
            'https://www.facebook.com/doorstephub',
            'https://twitter.com/doorstephub',
            'https://www.instagram.com/doorstephub'
        ],
        'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+91-8886688666',
            'contactType': 'customer service',
            'areaServed': 'IN',
            'availableLanguage': ['English', 'Hindi', 'Telugu']
        }
    };
}

/**
 * Generates Service / LocalBusiness Schema
 */
export function getServiceSchema({ name, description, city, image, priceRange = '₹₹' }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': name || 'Doorstep Hub Home Services',
        'description': description || 'Professional doorstep home repair and lifestyle services across India.',
        'image': image || LOGO_URL,
        'url': BASE_URL,
        'telephone': '+91-8886688666',
        'priceRange': priceRange,
        'address': {
            '@type': 'PostalAddress',
            'addressLocality': city || 'Hyderabad',
            'addressCountry': 'IN'
        }
    };
}

/**
 * Generates BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items = []) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
        }))
    };
}

/**
 * Generates FAQPage Schema for visible FAQs
 */
export function getFAQSchema(faqs = []) {
    if (!faqs || faqs.length === 0) return null;
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };
}
