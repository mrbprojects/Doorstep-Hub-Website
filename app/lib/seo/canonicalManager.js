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
