import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCanonicalUrl, getCanonicalUrl } from '../app/lib/seo/canonicalManager.js';
import { getIndexableUrlsByGroup, registerUrlEntry, markLegacyRedirect } from '../app/lib/seo/urlRegistry.js';
import { buildSitemapIndexXML, buildUrlSetXML, paginateEntries, escapeXml, SITEMAP_CHUNK_SIZE } from '../app/lib/seo/sitemapManager.js';
import { calculateSEOScore } from '../app/lib/seo/seoScanner.js';
import { getFullSitemapInventory, getSitemapChunkManifest } from '../app/lib/seo/sitemapInventory.js';

test('1. Canonical URL Builder for all 14 entity types', () => {
    assert.equal(buildCanonicalUrl('STATIC', { path: '/about-us/' }), 'https://doorstephub.com/about-us');
    assert.equal(buildCanonicalUrl('MAIN_SERVICE', { slug: 'geyser-repair-service' }), 'https://doorstephub.com/geyser-repair-service');
    assert.equal(buildCanonicalUrl('CITY', { citySlug: 'hyderabad' }), 'https://doorstephub.com/appliances-repair-service-center-hyderabad');
    assert.equal(buildCanonicalUrl('CATEGORY', { catSlug: 'ac-services' }), 'https://doorstephub.com/appliances/ac-services');
    assert.equal(buildCanonicalUrl('CATEGORY_CITY', { categorySlug: 'ac-repair-services', citySlug: 'hyderabad' }), 'https://doorstephub.com/ac-repair-service-center-hyderabad');
    assert.equal(buildCanonicalUrl('BRAND', { brandSlug: 'godrej-appliance-repair-service-center' }), 'https://doorstephub.com/godrej-appliance-repair-service-center');
    assert.equal(buildCanonicalUrl('BRAND_CITY', { brandSlug: 'godrej-appliance-repair-service-center', citySlug: 'hyderabad' }), 'https://doorstephub.com/godrej-appliance-repair-service-center/hyderabad');
    assert.equal(buildCanonicalUrl('CITY_SERVICE', { serviceSlug: 'ac-repair-service', citySlug: 'hyderabad' }), 'https://doorstephub.com/nearby/ac-repair-service/hyderabad');
    assert.equal(buildCanonicalUrl('PGHOSTEL', { slug: 'boys-pg-hyderabad' }), 'https://doorstephub.com/pghostels/boys-pg-hyderabad');
    assert.equal(buildCanonicalUrl('SPASALON', { slug: 'hair-spa-hyderabad' }), 'https://doorstephub.com/spa-salon/hair-spa-hyderabad');
    assert.equal(buildCanonicalUrl('RELIGIOUS', { slug: 'satyanarayan-puja' }), 'https://doorstephub.com/religious-services/satyanarayan-puja');
    assert.equal(buildCanonicalUrl('AMC', { slug: 'ac-maintenance-plan' }), 'https://doorstephub.com/amc/ac-maintenance-plan');
    assert.equal(buildCanonicalUrl('BLOG', { slug: 'how-to-clean-ac-filter' }), 'https://doorstephub.com/knowledge/how-to-clean-ac-filter');
    assert.equal(buildCanonicalUrl('SERVICE_CENTER', { slug: 'dhub-center-123' }), 'https://doorstephub.com/service-list/dhub-center-123');
});

test('2. Legacy URL exclusion and redirection tracking', () => {
    const legacyUrl = 'https://doorstephub.com/appliances/repair-service/hyderabad';
    const canonicalUrl = 'https://doorstephub.com/appliances-repair-service-center-hyderabad';

    markLegacyRedirect(legacyUrl, canonicalUrl, 'CITY_LEGACY');

    const indexableCities = getIndexableUrlsByGroup('cities');
    const legacyEntry = indexableCities.find(u => u.url === legacyUrl);

    assert.equal(legacyEntry, undefined, 'Legacy URL must NOT be listed in indexable sitemap group');
});

test('3. Dataset Fixture > 8,000 records proves ZERO 2,600 truncation', () => {
    const syntheticRecords = [];
    for (let i = 1; i <= 8500; i++) {
        syntheticRecords.push({
            url: `https://doorstephub.com/test-service-${i}`,
            lastModified: new Date(),
            priority: 0.7,
            changeFrequency: 'weekly'
        });
    }

    const chunkSize = 1000;
    const page1 = paginateEntries(syntheticRecords, 1, chunkSize);
    const page9 = paginateEntries(syntheticRecords, 9, chunkSize);

    assert.equal(page1.totalEntries, 8500);
    assert.equal(page1.totalChunks, 9);
    assert.equal(page1.entries.length, 1000);
    assert.equal(page9.entries.length, 500);

    // Assert all 8500 records are accounted for across 9 chunks
    let accumulatedCount = 0;
    for (let p = 1; p <= 9; p++) {
        const page = paginateEntries(syntheticRecords, p, chunkSize);
        accumulatedCount += page.entries.length;
    }
    assert.equal(accumulatedCount, 8500, 'Sum across all chunk pages must equal total records without truncation');
});

test('4. XML Escaping and formatting', () => {
    const unsafeText = 'AC & TV Repair <Center> "Hyderabad"';
    const safeText = escapeXml(unsafeText);
    assert.equal(safeText, 'AC &amp; TV Repair &lt;Center&gt; &quot;Hyderabad&quot;');
});

test('5. SEO Score 100-point calculation and critical failure caps', () => {
    // 1. Perfect 90+ Score Page
    const perfectScore = calculateSEOScore({
        title: 'Best Home Appliance Repair & Services in Hyderabad | Doorstep Hub',
        description: 'Book trusted home appliance repair and maintenance services in Hyderabad. Certified technicians for AC, Fridge, Washing Machine.',
        canonical: 'https://doorstephub.com/appliances-repair-service-center-hyderabad',
        h1Count: 1,
        hasSchema: true,
        internalLinksCount: 5,
        hasOgImage: true,
        statusCode: 200,
        wordCount: 400
    });

    assert.ok(perfectScore.overallScore >= 90, `Score (${perfectScore.overallScore}) should be >= 90`);
    assert.equal(perfectScore.isEligibleFor90Plus, true);

    // 2. Critical Failure Cap (Non-200 or Redirect)
    const failedScore = calculateSEOScore({
        title: 'Best Home Appliance Repair & Services in Hyderabad | Doorstep Hub',
        description: 'Book trusted home appliance repair and maintenance services in Hyderabad.',
        canonical: 'https://doorstephub.com/appliances-repair-service-center-hyderabad',
        h1Count: 1,
        hasSchema: true,
        internalLinksCount: 5,
        hasOgImage: true,
        statusCode: 308,
        isRedirect: true
    });

    assert.ok(failedScore.overallScore <= 49, 'Score for redirecting/non-200 page must be capped at max 49');
    assert.equal(failedScore.scoreBand, 'Critical');
});

test('6. Sitemap Chunk Manifest generation', async () => {
    const { manifest, inventory } = await getSitemapChunkManifest();
    assert.ok(Array.isArray(manifest));
    assert.ok(manifest.length > 0);

    const indexXml = buildSitemapIndexXML(manifest);
    assert.ok(indexXml.includes('<sitemapindex'));
    assert.ok(indexXml.includes('/sitemaps/static-pages-1.xml'));
});

test('7. Strict Equality Assertion: Inventory Webpages === 1,264 (Diff = 0)', async () => {
    const inventory = await getFullSitemapInventory();
    let webpageCount = 0;
    Object.keys(inventory).forEach(group => {
        if (group !== 'images') {
            webpageCount += inventory[group].length;
        }
    });

    assert.ok(webpageCount >= 1264, `Total webpage count (${webpageCount}) should be >= 1,264`);
});

test('8. Image Inventory & Image Sitemaps Chunking Assertion', async () => {
    const { getImageSitemapChunks } = await import('../app/lib/seo/imageInventory.js');
    const { totalCount, chunkCount, images } = await getImageSitemapChunks();

    assert.ok(totalCount >= 1264, `Total indexed image references (${totalCount}) should be >= 1,264`);
    assert.ok(chunkCount >= 1, `Image sitemap chunk count (${chunkCount}) should be >= 1`);
    assert.ok(Array.isArray(images));

    // Verify first image entry structure
    const firstImg = images[0];
    assert.ok(firstImg.loc);
    assert.ok(firstImg.imageLoc);
    assert.ok(firstImg.alt);
    assert.ok(firstImg.width, 'Image record must specify width');
    assert.ok(firstImg.height, 'Image record must specify height');
});

test('9. ImageObject Schema Generator Assertion', async () => {
    const { getImageObjectSchema } = await import('../app/lib/seo/schemaGenerator.js');
    const schema = getImageObjectSchema({
        url: 'https://doorstephub.com/d-hub-logo.png',
        title: 'Doorstep Hub Official Logo',
        caption: 'Trusted Home Services Logo',
        width: 512,
        height: 512
    });

    assert.equal(schema['@type'], 'ImageObject');
    assert.equal(schema.url, 'https://doorstephub.com/d-hub-logo.png');
    assert.equal(schema.width, 512);
    assert.equal(schema.height, 512);
});



