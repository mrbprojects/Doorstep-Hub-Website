import { NextResponse } from 'next/server';

// Fallback slugs to ensure critical routes work even if API is slow or down
const DEFAULT_SLUGS = {
    'appliance-repair-services': '/appliances',
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

async function getDynamicSlugs() {
    const now = Date.now();
    // Return cached data if valid
    if (slugCache.timestamp && now - slugCache.timestamp < CACHE_DURATION) {
        return slugCache.data;
    }

    const serviceIds = [
        { id: '683daaa8f261c1548bdf7442', internalPrefix: '/appliances' },
        { id: '695250aa57bb211ca094e5fd', internalPrefix: '/religious-services' },
        { id: '69524f4a57bb211ca094e5e6', internalPrefix: '/spa-salon' },
        { id: '69524fb157bb211ca094e5ee', internalPrefix: '/pghostels' },
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
        // 2. Resolve slugs
        const slugs = await getDynamicSlugs();
        const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

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
