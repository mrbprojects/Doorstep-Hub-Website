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

export const RESERVED_CITY_SLUGS = new Set([
    'service-list',
    'services',
    'service',
    'brand',
    'brands',
    'book-now',
    'categories',
    'category',
    'detail',
    'details',
    'store',
    'stores',
    'center',
    'centers',
    'child',
    'recent',
    'featured',
    'nearby',
    'sell-buy',
    'api',
    'appliances',
    'appliance-repairs',
    'spa-salon',
    'religious-services',
    'pghostels',
    'account',
    'cart',
    'address',
    'booking-flow',
    'all-services',
]);

export function isValidCitySlug(slug = '') {
    const s = String(slug || '').trim().toLowerCase();
    if (!s || RESERVED_CITY_SLUGS.has(s)) return false;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
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

function normalizeSlugRegistry(registryOrBrandSlugs = null, serviceSlugs = null) {
    if (registryOrBrandSlugs && typeof registryOrBrandSlugs.isBrandPage === 'function') {
        return registryOrBrandSlugs;
    }

    const brandList = registryOrBrandSlugs instanceof Set
        ? [...registryOrBrandSlugs]
        : Array.isArray(registryOrBrandSlugs)
            ? registryOrBrandSlugs
            : [];
    const serviceList = serviceSlugs instanceof Set
        ? [...serviceSlugs]
        : Array.isArray(serviceSlugs)
            ? serviceSlugs
            : [];

    if (!brandList.length && !serviceList.length) {
        return null;
    }

    const brandSet = new Set(brandList.map((slug) => String(slug || '').trim().toLowerCase()).filter(Boolean));
    const serviceSet = new Set(serviceList.map((slug) => String(slug || '').trim().toLowerCase()).filter(Boolean));

    return {
        brandSlugs: brandSet,
        serviceSlugs: serviceSet,
        isBrandPage(slug = '') {
            const normalized = String(slug || '').trim().toLowerCase();
            if (!normalized) return false;
            if (serviceSet.has(normalized)) return false;
            return brandSet.has(normalized);
        },
        hasBrand(slug = '') {
            return brandSet.has(String(slug || '').trim().toLowerCase());
        },
        hasService(slug = '') {
            return serviceSet.has(String(slug || '').trim().toLowerCase());
        },
    };
}

export const DEFAULT_BRAND_SLUGS = [
    'ao-smith-home-appliance-repair-services',
    'acer-service-repair-center',
    'apple-service-repair-center',
    'bajaj-appliance-repair-service-center',
    'blue-star-appliance-repair-service-center',
    'bosch-appliance-repair-service-center',
    'carrier-appliance-repair-service-center',
    'crompton-appliance-repair-service-center',
    'daikin-appliance-repair-service-center',
    'dell-service-repair-center',
    'eurekha-forbes-appliance-repair-service-center',
    'godrej-appliance-repair-service-center',
    'hp-service-repair-center',
    'haier-appliance-repair-service-center',
    'havells-appliance-repair-service-center',
    'hitachi-ac-repair-service-center',
    'ifb-appliance-repair-service-center',
    'kenstar-appliance-repair-service-center',
    'kent-water-purifier-repair-service-center',
    'lg-appliance-repair-service-center',
    'lenovo-service-repair-center',
    'livpure',
    'lloyd-appliance-repair-service-center',
    'mi-tv-repair-service-center',
    'msi-service-repair-center',
    'onida-appliance-repair-service-center',
    'orient-electric-appliance-repair-service-center',
    'all-brands-tv-repair-service-center',
    'panasonic-appliance-repair-service-center',
    'pureit-water-purifier-repar-services',
    'realme-tv-repair-service-center',
    'samsung-appliance-repair-service-center',
    'sony-tv-repair-service-center',
    'tcl-appliance-repair-service-center',
    'v-guard-appliance-repair-service-center',
    'voltas-appliance-repair-service-center',
    'whirlpool-appliance-repair-service-center'
];
const DEFAULT_BRAND_SET = new Set(DEFAULT_BRAND_SLUGS.map((s) => s.toLowerCase()));

/**
 * Brand landing page slug — uses API registry when available.
 * Avoid adding new suffix regex rules; add slugs in admin/API instead.
 */
export function isBrandPageSlug(brandSlug = '', registryOrBrandSlugs = null, serviceSlugs = null) {
    const slug = String(brandSlug || '').trim().toLowerCase();
    if (!slug) return false;

    const registry = normalizeSlugRegistry(registryOrBrandSlugs, serviceSlugs);
    if (registry) {
        if (registry.isBrandPage(slug)) return true;
    }

    if (registryOrBrandSlugs instanceof Set && registryOrBrandSlugs.has(slug)) {
        return true;
    }

    if (DEFAULT_BRAND_SET.has(slug) || isFlatBrandCenterSlug(slug)) {
        return true;
    }

    return false;
}

export function isFlatBrandListingSlug(brandSlug = '', registryOrBrandSlugs = null, serviceSlugs = null) {
    return isBrandPageSlug(brandSlug, registryOrBrandSlugs, serviceSlugs);
}

export function isRegisteredFlatBrandSlug(brandSlug = '', registryOrBrandSlugs = null, serviceSlugs = null) {
    const slug = String(brandSlug || '').trim().toLowerCase();
    if (!slug) return false;

    const registry = normalizeSlugRegistry(registryOrBrandSlugs, serviceSlugs);
    if (registry && registry.hasBrand(slug)) {
        return true;
    }

    if (registryOrBrandSlugs instanceof Set && registryOrBrandSlugs.has(slug)) {
        return true;
    }

    if (DEFAULT_BRAND_SET.has(slug) || isFlatBrandCenterSlug(slug)) {
        return true;
    }

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
 * Pass { trusted: true } when slug comes from the brands API (no pattern guessing).
 */
export function buildFlatBrandCityPublicPath(citySlug, brandSlug, options = {}) {
    const city = normalizeCitySlug(citySlug);
    const brand = String(brandSlug || '').trim().toLowerCase();
    const opts = typeof options === 'object' ? options : { trusted: !!options };
    const { trusted = false, registry = null } = opts;

    if (!city || !brand || !isValidCitySlug(city)) return null;
    if (trusted || isRegisteredFlatBrandSlug(brand, registry)) {
        return `/${brand}/${city}`;
    }
    return null;
}

/**
 * Build brand-only public URL (city comes from user selection / location).
 * Format: /realme-tv-repair-service-center
 */
export function buildFlatBrandPublicPath(brandSlug, options = {}) {
    const brand = String(brandSlug || '').trim().toLowerCase();
    const opts = typeof options === 'object' ? options : { trusted: !!options };
    const { trusted = false, registry = null } = opts;
    if (!brand) return null;
    if (trusted || isRegisteredFlatBrandSlug(brand, registry)) {
        return `/${brand}`;
    }
    return null;
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

export function isNearbyServiceSlug(slug = '', registryOrBrandSlugs = null, serviceSlugs = null) {
    const s = String(slug || '').trim().toLowerCase();
    if (!BOOK_NOW_FLAT_SERVICE_SLUG_PATTERN.test(s)) return false;

    const registry = normalizeSlugRegistry(registryOrBrandSlugs, serviceSlugs);
    if (registry?.hasService(s)) return true;
    if (registry?.hasBrand(s)) return false;
    if (registryOrBrandSlugs instanceof Set && registryOrBrandSlugs.has(s)) return false;

    // Unknown slug with valid format: treat as bookable service so new API slugs work without code changes.
    return true;
}

export function isBookNowFlatServiceSlug(slug = '') {
    const s = String(slug || '').trim().toLowerCase();
    if (!isNearbyServiceSlug(s)) return false;
    if (
        s === 'appliance-repair-services' ||
        s === 'appliance-repair-service' ||
        s === 'appliances-repair-services' ||
        s === 'appliances-repair-service'
    ) {
        return false;
    }
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
    if (
        normalizedServiceSlug === 'appliance-repair-services' ||
        normalizedServiceSlug === 'appliance-repair-service' ||
        normalizedServiceSlug === 'appliances-repair-services' ||
        normalizedServiceSlug === 'appliances-repair-service'
    ) {
        return null;
    }
    const registry = normalizeSlugRegistry(brandSlugs);
    const isBrand =
        registry?.hasBrand(normalizedServiceSlug) ||
        (brandSlugs instanceof Set && brandSlugs.has(normalizedServiceSlug)) ||
        (typeof brandSlugs?.has === 'function' && brandSlugs.has(normalizedServiceSlug)) ||
        isFlatBrandCenterSlug(normalizedServiceSlug);
    if (isBrand) {
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
    const normalizedServiceSlug = serviceSlug.toLowerCase();
    if (
        normalizedServiceSlug === 'appliance-repair-services' ||
        normalizedServiceSlug === 'appliance-repair-service' ||
        normalizedServiceSlug === 'appliances-repair-services' ||
        normalizedServiceSlug === 'appliances-repair-service'
    ) {
        return null;
    }
    if (!isNearbyServiceSlug(serviceSlug, brandSlugs) || !isValidCitySlug(citySlug)) return null;

    return {
        serviceSlug: serviceSlug.toLowerCase(),
        citySlug: normalizeCitySlug(citySlug),
    };
}

/**
 * Preferred navigation target for book-now.
 */
export function resolveBookNowNavigationPath(serviceSlug, citySlug, registryOrBrandSlugs = null) {
    const service = String(serviceSlug || '').trim().toLowerCase();
    const city = normalizeCitySlug(citySlug);
    if (!service) return '/service-list/book-now';
    if (!city || !BOOK_NOW_FLAT_SERVICE_SLUG_PATTERN.test(service)) {
        return `/service-list/book-now/${service}`;
    }
    if (isBrandPageSlug(service, registryOrBrandSlugs)) {
        return buildFlatBrandCityPublicPath(city, service, { trusted: true, registry: registryOrBrandSlugs })
            || `/service-list/book-now/${service}`;
    }
    return `/${NEARBY_BOOK_NOW_PREFIX}/${service}/${city}`;
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

export function getCityReviewers(cityName, categoryName) {
  const city = String(cityName || '').toLowerCase();
  const cat = categoryName || 'Appliance Repair';
  
  let names = [
    { name: 'Santhosh Kumar', rating: 5, date: '2 days ago' },
    { name: 'Priya Sharma', rating: 5, date: '4 days ago' },
    { name: 'Venkatesh Rao', rating: 4, date: '1 week ago' },
    { name: 'Ananya Reddy', rating: 5, date: '1 week ago' },
    { name: 'Kiran Verma', rating: 5, date: '2 weeks ago' },
    { name: 'Srinivas Rao', rating: 5, date: '3 weeks ago' }
  ];

  if (city.includes('chennai') || city.includes('coimbatore') || city.includes('madurai') || city.includes('tamil')) {
    names = [
      { name: 'Karthik Raja', rating: 5, date: '2 days ago' },
      { name: 'Janani R.', rating: 5, date: '4 days ago' },
      { name: 'Senthil Kumar', rating: 4, date: '1 week ago' },
      { name: 'Divya Balakrishnan', rating: 5, date: '1 week ago' },
      { name: 'Arun Prasath', rating: 5, date: '2 weeks ago' },
      { name: 'Priya Dharshini', rating: 5, date: '3 weeks ago' }
    ];
  } else if (city.includes('bengaluru') || city.includes('bangalore') || city.includes('mysore') || city.includes('karnataka')) {
    names = [
      { name: 'Manjunath Hegde', rating: 5, date: '2 days ago' },
      { name: 'Shruthi Gowda', rating: 5, date: '4 days ago' },
      { name: 'Karthik R.', rating: 4, date: '1 week ago' },
      { name: 'Lavanya S.', rating: 5, date: '1 week ago' },
      { name: 'Srinivas Murthy', rating: 5, date: '2 weeks ago' },
      { name: 'Nandini M.', rating: 5, date: '3 weeks ago' }
    ];
  } else if (city.includes('mumbai') || city.includes('pune') || city.includes('nagpur') || city.includes('maharashtra') || city.includes('thane')) {
    names = [
      { name: 'Sachin Patil', rating: 5, date: '2 days ago' },
      { name: 'Anjali Joshi', rating: 5, date: '4 days ago' },
      { name: 'Rahul Deshmukh', rating: 4, date: '1 week ago' },
      { name: 'Sneha Kulkarni', rating: 5, date: '1 week ago' },
      { name: 'Vijay Shinde', rating: 5, date: '2 weeks ago' },
      { name: 'Priyanka More', rating: 5, date: '3 weeks ago' }
    ];
  } else if (city.includes('kakinada') || city.includes('vijayawada') || city.includes('vizag') || city.includes('tirupati') || city.includes('nellore') || city.includes('guntur') || city.includes('rajahmundry') || city.includes('eluru')) {
    names = [
      { name: 'Ramesh Babu', rating: 5, date: '2 days ago' },
      { name: 'Divya Sri', rating: 5, date: '4 days ago' },
      { name: 'Manoj Kumar', rating: 4, date: '1 week ago' },
      { name: 'Swapna G.', rating: 5, date: '1 week ago' },
      { name: 'Harish K.', rating: 5, date: '2 weeks ago' },
      { name: 'Prasad Rao', rating: 5, date: '3 weeks ago' }
    ];
  } else if (city.includes('hyderabad') || city.includes('warangal') || city.includes('secunderabad') || city.includes('telangana')) {
    names = [
      { name: 'Srinivasulu P.', rating: 5, date: '2 days ago' },
      { name: 'Aruna Devi', rating: 5, date: '4 days ago' },
      { name: 'Vamshi Krishna', rating: 4, date: '1 week ago' },
      { name: 'Madhavi Latha', rating: 5, date: '1 week ago' },
      { name: 'Naveen Kumar', rating: 5, date: '2 weeks ago' },
      { name: 'Rajitha K.', rating: 5, date: '3 weeks ago' }
    ];
  } else {
    names = [
      { name: 'Amit Sharma', rating: 5, date: '2 days ago' },
      { name: 'Neha Gupta', rating: 5, date: '4 days ago' },
      { name: 'Rajesh Patel', rating: 4, date: '1 week ago' },
      { name: 'Sunita Devi', rating: 5, date: '1 week ago' },
      { name: 'Vikram Singh', rating: 5, date: '2 weeks ago' },
      { name: 'Pooja Verma', rating: 5, date: '3 weeks ago' }
    ];
  }

  const reviews = [
    { ...names[0], body: `Excellent doorstep ${cat} in ${cityName || 'your city'}. Technician arrived within 30 minutes!` },
    { ...names[1], body: `Very professional ${cat} in ${cityName || 'your city'}. Genuine spare parts and reasonable price.` },
    { ...names[2], body: `Great experience with Doorstep Hub in ${cityName || 'your city'}. Quick diagnostic and polite staff.` },
    { ...names[3], body: `Highly recommended ${cat} near ${cityName || 'your city'}. Fixed the issue on the spot.` },
    { ...names[4], body: `Top class service in ${cityName || 'your city'}! 90-day warranty provided on repairs.` },
    { ...names[5], body: `Punctual and honest technician in ${cityName || 'your city'}. Satisfied with the service quality.` }
  ];

  return reviews;
}
