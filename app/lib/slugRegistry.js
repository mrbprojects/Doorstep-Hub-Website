/**
 * Slug registry — API is the source of truth for brand vs service URLs.
 * Avoid adding new hardcoded slug patterns; register slugs from the backend instead.
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

export function createSlugRegistry({ brandSlugs = [], serviceSlugs = [] } = {}) {
    const brands = new Set(
        (Array.isArray(brandSlugs) ? brandSlugs : [])
            .map((slug) => String(slug || '').trim().toLowerCase())
            .filter(Boolean),
    );
    const services = new Set(
        (Array.isArray(serviceSlugs) ? serviceSlugs : [])
            .map((slug) => String(slug || '').trim().toLowerCase())
            .filter(Boolean),
    );

    return {
        brandSlugs: brands,
        serviceSlugs: services,
        isBrandPage(slug = '') {
            const normalized = String(slug || '').trim().toLowerCase();
            if (!normalized) return false;
            if (services.has(normalized)) return false;
            return brands.has(normalized);
        },
        isBookableService(slug = '') {
            const normalized = String(slug || '').trim().toLowerCase();
            if (!normalized) return false;
            if (brands.has(normalized)) return false;
            if (services.has(normalized)) return true;
            return false;
        },
        hasBrand(slug = '') {
            return brands.has(String(slug || '').trim().toLowerCase());
        },
        hasService(slug = '') {
            return services.has(String(slug || '').trim().toLowerCase());
        },
    };
}

export function buildSlugRegistryFromRecords({
    brands = [],
    services = [],
} = {}) {
    const brandSlugs = brands.map((item) => item?.slug || item?.name || item).filter(Boolean);
    const serviceSlugs = services.map((item) => item?.slug || item?._id || item).filter(Boolean);
    return createSlugRegistry({ brandSlugs, serviceSlugs });
}

let clientRegistryPromise = null;
let clientRegistryCache = null;

export async function fetchSlugRegistry({ force = false } = {}) {
    if (!force && clientRegistryCache) {
        return clientRegistryCache;
    }
    if (!force && clientRegistryPromise) {
        return clientRegistryPromise;
    }

    clientRegistryPromise = (async () => {
        const [brandsRes, servicesRes] = await Promise.allSettled([
            fetch(`${API_BASE_URL}/app/brands/all_brands`, {
                headers: { 'Content-Type': 'application/json' },
                next: { revalidate: 600 },
            }),
            fetch(`${API_BASE_URL}/app/authorized-services/all_authorized_services`, {
                headers: { 'Content-Type': 'application/json' },
                next: { revalidate: 600 },
            }),
        ]);

        let brands = [];
        if (brandsRes.status === 'fulfilled' && brandsRes.value.ok) {
            const data = await brandsRes.value.json();
            brands = Array.isArray(data?.brands) ? data.brands : [];
        }

        let services = [];
        if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
            const data = await servicesRes.value.json();
            services = Array.isArray(data?.services) ? data.services : [];
        }

        clientRegistryCache = buildSlugRegistryFromRecords({ brands, services });
        return clientRegistryCache;
    })();

    try {
        return await clientRegistryPromise;
    } finally {
        clientRegistryPromise = null;
    }
}

export function primeSlugRegistry(registry) {
    if (registry) {
        clientRegistryCache = registry;
    }
}
