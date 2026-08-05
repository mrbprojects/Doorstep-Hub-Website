/**
 * Centralized URL Registry Engine
 * Maintains single source of truth for canonical URLs, indexability, content hashes, and entity associations.
 */

import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.join(process.cwd(), 'scratch', 'url_registry.json');

function ensureRegistry() {
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(REGISTRY_PATH)) {
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ urls: {} }, null, 2), 'utf8');
    }
}

function readRegistry() {
    ensureRegistry();
    try {
        return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    } catch (e) {
        return { urls: {} };
    }
}

function writeRegistry(data) {
    ensureRegistry();
    try {
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('[URL Registry] Write Error:', e);
    }
}

/**
 * Registers or updates a URL entry in the central registry.
 */
export function registerUrlEntry({ url, entityType, entityId, indexable = true, canonicalTarget = null, sitemapGroup = 'services' }) {
    if (!url) return null;
    const store = readRegistry();

    const normalizedUrl = url.toLowerCase().split('?')[0].replace(/\/$/, '');

    const entry = {
        url: normalizedUrl,
        canonicalTarget: canonicalTarget || normalizedUrl,
        entityType,
        entityId,
        indexable,
        sitemapGroup,
        lastUpdated: new Date().toISOString(),
        statusExpectation: indexable ? 200 : 404
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
    const normalizedUrl = url.toLowerCase().split('?')[0].replace(/\/$/, '');
    return store.urls[normalizedUrl] || null;
}

/**
 * Gets all indexable URLs for a specific sitemap group.
 */
export function getIndexableUrlsByGroup(sitemapGroup) {
    const store = readRegistry();
    return Object.values(store.urls).filter(u => u.sitemapGroup === sitemapGroup && u.indexable);
}
