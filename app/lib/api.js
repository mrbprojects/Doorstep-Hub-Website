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

/**
 * Fetch cities list from the API
 * @param {string} searchQuery - Optional search query to filter cities
 * @returns {Promise<Array>} Array of city objects
 */
export async function fetchCities(searchQuery = '') {
    const url = searchQuery 
        ? `${API_BASE_URL}/app/cities/cities_list?searchQuery=${encodeURIComponent(searchQuery)}`
        : `${API_BASE_URL}/app/cities/cities_list`;
        
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.cities)) {
        return data.cities;
    }

    throw new Error(data.message || 'Failed to fetch cities');
}
/**
 * Fetch all categories for appliances
 * @param {Object} location - Optional location with lat and lng
 * @returns {Promise<Array>} Array of category objects
 */
export async function fetchCategories(location = null) {
    const body = location ? {
        lattitude: location.lat?.toString(),
        longitude: location.lng?.toString()
    } : {};

    const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
        return data.data;
    }

    throw new Error(data.message || 'Failed to fetch categories');
}

/**
 * Fetch all brands
 * @param {string} searchQuery - Optional search query for brands
 * @returns {Promise<Array>} Array of brand objects
 */
export async function fetchAllBrands(categoryId = '', searchQuery = '') {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (searchQuery) params.set('searchQuery', searchQuery);

    const queryStr = params.toString();
    const url = queryStr
        ? `${API_BASE_URL}/app/brands/all_brands?${queryStr}`
        : `${API_BASE_URL}/app/brands/all_brands`;




    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.brands)) {
        return data.brands;
    }

    throw new Error(data.message || 'Failed to fetch brands');
}

/**
 * Fetch services by brand name
 * @param {string} brandName - Name of the brand
 * @returns {Promise<Array>} Array of service objects
 */
export async function fetchServicesByBrand(brandName) {
    const response = await fetch(`${API_BASE_URL}/app/brands/brand/${encodeURIComponent(brandName.toLowerCase())}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.services)) {
        return data.services;
    }

    throw new Error(data.message || 'Failed to fetch services for brand');
}

/**
 * Fetch all authorized services
 * @returns {Promise<Array>} Array of authorized service objects
 */
export async function fetchAuthorizedServices() {
    const response = await fetch(`${API_BASE_URL}/app/authorized-services/all_authorized_services`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.services)) {
        return data.services;
    }

    throw new Error(data.message || 'Failed to fetch authorized services');
}

/**
 * Fetch authorized services with optional filters
 * @param {Object} filters
 * @param {string} [filters.citySlug]
 * @param {string} [filters.categorySlug]
 * @returns {Promise<Array>} Array of authorized service objects
 */
export async function fetchAuthorizedServicesByFilters(filters = {}) {
    const params = new URLSearchParams();
    if (filters.citySlug) params.set('citySlug', filters.citySlug);
    if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);

    const query = params.toString();
    const url = query
        ? `${API_BASE_URL}/app/authorized-services/all_authorized_services?${query}`
        : `${API_BASE_URL}/app/authorized-services/all_authorized_services`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.services)) {
        return data.services;
    }

    throw new Error(data.message || 'Failed to fetch authorized services');
}

/**
 * Fetch nearest authorized services based on location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Array>} Array of authorized service objects
 */
export async function fetchNearestAuthorizedServices(lat, lng) {
    const response = await fetch(`${API_BASE_URL}/app/authorized-services/nearest_authorized_services`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            lattitude: lat,
            longitude: lng
        }),
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.services)) {
        return data.services;
    }

    throw new Error(data.message || 'Failed to fetch nearest authorized services');
}
