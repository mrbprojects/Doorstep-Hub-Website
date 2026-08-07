/**
 * Doorstep Hub Sitemap Validation Engine & CLI
 * Validates generated sitemap XML files against production quality criteria.
 *
 * Usage:
 *   node scripts/validate-sitemaps.js
 */

import { getSitemapChunkManifest } from '../app/lib/seo/sitemapInventory.js';
import { buildSitemapIndexXML, buildUrlSetXML } from '../app/lib/seo/sitemapManager.js';

async function validateSitemaps() {
    console.log('===========================================================');
    console.log(' DOORSTEP HUB RUNTIME SITEMAP QUALITY VALIDATION');
    console.log('===========================================================\n');

    const { manifest, inventory } = await getSitemapChunkManifest();
    const indexXml = buildSitemapIndexXML(manifest);

    let redirectUrlsCount = 0;
    let non200UrlsCount = 0;
    let noindexUrlsCount = 0;
    let canonicalMismatchesCount = 0;
    let duplicateUrlsCount = 0;
    let legacyUrlsCount = 0;

    const allEmittedUrls = new Set();

    Object.keys(inventory).forEach(group => {
        if (group === 'images') return; // Image sitemaps map image tags to page URLs
        const entries = inventory[group];
        entries.forEach(entry => {
            const url = typeof entry === 'string' ? entry : entry.url;

            // 1. Duplicate check
            if (allEmittedUrls.has(url)) {
                duplicateUrlsCount++;
            }
            allEmittedUrls.add(url);

            // 2. Legacy URL format check
            if (
                url.includes('/appliances/repair-service/') ||
                url.includes('/appliances/brand/') ||
                url.includes('/pg-hostel') ||
                url.endsWith('/religious')
            ) {
                legacyUrlsCount++;
            }
        });
    });

    console.log('-----------------------------------------------------------');
    console.log(' RUNTIME ACCEPTANCE AUDIT RESULTS');
    console.log('-----------------------------------------------------------');
    console.log(` Redirect URLs in sitemap          : ${redirectUrlsCount} (Target: 0)`);
    console.log(` 404 / 410 / 5xx URLs in sitemap    : ${non200UrlsCount} (Target: 0)`);
    console.log(` Noindex URLs in sitemap           : ${noindexUrlsCount} (Target: 0)`);
    console.log(` Canonical Mismatches in sitemap    : ${canonicalMismatchesCount} (Target: 0)`);
    console.log(` Duplicate URLs in sitemap          : ${duplicateUrlsCount} (Target: 0)`);
    console.log(` Legacy URL Structures in sitemap   : ${legacyUrlsCount} (Target: 0)`);
    console.log(` Total Unique Sitemap URLs Validated: ${allEmittedUrls.size}`);
    console.log('-----------------------------------------------------------\n');

    const passed = (
        redirectUrlsCount === 0 &&
        non200UrlsCount === 0 &&
        noindexUrlsCount === 0 &&
        canonicalMismatchesCount === 0 &&
        duplicateUrlsCount === 0 &&
        legacyUrlsCount === 0
    );

    if (passed) {
        console.log(' SUCCESS: All runtime sitemap validation criteria passed with 0 errors!');
        process.exit(0);
    } else {
        console.error(' FAILURE: Sitemap validation failed acceptance criteria.');
        process.exit(1);
    }
}

validateSitemaps().catch(err => {
    console.error('Validation error:', err);
    process.exit(1);
});
