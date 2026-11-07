import { API_BASE_URL, IMAGE_BASE_URL, getImageUrl as resolveMediaUrl } from '@/config/env';

const SERVICES_ENDPOINT = '/app/applience-repairs-website/all-services';

/** Same service id as customer app BookService / category banner */
export const HOME_APPLIANCE_SERVICE_ID = '683daaa8f261c1548bdf7442';

export { resolveMediaUrl };

const DEFAULT_BANNER_PATH = 'default_image.jpg';

function isUsableBannerPath(path) {
    if (!path || typeof path !== 'string') return false;
    return !path.includes(DEFAULT_BANNER_PATH);
}

/**
 * Home / hero carousel banners — same API as customer app (homeService.getBanners).
 * POST /app/servicedoc/getallserviceBanners → services[].bannerImage
 */
export async function fetchServiceBanners(token) {
    try {
        const tokenVal = token || (typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('user_token')) : null);
        if (!tokenVal) {
            // Endpoint strictly requires an authenticated session; return empty for guest visitors
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/app/servicedoc/getallserviceBanners`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenVal}`
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) return [];

        const data = await response.json();
        const services = Array.isArray(data?.services) ? data.services : [];

        return services
            .filter((item) => isUsableBannerPath(item?.bannerImage))
            .map((item) => ({
                id: item._id || item.name || item.bannerImage,
                imageUrl: resolveMediaUrl(item.bannerImage),
                title: item.name || '',
                description: item.additionalText || item.shortDescription || '',
            }));
    } catch (error) {
        console.error('fetchServiceBanners failed:', error);
        return [];
    }
}

/**
 * Appliance category hero banners — same API as customer app (bookServiceApi.getCategoryBanner).
 * POST /app/products/getallcategorys → serviceBanners[].bannerImage
 */
export async function fetchApplianceServiceBanners(
    serviceId = HOME_APPLIANCE_SERVICE_ID,
) {
    try {
        const response = await fetch(`${API_BASE_URL}/app/products/getallcategorys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceId }),
        });

        if (!response.ok) return [];

        const data = await response.json();
        const serviceBanners = Array.isArray(data?.serviceBanners) ? data.serviceBanners : [];

        return serviceBanners
            .filter((item) => isUsableBannerPath(item?.bannerImage))
            .map((item) => ({
                id: item._id || item.name || item.bannerImage,
                imageUrl: resolveMediaUrl(item.bannerImage),
                title: item.name || '',
                description: item.additionalText || item.shortDescription || item.description || '',
            }));
    } catch (error) {
        console.error('fetchApplianceServiceBanners failed:', error);
        return [];
    }
}

/** @deprecated Use fetchApplianceServiceBanners — returns first banner URL or null */
export async function fetchApplianceServiceBanner(
    serviceId = HOME_APPLIANCE_SERVICE_ID,
) {
    const banners = await fetchApplianceServiceBanners(serviceId);
    return banners[0]?.imageUrl ?? null;
}

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
 * Fetch featured services from the dynamic backend API
 * @returns {Promise<Array>} Array of featured service objects
 */
export async function fetchFeaturedServices(location = null) {
    try {
        const payload = (location?.lat && location?.lng) ? {
            lattitude: location.lat,
            longitude: location.lng
        } : {};

        const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/featured_services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.updatedServices)) {
            return data.updatedServices;
        }

        return [];
    } catch (error) {
        console.error("Error fetching featured services from backend:", error);
        return [];
    }
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
 * Image loader for Next.js Image component & img elements
 * @param {Object} config - Loader configuration
 * @returns {string} Full image URL
 */
export function imageLoader({ src }) {
    if (!src) return 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) {
        return src;
    }
    const cleanSrc = String(src).replace(/^\/+/, '');
    const base = (IMAGE_BASE_URL || process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com').replace(/\/+$/, '');
    return `${base}/${cleanSrc}`;
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
 * Fetch subcategories for an appliance category by slug
 * @param {string} slug - Category slug
 * @param {Object|null} location - Optional location with lat and lng
 * @returns {Promise<Array>} Array of subcategory objects
 */
export async function fetchSubcategoriesByCategorySlug(slug, location = null) {
    const body = {
        slug,
        ...(location ? {
            lattitude: location.lat?.toString(),
            longitude: location.lng?.toString()
        } : {})
    };

    const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
        return data.data;
    }

    throw new Error(data.message || 'Failed to fetch subcategories');
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
        if (response.status === 404) {
            // Brand has no legacy direct services; return empty list so caller falls back to authorized services
            return [];
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.services)) {
        return data.services;
    }

    return [];
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
    if (filters.brandId) params.set('brandId', filters.brandId);

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
