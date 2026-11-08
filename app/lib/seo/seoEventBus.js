/**
 * SEO Event Bus System
 * Handles non-blocking execution of SEO actions (Cache invalidation, Sitemap update, IndexNow submission)
 */

import { submitToIndexNow } from './indexnow.js';

export const SEO_EVENTS = {
    PAGE_CREATED: 'PAGE_CREATED',
    PAGE_PUBLISHED: 'PAGE_PUBLISHED',
    PAGE_UPDATED: 'PAGE_UPDATED',
    PAGE_UNPUBLISHED: 'PAGE_UNPUBLISHED',
    PAGE_DELETED: 'PAGE_DELETED',
    PAGE_RESTORED: 'PAGE_RESTORED',
    PAGE_SLUG_CHANGED: 'PAGE_SLUG_CHANGED',
    PAGE_REDIRECTED: 'PAGE_REDIRECTED',
    PAGE_CANONICAL_CHANGED: 'PAGE_CANONICAL_CHANGED',
    PAGE_IMAGE_CHANGED: 'PAGE_IMAGE_CHANGED',
    PAGE_METADATA_CHANGED: 'PAGE_METADATA_CHANGED',
    PAGE_SCHEMA_CHANGED: 'PAGE_SCHEMA_CHANGED',
    BULK_IMPORT_COMPLETED: 'BULK_IMPORT_COMPLETED'
};

/**
 * Emits an SEO event safely without blocking primary business flows.
 * @param {string} eventName - One of SEO_EVENTS
 * @param {object} payload - Information about the affected page/entity
 */
export async function emitSEOEvent(eventName, payload = {}) {
    const { url, oldUrl } = payload;

    // Asynchronous background execution
    setImmediate(async () => {
        try {
            console.log(`[SEO Event Bus] ${eventName} triggered for ${url || oldUrl}`);

            switch (eventName) {
                case SEO_EVENTS.PAGE_PUBLISHED:
                case SEO_EVENTS.PAGE_UPDATED:
                case SEO_EVENTS.PAGE_METADATA_CHANGED:
                case SEO_EVENTS.PAGE_SCHEMA_CHANGED:
                case SEO_EVENTS.PAGE_IMAGE_CHANGED:
                    if (url) {
                        await submitToIndexNow([url], eventName);
                    }
                    break;

                case SEO_EVENTS.PAGE_SLUG_CHANGED:
                    const urlsToSubmit = [];
                    if (oldUrl) urlsToSubmit.push(oldUrl);
                    if (url) urlsToSubmit.push(url);
                    if (urlsToSubmit.length > 0) {
                        await submitToIndexNow(urlsToSubmit, eventName);
                    }
                    break;

                case SEO_EVENTS.PAGE_UNPUBLISHED:
                case SEO_EVENTS.PAGE_DELETED:
                    if (url) {
                        await submitToIndexNow([url], eventName);
                    }
                    break;

                case SEO_EVENTS.BULK_IMPORT_COMPLETED:
                    if (Array.isArray(payload.urls) && payload.urls.length > 0) {
                        await submitToIndexNow(payload.urls, eventName);
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error(`[SEO Event Bus Error] ${eventName}:`, error.message);
        }
    });

    return { queued: true, event: eventName };
}
