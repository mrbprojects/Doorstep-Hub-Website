/**
 * Redirect Manager
 * Handles permanent 301 redirects, slug tracking, and collision prevention.
 */

// In-memory static redirect mapping (can be synced with DB)
const redirectsMap = new Map([
    // Example legacy redirect rules:
    ['/services/appliance-repair', '/appliances'],
    ['/services/spa', '/spa-salon'],
    ['/services/pg', '/pghostels'],
]);

/**
 * Returns redirect destination URL if matching rule exists, or null.
 */
export function getRedirect(path) {
    if (!path) return null;
    const normalizedPath = path.toLowerCase().replace(/\/$/, '');
    
    if (redirectsMap.has(normalizedPath)) {
        const destination = redirectsMap.get(normalizedPath);
        
        // Loop prevention check
        if (destination === normalizedPath) {
            return null;
        }
        
        return {
            destination,
            statusCode: 301,
            permanent: true
        };
    }
    
    return null;
}

/**
 * Registers a new 301 redirect rule.
 */
export function registerRedirect(sourcePath, destinationPath) {
    if (!sourcePath || !destinationPath) return false;
    const src = sourcePath.toLowerCase().replace(/\/$/, '');
    const dest = destinationPath.toLowerCase().replace(/\/$/, '');
    
    if (src === dest) return false; // Prevent self-loop
    
    redirectsMap.set(src, dest);
    return true;
}
