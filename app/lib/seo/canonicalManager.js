/**
 * Canonical URL Governance Manager
 * Normalizes and produces single canonical URL target for all public route families.
 */

const BASE_URL = 'https://doorstephub.com';

/**
 * Returns a clean, normalized canonical URL for a given path or relative path.
 * Enforces HTTPS, non-www, lowercase, trailing slash removal, and query string stripping.
 */
export function getCanonicalUrl(path = '') {
    if (!path) return BASE_URL;

    try {
        let rawPath = path;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            const urlObj = new URL(path);
            rawPath = urlObj.pathname;
        }

        // Lowercase path
        let cleanedPath = rawPath.toLowerCase();

        // Strip tracking / query parameters
        cleanedPath = cleanedPath.split('?')[0].split('#')[0];

        // Strip trailing slash except for root '/'
        if (cleanedPath.length > 1 && cleanedPath.endsWith('/')) {
            cleanedPath = cleanedPath.slice(0, -1);
        }

        // Return unified canonical target
        return `${BASE_URL}${cleanedPath}`;
    } catch (e) {
        return BASE_URL;
    }
}

function categorySlugToPublicPart(categorySlug = '') {
    const slug = String(categorySlug || '').trim().toLowerCase();
    if (!slug) return '';
    if (slug.endsWith('-services')) {
        return slug.slice(0, -'-services'.length);
    }
    return slug;
}

function normalizeSlug(str = '') {
    return String(str || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^\/+|\/+$/g, '');
}

/**
 * Single Centralized Canonical URL Builder for all Doorstep Hub Route Families
 * @param {string} entityType - Entity classification (STATIC, MAIN_SERVICE, CITY, CATEGORY, CATEGORY_CITY, BRAND, BRAND_CITY, CITY_SERVICE, PGHOSTEL, SPASALON, RELIGIOUS, AMC, BLOG, SERVICE_CENTER)
 * @param {Object} data - Contextual entity identifiers (slug, citySlug, catSlug, brandSlug, path, etc.)
 * @returns {string} Fully qualified canonical HTTPS URL
 */
export function buildCanonicalUrl(entityType, data = {}) {
    if (!entityType) return BASE_URL;

    let path = '';

    switch (String(entityType).toUpperCase()) {
        case 'STATIC': {
            const rawPath = data.path || data.slug || '/';
            path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
            break;
        }

        case 'MAIN_SERVICE': {
            const slug = normalizeSlug(data.slug || data.serviceSlug);
            path = slug ? `/${slug}` : '/services';
            break;
        }

        case 'CITY': {
            const city = normalizeSlug(data.citySlug || data.slug || data.name);
            path = city ? `/appliances-repair-service-center-${city}` : '/appliances';
            break;
        }

        case 'CATEGORY': {
            const cat = normalizeSlug(data.catSlug || data.slug || data.categorySlug);
            path = cat ? `/appliances/${cat}` : '/appliances';
            break;
        }

        case 'CATEGORY_CITY': {
            const cat = categorySlugToPublicPart(data.categorySlug || data.catSlug);
            const city = normalizeSlug(data.citySlug || data.city);
            if (cat && city) {
                path = `/${cat}-service-center-${city}`;
            } else if (city) {
                path = `/appliances-repair-service-center-${city}`;
            } else if (cat) {
                path = `/appliances/${cat}`;
            } else {
                path = '/appliances';
            }
            break;
        }

        case 'BRAND': {
            const brand = normalizeSlug(data.brandSlug || data.slug);
            path = brand ? `/${brand}` : '/appliances';
            break;
        }

        case 'BRAND_CITY': {
            const brand = normalizeSlug(data.brandSlug || data.brand);
            const city = normalizeSlug(data.citySlug || data.city);
            if (brand && city) {
                path = `/${brand}/${city}`;
            } else if (brand) {
                path = `/${brand}`;
            } else {
                path = '/appliances';
            }
            break;
        }

        case 'CITY_SERVICE':
        case 'BOOK_NOW': {
            const service = normalizeSlug(data.serviceSlug || data.slug);
            const city = normalizeSlug(data.citySlug || data.city);
            if (service && city) {
                path = `/nearby/${service}/${city}`;
            } else if (service) {
                path = `/nearby/${service}`;
            } else {
                path = '/book-appointment';
            }
            break;
        }

        case 'PGHOSTEL': {
            const slug = normalizeSlug(data.slug || data.hostelSlug);
            path = slug ? `/pghostels/${slug}` : '/pghostels';
            break;
        }

        case 'SPASALON': {
            const slug = normalizeSlug(data.slug || data.storeSlug);
            path = slug ? `/spa-salon/${slug}` : '/spa-salon';
            break;
        }

        case 'RELIGIOUS': {
            const slug = normalizeSlug(data.slug || data.serviceSlug);
            path = slug ? `/religious-services/${slug}` : '/religious-services';
            break;
        }

        case 'AMC': {
            const slug = normalizeSlug(data.slug || data.planSlug);
            path = slug ? `/amc/${slug}` : '/amc';
            break;
        }

        case 'BLOG': {
            const slug = normalizeSlug(data.slug);
            path = slug ? `/knowledge/${slug}` : '/knowledge';
            break;
        }

        case 'SERVICE_CENTER': {
            const slug = normalizeSlug(data.slug || data.id);
            path = slug ? `/service-list/${slug}` : '/appliance-repairs/services-centers';
            break;
        }

        default: {
            const fallbackPath = data.path || data.slug || '';
            path = fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`;
            break;
        }
    }

    return getCanonicalUrl(path);
}

