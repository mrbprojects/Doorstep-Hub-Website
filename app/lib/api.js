// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi';
const SERVICES_ENDPOINT = '/app/applience-repairs-website/all-services';

/**
 * Fetch all services from the API
 * @returns {Promise<Array>} Array of service objects
 */
export async function fetchAllServices() {
    const response = await fetch(`${API_BASE_URL}${SERVICES_ENDPOINT}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
        return data.data;
    }

    throw new Error(data.message || 'Failed to fetch services');
}

/**
 * Fetch featured services from the API
 * @returns {Promise<Array>} Array of featured service objects
 */
export async function fetchFeaturedServices() {
    const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/featured_services`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.updatedServices)) {
        try {
            // Fetch all services to get correct slugs for enrichment
            const allServices = await fetchAllServices();
            return data.updatedServices.map(service => {
                if (service.slug) return service;
                // Match by ID or name
                const matched = allServices.find(as => as._id === service._id || as.serviceName === service.serviceName);
                return matched ? { ...service, slug: matched.slug } : service;
            });
        } catch (error) {
            console.error("Error enriching featured services with slugs:", error);
            return data.updatedServices;
        }
    }

    throw new Error(data.message || 'Failed to fetch featured services');
}

/**
 * Convert service name to URL slug
 * @param {string} serviceName - The service name from API
 * @returns {string} URL-safe slug
 */
export function getServiceSlug(serviceName) {
    const slugMap = {
        'APPLIANCE SERVICE': 'appliances',
        'PG Hostels': 'pg-hostel',
        'Religious Services': 'religious',
        'Spa Salons': 'spa-salon',
        'Daily Needs': 'daily-needs',
        'MEDICINE': 'medicine',
        'PARCEL': 'parcel',
    };

    return slugMap[serviceName] || serviceName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Image loader for Next.js Image component
 * @param {Object} config - Loader configuration
 * @returns {string} Full image URL
 */
export function imageLoader({ src }) {
    if (src.startsWith('http')) {
        return src;
    }
    return `https://api.doorstephub.com/${src}`;
}
