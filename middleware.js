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
} from './app/lib/applianceRepairSlugs';

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
    slugs: new Set(),
    timestamp: 0,
};

let slugRegistryCache = {
    registry: null,
    timestamp: 0,
};

async function getSlugRegistry() {
    const now = Date.now();
    if (slugRegistryCache.timestamp && now - slugRegistryCache.timestamp < CACHE_DURATION && slugRegistryCache.registry) {
        return slugRegistryCache.registry;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const [brandsRes, servicesRes] = await Promise.allSettled([
            fetch('https://api.doorstephub.com/v1/dhubApi/app/brands/all_brands', {
                signal: controller.signal,
                next: { revalidate: 600 },
            }),
            fetch('https://api.doorstephub.com/v1/dhubApi/app/authorized-services/all_authorized_services', {
                signal: controller.signal,
                next: { revalidate: 600 },
            }),
        ]);

        clearTimeout(timeoutId);

        const brandSlugs = [];
        if (brandsRes.status === 'fulfilled' && brandsRes.value.ok) {
            const data = await brandsRes.value.json();
            if (data.success && Array.isArray(data.brands)) {
                data.brands.forEach((brand) => {
                    const slug = String(brand.slug || '').trim().toLowerCase();
                    if (slug) brandSlugs.push(slug);
                });
            }
        }

        const serviceSlugs = [];
        if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
            const data = await servicesRes.value.json();
            if (data.success && Array.isArray(data.services)) {
                data.services.forEach((service) => {
                    const slug = String(service.slug || '').trim().toLowerCase();
                    if (slug) serviceSlugs.push(slug);
                });
            }
        }

        const registry = createSlugRegistry({ brandSlugs, serviceSlugs });
        slugRegistryCache = { registry, timestamp: now };
        brandSlugCache = { slugs: registry.brandSlugs, timestamp: now };
        return registry;
    } catch (error) {
        console.error('Middleware slug registry fetch failed:', error);
    }

    return slugRegistryCache.registry || createSlugRegistry();
}

async function getBrandSlugSet() {
    const registry = await getSlugRegistry();
    return registry.brandSlugs;
}

async function getDynamicSlugs() {
    const now = Date.now();
    // Return cached data if valid
    if (slugCache.timestamp && now - slugCache.timestamp < CACHE_DURATION) {
        return slugCache.data;
    }

    const serviceIds = [
        // Only the appliance service ID is supported by this endpoint.
        // Spa, PG, and religious IDs return 404 — their slugs come from DEFAULT_SLUGS.
        { id: '683daaa8f261c1548bdf7442', internalPrefix: '/appliances' },
    ];

    try {
        // Use Promise.allSettled and a timeout to prevent middleware hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

        const results = await Promise.allSettled(
            serviceIds.map(async (service) => {
                try {
                    const res = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_slugs_by_serviceId/${service.id}`, {
                        signal: controller.signal,
                        next: { revalidate: 600 } // Cache at fetch level too
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
        return slugCache.data || DEFAULT_SLUGS;
    }
}

export async function middleware(request) {
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

        const slugRegistry = await getSlugRegistry();
        const brandSlugs = slugRegistry.brandSlugs;

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

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
