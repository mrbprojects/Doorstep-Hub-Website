import { NextResponse } from 'next/server';
import { createSlugRegistry } from './app/lib/slugRegistry';
import {
    resolveApplianceRepairFlatPath,
    resolveApplianceCategoryCityFlatPath,
    resolveFlatBrandCityRewritePath,
    resolveFlatBrandSingleRewritePath,
    resolveLegacySeoBrandRedirect,
    resolveBookNowCityFlatRewrite,
    resolveNearbyBookNowRewrite,
    buildNearbyBookNowPublicPath,
    DEFAULT_BRAND_SLUGS,
} from './app/lib/applianceRepairSlugs';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

// Fallback slugs to ensure critical routes work even if API is slow or down
const DEFAULT_SLUGS = {
    'appliance-repair-services': '/appliances',
    'appliance-repair-services/categories': '/appliances/categories',
    'appliance-repair-services/featured': '/appliances/featured',
    'appliance-repair-services/recent': '/appliances/recent',
    'appliance-repair-services/centers': '/appliance-repairs/services-centers',
    'appliances/centers': '/appliance-repairs/services-centers',
    'services/centers': '/appliance-repairs/services-centers',



    'service-list/category/appliance-repair-services': '/appliances/categories',
    'service-list/category/appliance-repair-service': '/appliances/categories',
    'service-list/featured-services/all': '/appliances/featured',
    'service-list/featured-services': '/appliances/featured',
    'all-service-categories': '/appliances/recent',
    'nearby-service-centers': '/appliance-repairs/services-centers',
    'verified-appliance-repair-partners': '/appliances/child/683dbbfbb62d2a241de0f7e3',
    'salon-at-home-services': '/spa-salon',
    'pg-hostels-near-me': '/pghostels',
    'pandit-ji-for-puja-services': '/religious-services'
};

// Simple in-memory cache
let slugCache = {
    data: DEFAULT_SLUGS,
    timestamp: 0,
};

const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

let brandSlugCache = {
    slugs: new Set(DEFAULT_BRAND_SLUGS),
    timestamp: 0,
};

let slugRegistryCache = {
    registry: createSlugRegistry({ brandSlugs: DEFAULT_BRAND_SLUGS }),
    timestamp: 0,
};

let inFlightRegistryPromise = null;

async function getSlugRegistry() {
    const now = Date.now();
    if (slugRegistryCache.timestamp && now - slugRegistryCache.timestamp < CACHE_DURATION && slugRegistryCache.registry) {
        return slugRegistryCache.registry;
    }

    if (inFlightRegistryPromise) {
        return inFlightRegistryPromise;
    }

    inFlightRegistryPromise = (async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const [brandsRes, servicesRes] = await Promise.allSettled([
                fetch(`${API_BASE_URL}/app/brands/all_brands`, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' },
                }),
                fetch(`${API_BASE_URL}/app/authorized-services/all_authorized_services`, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' },
                }),
            ]);

            clearTimeout(timeoutId);

            const brandSlugs = [...DEFAULT_BRAND_SLUGS];
            if (brandsRes.status === 'fulfilled' && brandsRes.value && brandsRes.value.ok) {
                try {
                    const data = await brandsRes.value.json();
                    if (data && data.success && Array.isArray(data.brands)) {
                        data.brands.forEach((brand) => {
                            const slug = String(brand.slug || '').trim().toLowerCase();
                            if (slug && !brandSlugs.includes(slug)) brandSlugs.push(slug);
                        });
                    }
                } catch (e) {
                    // Ignore body consumption issues
                }
            }

            const serviceSlugs = [];
            if (servicesRes.status === 'fulfilled' && servicesRes.value && servicesRes.value.ok) {
                try {
                    const data = await servicesRes.value.json();
                    if (data && data.success && Array.isArray(data.services)) {
                        data.services.forEach((service) => {
                            const slug = String(service.slug || '').trim().toLowerCase();
                            if (slug) serviceSlugs.push(slug);
                        });
                    }
                } catch (e) {
                    // Ignore body consumption issues
                }
            }

            const registry = createSlugRegistry({ brandSlugs, serviceSlugs });
            slugRegistryCache = { registry, timestamp: now };
            brandSlugCache = { slugs: registry.brandSlugs, timestamp: now };
            return registry;
        } catch (error) {
            console.error('Middleware slug registry fetch failed:', error);
            // Cache fallback for 1 minute on error so concurrent requests don't loop
            slugRegistryCache = {
                registry: slugRegistryCache.registry || createSlugRegistry({ brandSlugs: DEFAULT_BRAND_SLUGS }),
                timestamp: now - CACHE_DURATION + (60 * 1000),
            };
            return slugRegistryCache.registry;
        } finally {
            inFlightRegistryPromise = null;
        }
    })();

    return inFlightRegistryPromise;
}

async function getBrandSlugSet() {
    const registry = await getSlugRegistry();
    return registry?.brandSlugs instanceof Set ? registry.brandSlugs : new Set(DEFAULT_BRAND_SLUGS);
}

let inFlightDynamicSlugsPromise = null;

async function getDynamicSlugs() {
    const now = Date.now();
    // Return cached data if valid
    if (slugCache.timestamp && now - slugCache.timestamp < CACHE_DURATION) {
        return slugCache.data;
    }

    if (inFlightDynamicSlugsPromise) {
        return inFlightDynamicSlugsPromise;
    }

    inFlightDynamicSlugsPromise = (async () => {
        const serviceIds = [
            // Only the appliance service ID is supported by this endpoint.
            // Spa, PG, and religious IDs return 404 — their slugs come from DEFAULT_SLUGS.
            { id: '683daaa8f261c1548bdf7442', internalPrefix: '/appliances' },
        ];

        try {
            // Use Promise.allSettled and a timeout to prevent middleware hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const results = await Promise.allSettled(
                serviceIds.map(async (service) => {
                    try {
                        const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/${service.id}`, {
                            signal: controller.signal,
                            headers: { 'Accept': 'application/json' },
                        });

                        if (!res.ok) return null;
                        const data = await res.json();

                        if (data.success && data.data) {
                            const { home, category, recentlyBooked, featuredServices } = data.data;
                            const mapping = {};
                            if (home) mapping[home] = service.internalPrefix;
                            if (category) mapping[category] = `${service.internalPrefix}/categories`;
                            if (recentlyBooked) mapping[recentlyBooked] = `${service.internalPrefix}/recent`;
                            if (featuredServices) mapping[featuredServices] = `${service.internalPrefix}/featured`;
                            if (data.data.serviceCenter) mapping[data.data.serviceCenter] = `${service.internalPrefix}/centers`;

                            // Specific manual mapping
                            if (service.id === '683daaa8f261c1548bdf7442') {
                                mapping['verified-appliance-repair-partners'] = `${service.internalPrefix}/child/683dbbfbb62d2a241de0f7e3`;
                            }
                            return mapping;
                        }
                    } catch (e) {
                        // Silently fail individual fetches
                    }
                    return null;
                })
            );

            clearTimeout(timeoutId);

            const newSlugs = { ...DEFAULT_SLUGS };
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    Object.assign(newSlugs, result.value);
                }
            });

            // Update cache
            slugCache = {
                data: newSlugs,
                timestamp: now,
            };
            return newSlugs;
        } catch (error) {
            console.error("Middleware slug fetch failed:", error);
            slugCache = {
                data: slugCache.data || DEFAULT_SLUGS,
                timestamp: now - CACHE_DURATION + (60 * 1000),
            };
            return slugCache.data;
        } finally {
            inFlightDynamicSlugsPromise = null;
        }
    })();

    return inFlightDynamicSlugsPromise;
}

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // 1. Skip static assets and root
    if (
        pathname.includes('.') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/'
    ) {
        return NextResponse.next();
    }

    try {
        const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

        // Canonical flat slug: /appliances-repair-service-center-hyderabad
        const centerPrefix = 'appliances-repair-service-center-';
        const servicePrefix = 'appliances-repair-service-';
        if (
            normalizedPath.startsWith(servicePrefix) &&
            !normalizedPath.startsWith(centerPrefix)
        ) {
            const citySlug = normalizedPath.slice(servicePrefix.length);
            if (citySlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(citySlug)) {
                const url = request.nextUrl.clone();
                url.pathname = `/${centerPrefix}${citySlug}`;
                return NextResponse.redirect(url, 308);
            }
        }

        const applianceRepairPath = resolveApplianceRepairFlatPath(normalizedPath);
        if (applianceRepairPath) {
            const url = request.nextUrl.clone();
            url.pathname = applianceRepairPath;
            return NextResponse.rewrite(url);
        }

        const categoryCityPath = resolveApplianceCategoryCityFlatPath(normalizedPath);
        if (categoryCityPath) {
            const url = request.nextUrl.clone();
            url.pathname = categoryCityPath;
            return NextResponse.rewrite(url);
        }

        // Handle URLs ending with /service-list (e.g. /sony-tv-repair-service-center/service-list)
        if (normalizedPath.endsWith('/service-list')) {
            const clean = normalizedPath.replace(/\/service-list$/, '');
            const slug = clean.split('/').pop();
            if (slug && slug !== 'service-list') {
                const url = request.nextUrl.clone();
                url.pathname = `/service-list/${slug}`;
                return NextResponse.rewrite(url);
            }
        }

        // Dedicated /service-list/[slug] pages (except book-now, category, and featured-services subpaths) pass straight through
        if (
            normalizedPath.startsWith('service-list/') &&
            !normalizedPath.startsWith('service-list/book-now/') &&
            !normalizedPath.startsWith('service-list/category/') &&
            !normalizedPath.startsWith('service-list/featured-services')
        ) {
            return NextResponse.next();
        }

        if (
            normalizedPath === 'service-list/featured-services/all' ||
            normalizedPath === 'service-list/featured-services'
        ) {
            const url = request.nextUrl.clone();
            url.pathname = '/appliances/featured';
            return NextResponse.rewrite(url);
        }

        const slugRegistry = (await getSlugRegistry()) || createSlugRegistry();
        const brandSlugs = slugRegistry?.brandSlugs instanceof Set ? slugRegistry.brandSlugs : new Set();

        if (pathname.startsWith('/service-list/book-now/')) {
            const legacySlug = normalizedPath.replace(/^service-list\/book-now\//, '').split('/')[0];
            const city = request.nextUrl.searchParams.get('city');
            if (legacySlug && city) {
                const nearbyPath = buildNearbyBookNowPublicPath(legacySlug, city, slugRegistry);
                if (nearbyPath) {
                    const url = request.nextUrl.clone();
                    url.pathname = nearbyPath;
                    url.search = '';
                    return NextResponse.redirect(url, 308);
                }
            }
        }

        const nearbyBookNowRewrite = resolveNearbyBookNowRewrite(normalizedPath, slugRegistry);
        if (nearbyBookNowRewrite) {
            const url = request.nextUrl.clone();
            url.pathname = nearbyBookNowRewrite.pathname;
            url.search = nearbyBookNowRewrite.search;
            return NextResponse.rewrite(url);
        }

        const legacyBrandRedirect = resolveLegacySeoBrandRedirect(normalizedPath, slugRegistry);
        if (legacyBrandRedirect) {
            const url = request.nextUrl.clone();
            url.pathname = legacyBrandRedirect;
            return NextResponse.redirect(url, 308);
        }

        const flatBrandSinglePath = resolveFlatBrandSingleRewritePath(normalizedPath, slugRegistry);
        if (flatBrandSinglePath) {
            const url = request.nextUrl.clone();
            url.pathname = flatBrandSinglePath;
            return NextResponse.rewrite(url);
        }

        const flatBrandPath = resolveFlatBrandCityRewritePath(normalizedPath, slugRegistry);
        if (flatBrandPath) {
            const url = request.nextUrl.clone();
            url.pathname = flatBrandPath;
            return NextResponse.rewrite(url);
        }

        const bookNowRewrite = resolveBookNowCityFlatRewrite(normalizedPath, slugRegistry);
        if (bookNowRewrite) {
            const url = request.nextUrl.clone();
            url.pathname = bookNowRewrite.pathname;
            url.search = bookNowRewrite.search;
            return NextResponse.rewrite(url);
        }

        // Redirect misconstructed or legacy /appliance-repair-services/{serviceSlug} to /{serviceSlug}
        // while preserving known sub-routes (categories, featured, recent, centers, detail, cart, etc.)
        const knownApplianceSections = new Set([
            'categories', 'featured', 'recent', 'centers', 'detail', 'cart',
            'checkout', 'booking', 'address', 'verified', 'select-service', 'repair-service'
        ]);
        if (normalizedPath.startsWith('appliance-repair-services/')) {
            const sub = normalizedPath.slice('appliance-repair-services/'.length);
            const firstSeg = sub.split('/')[0];
            if (!knownApplianceSections.has(firstSeg) && sub) {
                const url = request.nextUrl.clone();
                url.pathname = `/${sub}`;
                return NextResponse.redirect(url, 308);
            }
        }

        // 2. Resolve slugs
        const slugs = await getDynamicSlugs();

        // 3. Match longest slug first
        const sortedSlugs = Object.keys(slugs).sort((a, b) => b.length - a.length);

        for (const slug of sortedSlugs) {
            if (normalizedPath === slug || normalizedPath.startsWith(`${slug}/`)) {
                const internalBase = slugs[slug];
                const remaining = normalizedPath.slice(slug.length);
                const destination = `${internalBase}${remaining}`;

                // Perform rewrite
                const url = request.nextUrl.clone();
                url.pathname = destination;
                return NextResponse.rewrite(url);
            }
        }
    } catch (e) {
        console.error("Middleware execution error:", e);
    }

    return NextResponse.next();
}

export default proxy;

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|ads\\.txt|robots\\.txt).*)',
    ],
};
