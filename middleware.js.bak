import { NextResponse } from 'next/server';

// Map of internal routes to service IDs
const SERVICE_ID_MAP = {
    '/appliances': '683daaa8f261c1548bdf7442',
    '/religious-services': '695250aa57bb211ca094e5fd',
    '/spa-salon': '69524f4a57bb211ca094e5e6',
    '/pghostels': '69524fb157bb211ca094e5ee',
};

// Cache for slugs to avoid excessive API calls
let slugCache = {
    data: {},
    timestamp: 0,
};

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

async function getDynamicSlugs() {
    const now = Date.now();
    if (slugCache.timestamp && now - slugCache.timestamp < CACHE_DURATION) {
        return slugCache.data;
    }

    const slugs = {};
    const serviceIds = [
        { id: '683daaa8f261c1548bdf7442', internalPrefix: '/appliances' },
        { id: '695250aa57bb211ca094e5fd', internalPrefix: '/religious-services' },
        { id: '69524f4a57bb211ca094e5e6', internalPrefix: '/spa-salon' },
        { id: '69524fb157bb211ca094e5ee', internalPrefix: '/pghostels' },
    ];

    try {
        const results = await Promise.all(
            serviceIds.map(async (service) => {
                try {
                    const res = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_slugs_by_serviceId/${service.id}`);
                    const data = await res.json();
                    if (data.success && data.data) {
                        const { home, category, recentlyBooked, featuredServices } = data.data;
                        const mapping = {};
                        if (home) mapping[home] = service.internalPrefix;
                        if (category) mapping[category] = `${service.internalPrefix}/categories`;
                        if (recentlyBooked) mapping[recentlyBooked] = `${service.internalPrefix}/recent`;
                        if (featuredServices) mapping[featuredServices] = `${service.internalPrefix}/featured`;
                        if (data.data.serviceCenter) mapping[data.data.serviceCenter] = `${service.internalPrefix}/centers`;

                        // Manual mapping for Verified Partners (Appliances)
                        if (service.id === '683daaa8f261c1548bdf7442') {
                            mapping['verified-appliance-repair-partners'] = `${service.internalPrefix}/child/683dbbfbb62d2a241de0f7e3`;
                        }

                        return mapping;
                    }
                } catch (e) {
                    console.error(`Error fetching slugs for ${service.id}:`, e);
                }
                return null;
            })
        );

        results.forEach((res) => {
            if (res) {
                Object.assign(slugs, res);
            }
        });

        slugCache = {
            data: slugs,
            timestamp: now,
        };
        return slugs;
    } catch (error) {
        console.error("Failed to fetch dynamic slugs:", error);
        return {};
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Skip static files and API routes
    if (
        pathname.includes('.') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    const slugs = await getDynamicSlugs();

    // Normalize pathname for matching (remove leading slash)
    const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

    // Sort slugs by length descending to match longest possible path first
    const sortedSlugs = Object.keys(slugs).sort((a, b) => b.length - a.length);

    for (const slug of sortedSlugs) {
        if (normalizedPath === slug || normalizedPath.startsWith(`${slug}/`)) {
            const internalPath = slugs[slug];
            const remainingPath = normalizedPath.slice(slug.length);
            const destination = `${internalPath}${remainingPath}`;

            const url = request.nextUrl.clone();
            url.pathname = destination;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
