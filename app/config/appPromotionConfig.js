/**
 * Doorstep Hub - Centralized Smart App Install & Deep Linking Configuration
 * Strictly separates Customer App and Service Partner App configurations.
 */

export const CUSTOMER_APP_CONFIG = {
    id: 'customer',
    name: 'Doorstep Hub',
    fullName: 'Doorstep Hub — Home Services',
    heading: 'Doorstep Hub — Everything You Need, in One App',
    description: 'Explore services, manage bookings, receive updates and access Doorstep Hub wherever you go.',
    icon: '/d-hub-logo.png',
    scheme: 'doorstephub',
    universalHost: 'doorstephub.com',
    android: {
        packageId: 'com.doorstephub.customer',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
        available: true,
    },
    ios: {
        bundleId: 'com.doorstephub.customers',
        appStoreId: '6475340236',
        appStoreUrl: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236',
        available: true,
    },
    primaryCta: 'Get the Doorstep Hub App',
    secondaryCta: 'Open App',
    dismissKey: 'dhub_dismiss_customer_app_v1',
    dismissDays: 7,
};

export const PARTNER_APP_CONFIG = {
    id: 'partner',
    name: 'Doorstep Hub Partner',
    fullName: 'Doorstep Hub — Service Partner',
    heading: 'Grow Your Business with Doorstep Hub Partner App',
    description: 'Manage service opportunities, respond to enquiries, track bookings and manage your partner account from one convenient app.',
    icon: '/servicecenterpointlogo.png',
    scheme: 'servicepartnerexpo',
    universalHost: 'doorstephub.com',
    android: {
        packageId: 'com.doorstephub.partner',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
        available: true,
    },
    ios: {
        bundleId: 'com.doorstephub.partner',
        appStoreId: '6504071357',
        appStoreUrl: 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357',
        available: true,
    },
    primaryCta: 'Get the Partner App',
    secondaryCta: 'Open Partner App',
    dismissKey: 'dhub_dismiss_partner_app_v1',
    dismissDays: 7,
};

/**
 * Route-Aware App Promotion Resolver
 * Enforces strict routing boundaries:
 * - /service-partner and partner subroutes -> PARTNER_APP_CONFIG
 * - All standard customer pages -> CUSTOMER_APP_CONFIG
 * - Excluded transactional/admin routes -> null (no promotion)
 */
export function getAppPromotionForRoute(pathname = '') {
    if (!pathname || typeof pathname !== 'string') {
        return CUSTOMER_APP_CONFIG;
    }

    const cleanPath = pathname.toLowerCase().trim();

    // 1. Explicitly Excluded routes (admin, API, active checkout, payment callbacks)
    const excludedPrefixes = [
        '/api',
        '/admin',
        '/checkout',
        '/appliances/checkout',
        '/services/checkout',
        '/spa-salon/booking/confirm',
        '/payment-failed',
        '/appliances/payment-failed',
        '/services/payment-failed',
        '/spa-salon/booking/failure',
        '/thank-you',
        '/services/thank-you',
        '/spa-salon/thank-you'
    ];

    for (const prefix of excludedPrefixes) {
        if (cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)) {
            return null;
        }
    }

    // 2. Service Partner routes (strict prefix matching)
    if (
        cleanPath === '/service-partner' ||
        cleanPath.startsWith('/service-partner/') ||
        cleanPath === '/partner' ||
        cleanPath.startsWith('/partner/') ||
        cleanPath.startsWith('/provider')
    ) {
        return PARTNER_APP_CONFIG;
    }

    // 3. All other public customer-facing routes promote Customer App
    return CUSTOMER_APP_CONFIG;
}

/**
 * Generates verified deep-link URLs and fallback store URLs
 */
export function resolveDeepLinkUrls(appConfig, currentPath = '/', queryParams = {}) {
    if (!appConfig) return null;

    const queryStr = new URLSearchParams(queryParams).toString();
    const qs = queryStr ? `?${queryStr}` : '';
    const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;

    // Universal Link: https://doorstephub.com/...
    const universalUrl = `https://${appConfig.universalHost}${cleanPath}${qs}`;

    // Custom Scheme: doorstephub://... or servicepartnerexpo://...
    const schemePath = cleanPath.replace(/^\//, '');
    const schemeUrl = `${appConfig.scheme}://${schemePath}${qs}`;

    return {
        universalUrl,
        schemeUrl,
        androidPlayStore: appConfig.android.playStoreUrl,
        iosAppStore: appConfig.ios.appStoreUrl,
    };
}

