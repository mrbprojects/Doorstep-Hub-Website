/**
 * Public SEO slugs for appliance repair city landing pages.
 * Rewrites to internal /appliances/repair-service/{citySlug} without changing existing routes.
 */

export const APPLIANCE_REPAIR_FLAT_PREFIXES = {
    CENTER: 'appliances-repair-service-center-',
    SERVICE: 'appliances-repair-service-',
};

/** Infix for category+city flat slugs, e.g. ac-repair-service-center-mumbai */
export const CATEGORY_SERVICE_CENTER_INFIX = '-service-center-';

/** Category public slug stems (before -service-center-{city}) */
const CATEGORY_PUBLIC_PART_PATTERN =
    /^(ac|tv|computer|washing-machine|refrigerator|microwave|geyser|chimney|laptop|mobile|dishwasher|oven|ro|printer|water-purifier)-repair$/i;

function normalizeCitySlug(citySlug = '') {
    return String(citySlug || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
}

function isValidCitySlug(slug = '') {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Compare city objects or strings by normalized slug/name */
export function citiesMatchBySlugOrName(cityA, cityB) {
    const a = normalizeCitySlug(
        typeof cityA === 'string' ? cityA : (cityA?.slug || cityA?.name || '')
    );
    const b = normalizeCitySlug(
        typeof cityB === 'string' ? cityB : (cityB?.slug || cityB?.name || '')
    );
    if (!a || !b) return true;
    return a === b;
}

/**
 * Build the canonical public flat URL for a city repair landing page.
 * Format: /appliances-repair-service-center-{citySlug}
 */
export function buildApplianceRepairCityPublicPath(citySlug) {
    const slug = normalizeCitySlug(citySlug);
    if (!slug) return '/appliances/repair-service';
    return `/${APPLIANCE_REPAIR_FLAT_PREFIXES.CENTER}${slug}`;
}

/** @deprecated Use buildApplianceRepairCityPublicPath — kept for legacy flat URLs */
export function buildApplianceRepairCityLegacyPath(citySlug) {
    const slug = normalizeCitySlug(citySlug);
    if (!slug) return '/appliances/repair-service';
    return `/${APPLIANCE_REPAIR_FLAT_PREFIXES.SERVICE}${slug}`;
}

/**
 * Parse a single-segment flat public slug into the internal app path.
 * @param {string} normalizedPath path without leading slash
 * @returns {string|null}
 */
export function resolveApplianceRepairFlatPath(normalizedPath = '') {
    const path = String(normalizedPath || '').replace(/^\/+|\/+$/g, '');
    if (!path || path.includes('/')) {
        return null;
    }

    const centerPrefix = APPLIANCE_REPAIR_FLAT_PREFIXES.CENTER;
    if (path.startsWith(centerPrefix)) {
        const citySlug = path.slice(centerPrefix.length);
        if (isValidCitySlug(citySlug)) {
            return `/appliances/repair-service/${citySlug}`;
        }
        return null;
    }

    const servicePrefix = APPLIANCE_REPAIR_FLAT_PREFIXES.SERVICE;
    if (path.startsWith(servicePrefix)) {
        const citySlug = path.slice(servicePrefix.length);
        if (isValidCitySlug(citySlug)) {
            return `/appliances/repair-service/${citySlug}`;
        }
    }

    return null;
}

function categorySlugToPublicPart(categorySlug = '') {
    const slug = String(categorySlug || '').trim().toLowerCase();
    if (!slug) return '';
    if (slug.endsWith('-services')) {
        return slug.slice(0, -'-services'.length);
    }
    return slug;
}

function resolveCategorySlugFromPublicPart(categoryPart = '') {
    const part = String(categoryPart || '').trim().toLowerCase();
    if (!part) return '';
    if (part.endsWith('-services')) return part;
    return `${part}-services`;
}

function isCategoryPublicPart(categoryPart = '') {
    return CATEGORY_PUBLIC_PART_PATTERN.test(String(categoryPart || '').trim().toLowerCase());
}

/**
 * Build the canonical public flat URL for a category+city brand-selection page.
 * Format: /ac-repair-service-center-mumbai
 */
export function buildApplianceCategoryCityPublicPath(categorySlug, citySlug) {
    const categoryPart = categorySlugToPublicPart(categorySlug);
    const city = normalizeCitySlug(citySlug);
    if (!categoryPart || !city) return null;
    return `/${categoryPart}${CATEGORY_SERVICE_CENTER_INFIX}${city}`;
}

/**
 * Parse a category+city flat slug into the internal brand-selection path.
 * @param {string} normalizedPath path without leading slash
 * @returns {string|null}
 */
export function resolveApplianceCategoryCityFlatPath(normalizedPath = '') {
    const path = String(normalizedPath || '').replace(/^\/+|\/+$/g, '');
    if (!path || path.includes('/')) {
        return null;
    }

    if (
        path.startsWith(APPLIANCE_REPAIR_FLAT_PREFIXES.CENTER) ||
        path.startsWith(APPLIANCE_REPAIR_FLAT_PREFIXES.SERVICE)
    ) {
        return null;
    }

    const infix = CATEGORY_SERVICE_CENTER_INFIX;
    const idx = path.lastIndexOf(infix);
    if (idx <= 0) {
        return null;
    }

    const categoryPart = path.slice(0, idx);
    const citySlug = path.slice(idx + infix.length);

    if (!isCategoryPublicPart(categoryPart) || !isValidCitySlug(citySlug)) {
        return null;
    }

    const categorySlug = resolveCategorySlugFromPublicPart(categoryPart);
    return `/appliances/repair-service/${citySlug}/${categorySlug}`;
}

/** Brand flat slugs end with -appliance-repair-service-center (e.g. godrej-appliance-repair-service-center) */
const FLAT_BRAND_CENTER_SLUG_PATTERN = /-appliance-repair-service-center$/i;

export function isFlatBrandCenterSlug(brandSlug = '') {
    return FLAT_BRAND_CENTER_SLUG_PATTERN.test(String(brandSlug || '').trim().toLowerCase());
}

/** Internal rewrite segment — not a public URL */
export const FLAT_BRAND_INTERNAL_SEGMENT = 'brand';

/** Internal placeholder when public URL has no city segment (city from user location) */
export const FLAT_BRAND_AUTO_CITY = '_location';

const FLAT_BRAND_LISTING_SUFFIX = /-repair-service-center$/i;

export function isFlatBrandListingSlug(brandSlug = '') {
    const slug = String(brandSlug || '').trim().toLowerCase();
    if (!slug || !FLAT_BRAND_LISTING_SUFFIX.test(slug)) return false;
    if (isFlatBrandCenterSlug(slug)) return true;
    return !/-appliance-repair-service-center$/i.test(slug);
}

function isRegisteredFlatBrandSlug(brandSlug = '', brandSlugs = null) {
    const slug = String(brandSlug || '').trim().toLowerCase();
    if (!slug) return false;
    if (isFlatBrandCenterSlug(slug)) return true;
    if (brandSlugs && brandSlugs.has(slug)) return true;
    return false;
}

function isValidFlatBrandCityPair(brandSlug = '', citySlug = '', brandSlugs = null) {
    if (!isValidCitySlug(citySlug) || !isRegisteredFlatBrandSlug(brandSlug, brandSlugs)) {
        return false;
    }

    const slug = String(brandSlug || '').trim().toLowerCase();
    if (isFlatBrandCenterSlug(slug)) {
        const categoryCore = slug.replace(/-service-center$/i, '');
        if (CATEGORY_PUBLIC_PART_PATTERN.test(categoryCore)) {
            return false;
        }
    }

    return true;
}

/**
 * Build the canonical public flat URL for a city+brand service page.
 * Format: /realme-tv-repair-service-center/mumbai
 */
export function buildFlatBrandCityPublicPath(citySlug, brandSlug) {
    const city = normalizeCitySlug(citySlug);
    const brand = String(brandSlug || '').trim().toLowerCase();
    if (!city || !brand || !isFlatBrandListingSlug(brand)) return null;
    return `/${brand}/${city}`;
}

/**
 * Build brand-only public URL (city comes from user selection / location).
 * Format: /realme-tv-repair-service-center
 */
export function buildFlatBrandPublicPath(brandSlug) {
    const brand = String(brandSlug || '').trim().toLowerCase();
    if (!brand || !isFlatBrandListingSlug(brand)) return null;
    return `/${brand}`;
}

/**
 * Parse a city+brand flat slug (canonical or legacy). Returns null unless exactly two segments.
 * Canonical: /{brand}/{city}
 * Legacy:    /{city}/{brand}
 * @param {string} normalizedPath path without leading slash
 * @returns {{ citySlug: string, brandSlug: string }|null}
 */
export function parseFlatBrandCityPath(normalizedPath = '', brandSlugs = null) {
    const parts = String(normalizedPath || '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    if (parts.length !== 2) return null;

    const [first, second] = parts;

    // Canonical: /realme-tv-repair-service-center/mumbai
    if (isValidFlatBrandCityPair(first, second, brandSlugs)) {
        return { citySlug: second, brandSlug: first };
    }

    // Legacy: /mumbai/realme-tv-repair-service-center
    if (isValidFlatBrandCityPair(second, first, brandSlugs)) {
        return { citySlug: first, brandSlug: second };
    }

    return null;
}

/**
 * Rewrite public /{brand}/{city} flat slug to internal appliance brand route.
 * @param {string} normalizedPath path without leading slash
 * @returns {string|null}
 */
export function resolveFlatBrandCityRewritePath(normalizedPath = '', brandSlugs = null) {
    const parsed = parseFlatBrandCityPath(normalizedPath, brandSlugs);
    if (!parsed) return null;
    return `/appliances/repair-service/${parsed.citySlug}/${FLAT_BRAND_INTERNAL_SEGMENT}/${parsed.brandSlug}`;
}

/**
 * Rewrite public /{brand} (no city) to internal brand route with dynamic city.
 */
export function resolveFlatBrandSingleRewritePath(normalizedPath = '', brandSlugs = null) {
    const slug = String(normalizedPath || '').replace(/^\/+|\/+$/g, '');
    if (!slug || slug.includes('/')) return null;
    if (!isRegisteredFlatBrandSlug(slug, brandSlugs)) return null;
    return `/appliances/repair-service/${FLAT_BRAND_AUTO_CITY}/${FLAT_BRAND_INTERNAL_SEGMENT}/${slug.toLowerCase()}`;
}

/**
 * Redirect legacy /{city}/{category}/{brand} to /{brand}/{city}
 */
export function resolveLegacySeoBrandRedirect(normalizedPath = '', brandSlugs = null) {
    const parts = String(normalizedPath || '').split('/').filter(Boolean);
    if (parts.length !== 3) return null;

    const [citySlug, categorySlug, brandSlug] = parts;
    if (!isValidCitySlug(citySlug) || !categorySlug || !brandSlug) return null;
    if (!String(categorySlug).toLowerCase().includes('repair')) return null;
    if (!isRegisteredFlatBrandSlug(brandSlug, brandSlugs)) return null;

    return `/${brandSlug.toLowerCase()}/${citySlug}`;
}

/** Canonical public book-now URLs: /nearby/{serviceSlug}/{citySlug} */
export const NEARBY_BOOK_NOW_PREFIX = 'nearby';

/** Legacy flat slugs: /{serviceSlug}/{citySlug} */
const BOOK_NOW_FLAT_SERVICE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export function isNearbyServiceSlug(slug = '', brandSlugs = null) {
    const s = String(slug || '').trim().toLowerCase();
    if (!BOOK_NOW_FLAT_SERVICE_SLUG_PATTERN.test(s)) return false;
    if (brandSlugs?.has(s)) return false;
    if (isFlatBrandCenterSlug(s)) return false;
    if (isFlatBrandListingSlug(s)) return false;
    return true;
}

export function isBookNowFlatServiceSlug(slug = '') {
    const s = String(slug || '').trim().toLowerCase();
    if (!isNearbyServiceSlug(s)) return false;
    if (s.startsWith('book-')) return true;
    if (/-near-(you|me)$/i.test(s)) return true;
    if (/-repair-services?$/i.test(s)) return true;
    if (/-repair-service-center$/i.test(s) && !/-appliance-repair-service-center$/i.test(s)) {
        return true;
    }
    return false;
}

/**
 * Parse /{serviceSlug}/{citySlug} for book-now (excludes registered brand listing slugs).
 */
export function parseBookNowCityFlatPath(normalizedPath = '', brandSlugs = null) {
    const parts = String(normalizedPath || '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    if (parts.length !== 2) return null;

    const [serviceSlug, citySlug] = parts;
    const normalizedServiceSlug = serviceSlug.toLowerCase();
    if (brandSlugs?.has(normalizedServiceSlug) || isFlatBrandCenterSlug(normalizedServiceSlug)) {
        return null;
    }
    if (!isBookNowFlatServiceSlug(serviceSlug) || !isValidCitySlug(citySlug)) return null;

    return {
        serviceSlug: serviceSlug.toLowerCase(),
        citySlug: normalizeCitySlug(citySlug),
    };
}

/**
 * Build canonical public URL for book-now with city.
 * e.g. /nearby/blue-star-ac-repair-services/mumbai
 */
export function buildNearbyBookNowPublicPath(serviceSlug, citySlug, brandSlugs = null) {
    const service = String(serviceSlug || '').trim().toLowerCase();
    const city = normalizeCitySlug(citySlug);
    if (!service || !city || !isNearbyServiceSlug(service, brandSlugs)) return null;
    return `/${NEARBY_BOOK_NOW_PREFIX}/${service}/${city}`;
}

/** @deprecated Use buildNearbyBookNowPublicPath */
export function buildBookNowCityPublicPath(serviceSlug, citySlug) {
    return buildNearbyBookNowPublicPath(serviceSlug, citySlug);
}

/**
 * Parse /nearby/{serviceSlug}/{citySlug}
 */
export function parseNearbyBookNowPath(normalizedPath = '', brandSlugs = null) {
    const parts = String(normalizedPath || '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    if (parts.length !== 3 || parts[0] !== NEARBY_BOOK_NOW_PREFIX) return null;

    const [, serviceSlug, citySlug] = parts;
    if (!isNearbyServiceSlug(serviceSlug, brandSlugs) || !isValidCitySlug(citySlug)) return null;

    return {
        serviceSlug: serviceSlug.toLowerCase(),
        citySlug: normalizeCitySlug(citySlug),
    };
}

/**
 * Preferred navigation target for book-now.
 */
export function resolveBookNowNavigationPath(serviceSlug, citySlug, brandSlugs = null) {
    const nearby = buildNearbyBookNowPublicPath(serviceSlug, citySlug, brandSlugs);
    if (nearby) return nearby;

    const service = String(serviceSlug || '').trim();
    if (!service) return '/service-list/book-now';
    return `/service-list/book-now/${service}`;
}

/**
 * Rewrite public /nearby/{service}/{city} to internal book-now route.
 * @returns {{ pathname: string, search: string }|null}
 */
export function resolveNearbyBookNowRewrite(normalizedPath = '', brandSlugs = null) {
    const parsed = parseNearbyBookNowPath(normalizedPath, brandSlugs);
    if (!parsed) return null;
    return {
        pathname: `/book-now/${parsed.serviceSlug}`,
        search: `?city=${encodeURIComponent(parsed.citySlug)}`,
    };
}

/**
 * Rewrite public /book-{service}/{city} to internal book-now route.
 * @returns {{ pathname: string, search: string }|null}
 */
export function resolveBookNowCityFlatRewrite(normalizedPath = '', brandSlugs = null) {
    const parsed = parseBookNowCityFlatPath(normalizedPath, brandSlugs);
    if (!parsed) return null;
    return {
        pathname: `/book-now/${parsed.serviceSlug}`,
        search: `?city=${encodeURIComponent(parsed.citySlug)}`,
    };
}
