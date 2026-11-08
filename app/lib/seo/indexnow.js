/**
 * IndexNow Provider Service
 * Handles non-blocking, validated, deduplicated submissions to IndexNow API endpoints.
 */

import fs from 'fs';
import path from 'path';

function getEnvVariable(key, fallback = '') {
    if (process.env[key]) return process.env[key];
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(new RegExp(`${key}=(.+)`));
            if (match) return match[1].trim();
        }
    } catch {}
    return fallback;
}

const SITE_URL = (getEnvVariable('SITE_URL') || 'https://doorstephub.com').replace(/\/$/, '');
const INDEXNOW_KEY = getEnvVariable('INDEXNOW_KEY', 'cdd9d51a38dd44028c3d5b42ba77eae5');
const INDEXNOW_ENDPOINT = getEnvVariable('INDEXNOW_ENDPOINT') || 'https://api.indexnow.org/indexnow';
const INDEXNOW_ENABLED = getEnvVariable('INDEXNOW_ENABLED') !== 'false';

// In-memory deduplication cache (URL + timestamp)
const recentSubmissions = new Map();
const DEDUPLICATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const INDEXNOW_BATCH_SIZE = 10000;

/**
 * Validates and normalizes a target URL for IndexNow submission.
 * Returns normalized URL string or null if invalid/blocked.
 */
export function normalizeAndValidateUrl(url) {
    if (!url) return null;
    try {
        let fullUrl = url;
        if (url.startsWith('/')) {
            fullUrl = `${SITE_URL}${url}`;
        }
        const parsed = new URL(fullUrl);

        // Security check: Must match configured host
        const allowedHost = new URL(SITE_URL).host;
        if (parsed.host !== allowedHost) {
            return null;
        }

        // Must be HTTPS in production
        if (parsed.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
            return null;
        }

        // Exclude non-indexable private/admin/checkout paths
        const blockedPrefixes = [
            '/admin', '/account', '/checkout', '/cart', '/api/',
            '/auth', '/login', '/signup', '/preview', '/_next/'
        ];
        if (blockedPrefixes.some(prefix => parsed.pathname.startsWith(prefix))) {
            return null;
        }

        // Remove fragments
        parsed.hash = '';

        return parsed.toString();
    } catch {
        return null;
    }
}

/**
 * Submits a list of URLs to IndexNow with exponential backoff retry.
 * Non-blocking operation.
 */
export async function submitToIndexNow(urls, ) {
    if (!INDEXNOW_ENABLED) {
        return { success: false, reason: 'IndexNow disabled by configuration' };
    }

    const urlList = Array.isArray(urls) ? urls : [urls];
    const validUrls = [];

    const now = Date.now();
    for (const rawUrl of urlList) {
        const normalized = normalizeAndValidateUrl(rawUrl);
        if (!normalized) continue;

        // Deduplication check
        const lastSubmitted = recentSubmissions.get(normalized);
        if (lastSubmitted && (now - lastSubmitted) < DEDUPLICATION_WINDOW_MS) {
            continue; // Skip recent submission
        }

        validUrls.push(normalized);
        recentSubmissions.set(normalized, now);
    }

    // Clean up old deduplication cache entries
    for (const [k, v] of recentSubmissions.entries()) {
        if (now - v > DEDUPLICATION_WINDOW_MS) {
            recentSubmissions.delete(k);
        }
    }

    if (validUrls.length === 0) {
        return { success: true, count: 0, message: 'No new valid URLs to submit' };
    }

    const payload = {
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: validUrls.slice(0, INDEXNOW_BATCH_SIZE) // Max IndexNow batch limit
    };

    return executeIndexNowRequest(payload);
}

/**
 * Submits every supplied URL, splitting large sitemap inventories into the
 * maximum batch size accepted by IndexNow.
 */
export async function submitAllToIndexNow(urls, ) {
    const uniqueUrls = [...new Set((Array.isArray(urls) ? urls : [urls]).filter(Boolean))];
    const batches = [];

    for (let start = 0; start < uniqueUrls.length; start += INDEXNOW_BATCH_SIZE) {
        const batch = uniqueUrls.slice(start, start + INDEXNOW_BATCH_SIZE);
        batches.push(await submitToIndexNow(batch));
    }

    const submittedCount = batches.reduce((total, result) => total + (result?.count || 0), 0);
    return {
        success: batches.every(result => result?.success),
        requestedCount: uniqueUrls.length,
        submittedCount,
        batches
    };
}

async function executeIndexNowRequest(payload, attempt = 1, maxRetries = 3) {
    const startTime = Date.now();
    try {
        const response = await fetch(INDEXNOW_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'User-Agent': 'DoorstepHub-SEOEngine/1.0'
            },
            body: JSON.stringify(payload)
        });

        const latency = Date.now() - startTime;
        const status = response.status;

        if (status === 200 || status === 202) {
            return {
                success: true,
                status,
                count: payload.urlList.length,
                latency,
                urls: payload.urlList
            };
        }

        const errorBody = await response.text();
        console.error(`[IndexNow API Error ${status}]:`, errorBody);

        // Retry transient errors (408, 429, 5xx)
        if ([408, 429, 500, 502, 503, 504].includes(status) && attempt <= maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
            await new Promise(res => setTimeout(res, backoffMs));
            return executeIndexNowRequest(payload, attempt + 1, maxRetries);
        }

        return {
            success: false,
            status,
            error: `IndexNow HTTP error ${status}`,
            urls: payload.urlList
        };
    } catch (error) {
        if (attempt <= maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            await new Promise(res => setTimeout(res, backoffMs));
            return executeIndexNowRequest(payload, attempt + 1, maxRetries);
        }
        return {
            success: false,
            error: error.message || 'Network failure',
            urls: payload.urlList
        };
    }
}
