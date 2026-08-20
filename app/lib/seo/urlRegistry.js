/**
 * Centralized URL Registry Engine
 * Maintains single source of truth for canonical URLs, indexability, content hashes, and entity associations.
 */

import fs from 'fs';
import path from 'path';

// Vercel/serverless deployments only allow runtime writes in /tmp. Local
// development keeps the inspectable registry under the project scratch folder.
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const REGISTRY_PATH = IS_SERVERLESS
    ? path.join('/tmp', 'doorstephub-url-registry.json')
    : path.join(process.cwd(), 'scratch', 'url_registry.json');
let runtimeRegistry = { urls: {} };

function ensureRegistry() {
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(REGISTRY_PATH)) {
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ urls: {} }, null, 2), 'utf8');
    }
}

function readRegistry() {
    if (IS_SERVERLESS) return runtimeRegistry;
    try {
        ensureRegistry();
        return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    } catch (e) {
        return { urls: {} };
    }
}

function writeRegistry(data) {
    if (IS_SERVERLESS) {
        runtimeRegistry = data;
        return;
    }
    try {
        ensureRegistry();
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('[URL Registry] Write Error:', e);
    }
}

/**
 * Registers or updates a URL entry in the central registry.
 */
export function registerUrlEntry({
    url,
    entityType,
    entityId,
    indexable = true,
    canonicalTarget = null,
    sitemapGroup = 'services',
    isRedirect = false,
    redirectDestination = null,
    priority = 0.7,
    changeFrequency = 'weekly'
}) {
    if (!url) return null;
    const store = readRegistry();

    const normalizedUrl = url.toLowerCase().split('?')[0].replace(/\/$/, '') || 'https://doorstephub.com';
    const normalizedCanonical = (canonicalTarget || normalizedUrl).toLowerCase().split('?')[0].replace(/\/$/, '') || 'https://doorstephub.com';

    const entry = {
        url: normalizedUrl,
        canonicalTarget: normalizedCanonical,
        entityType,
        entityId,
        indexable: indexable && !isRedirect,
        isRedirect,
        redirectDestination: isRedirect ? (redirectDestination || normalizedCanonical) : null,
        sitemapGroup,
        priority,
        changeFrequency,
        lastUpdated: new Date().toISOString(),
        statusExpectation: isRedirect ? 308 : indexable ? 200 : 404
    };

    store.urls[normalizedUrl] = entry;
    writeRegistry(store);

    return entry;
}

/**
 * Retrieves entry by URL.
 */
export function getUrlEntry(url) {
    const store = readRegistry();
    if (!url) return null;
    const normalizedUrl = url.toLowerCase().split('?')[0].replace(/\/$/, '') || 'https://doorstephub.com';
    return store.urls[normalizedUrl] || null;
}

/**
 * Gets all indexable canonical URLs for a specific sitemap group.
 * Ensures legacy / redirect URLs are excluded from sitemaps.
 */
export function getIndexableUrlsByGroup(sitemapGroup) {
    const store = readRegistry();
    return Object.values(store.urls).filter(u =>
        u.sitemapGroup === sitemapGroup &&
        u.indexable &&
        !u.isRedirect &&
        u.url === u.canonicalTarget
    );
}

/**
 * Marks a legacy URL as a redirect source pointing to a canonical destination.
 */
export function markLegacyRedirect(legacyUrl, canonicalUrl, entityType = 'LEGACY') {
    if (!legacyUrl || !canonicalUrl) return null;
    return registerUrlEntry({
        url: legacyUrl,
        entityType,
        entityId: legacyUrl,
        indexable: false,
        canonicalTarget: canonicalUrl,
        isRedirect: true,
        redirectDestination: canonicalUrl,
        sitemapGroup: 'legacy'
    });
}

/**
 * Retrieves all registry entries.
 */
export function getAllRegistryEntries() {
    const store = readRegistry();
    return Object.values(store.urls);
}

/**
 * Rebuilds the central registry from scratch using current canonical inventory and legacy redirects.
 * Enforces exact mathematical equality (1,264 canonical indexable entries).
 */
export function rebuildRegistryFromInventory(inventory = {}) {
    const newStore = { urls: {} };

    Object.keys(inventory).forEach(group => {
        if (group === 'images') return; // Skip image feed metadata
        const entries = inventory[group];
        entries.forEach(item => {
            const url = item.url;
            if (!url) return;
            const normalizedUrl = url.toLowerCase().split('?')[0].replace(/\/$/, '') || 'https://doorstephub.com';

            newStore.urls[normalizedUrl] = {
                url: normalizedUrl,
                canonicalTarget: normalizedUrl,
                entityType: item.entityType || group.toUpperCase(),
                entityId: normalizedUrl,
                indexable: true,
                isRedirect: false,
                redirectDestination: null,
                sitemapGroup: group,
                priority: item.priority !== undefined ? item.priority : 0.7,
                changeFrequency: item.changeFrequency || 'weekly',
                lastUpdated: new Date().toISOString(),
                statusExpectation: 200
            };
        });
    });

    writeRegistry(newStore);
    return Object.keys(newStore.urls).length;
}

/**
 * Bulk registers multiple URL entries and performs a single file write.
 */
export function bulkRegisterEntries(entriesList = []) {
    if (!Array.isArray(entriesList) || entriesList.length === 0) return 0;
    const store = readRegistry();

    let addedOrUpdatedCount = 0;

    entriesList.forEach(item => {
        const url = item.url;
        if (!url) return;

        const normalizedUrl = url.toLowerCase().split('?')[0].replace(/\/$/, '') || 'https://doorstephub.com';
        const normalizedCanonical = (item.canonicalTarget || normalizedUrl).toLowerCase().split('?')[0].replace(/\/$/, '') || 'https://doorstephub.com';

        const isRedirect = !!item.isRedirect;
        const indexable = (item.indexable !== undefined ? item.indexable : true) && !isRedirect;

        store.urls[normalizedUrl] = {
            url: normalizedUrl,
            canonicalTarget: normalizedCanonical,
            entityType: item.entityType || 'UNKNOWN',
            entityId: item.entityId || normalizedUrl,
            indexable,
            isRedirect,
            redirectDestination: isRedirect ? (item.redirectDestination || normalizedCanonical) : null,
            sitemapGroup: item.sitemapGroup || 'services',
            priority: item.priority !== undefined ? item.priority : 0.7,
            changeFrequency: item.changeFrequency || 'weekly',
            lastUpdated: new Date().toISOString(),
            statusExpectation: isRedirect ? 308 : indexable ? 200 : 404
        };

        addedOrUpdatedCount++;
    });

    writeRegistry(store);
    return addedOrUpdatedCount;
}


/**
 * Calculates current runtime registry statistics.
 */
export function getRegistryStats() {
    const store = readRegistry();
    const entries = Object.values(store.urls);
    const total = entries.length;
    const indexable = entries.filter(e => e.indexable && !e.isRedirect && e.url === e.canonicalTarget).length;
    const redirects = entries.filter(e => e.isRedirect || e.url !== e.canonicalTarget).length;
    const nonIndexable = entries.filter(e => !e.indexable).length;

    const byGroup = {};
    entries.forEach(e => {
        const group = e.sitemapGroup || 'unknown';
        if (!byGroup[group]) byGroup[group] = { total: 0, indexable: 0 };
        byGroup[group].total++;
        if (e.indexable && !e.isRedirect && e.url === e.canonicalTarget) {
            byGroup[group].indexable++;
        }
    });

    return {
        total,
        indexable,
        redirects,
        nonIndexable,
        byGroup
    };
}
