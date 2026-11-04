/**
 * Privacy-Conscious App Promotion Analytics
 * Pushes structured conversion and engagement events to GTM dataLayer without personal or sensitive data.
 */

export const PROMOTION_EVENTS = {
    IMPRESSION: 'app_banner_impression',
    CLICK: 'app_banner_click',
    DISMISS: 'app_banner_dismiss',
    STORE_CLICK: 'app_store_click',
    OPEN_CLICK: 'app_open_click',
    QR_CLICK: 'app_qr_click',
    DETAILS_OPEN: 'app_promotion_details_open',
};

/**
 * Detect client device category & operating system safely
 */
function getDeviceContext() {
    if (typeof window === 'undefined') {
        return { deviceCategory: 'unknown', os: 'unknown', browser: 'unknown' };
    }

    const ua = navigator.userAgent || '';
    let os = 'other';
    let deviceCategory = 'desktop';

    if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        os = 'ios';
        deviceCategory = 'tablet';
    } else if (/iPhone|iPod/i.test(ua)) {
        os = 'ios';
        deviceCategory = 'mobile';
    } else if (/Android/i.test(ua)) {
        os = 'android';
        deviceCategory = /Mobile/i.test(ua) ? 'mobile' : 'tablet';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
        os = 'macos';
        deviceCategory = 'desktop';
    } else if (/Windows NT/i.test(ua)) {
        os = 'windows';
        deviceCategory = 'desktop';
    } else if (/Linux/i.test(ua)) {
        os = 'linux';
        deviceCategory = 'desktop';
    }

    let browser = 'other';
    if (/Chrome|CriOS/i.test(ua) && !/Edge|OPR/i.test(ua)) browser = 'chrome';
    else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) browser = 'safari';
    else if (/Firefox|FxiOS/i.test(ua)) browser = 'firefox';
    else if (/Edg/i.test(ua)) browser = 'edge';

    return { deviceCategory, os, browser };
}

/**
 * Tracks an app promotion event
 */
export function trackAppPromotionEvent(eventName, {
    appType = 'customer',
    pagePath = '',
    placement = 'mobile_banner',
    storeType = null,
    campaignId = 'organic_web',
} = {}) {
    if (typeof window === 'undefined') return;

    try {
        const { deviceCategory, os, browser } = getDeviceContext();

        const payload = {
            event: eventName,
            app_type: appType,
            page_path: pagePath || window.location.pathname,
            placement,
            store_type: storeType,
            campaign_id: campaignId,
            device_category: deviceCategory,
            operating_system: os,
            browser_category: browser,
            timestamp: new Date().toISOString(),
        };

        // Push to Google Tag Manager dataLayer if available
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);

        if (process.env.NODE_ENV === 'development') {
            console.log(`[AppPromotionAnalytics] ${eventName}`, payload);
        }
    } catch (err) {
        // Silently catch to prevent any user impact
    }
}

