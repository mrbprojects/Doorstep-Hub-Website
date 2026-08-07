import { buildCanonicalUrl } from './canonicalManager.js';
import { registerUrlEntry, markLegacyRedirect } from './urlRegistry.js';
import { getStaticSitemapEntries, SITEMAP_CHUNK_SIZE } from './sitemapManager.js';

const BASE_URL = 'https://doorstephub.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

async function fetchAPI(endpoint, body = null, method = 'POST', attempts = 3) {
    for (let i = 1; i <= attempts; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const config = {
                method,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'DoorstepHub-SitemapInventory/1.0'
                },
            };
            if (body) config.body = JSON.stringify(body);
            const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
            clearTimeout(timeoutId);
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            if (i < attempts) {
                await new Promise(r => setTimeout(r, 500 * i));
            }
        }
    }
    return null;
}


/**
 * Rebuilds the entire sitemap inventory from primary APIs / database entities.
 * Returns grouped canonical entries and populates the URL Registry.
 */
export async function getFullSitemapInventory() {
    const inventory = {
        'static-pages': [],
        'services': [],
        'cities': [],
        'categories': [],
        'brands': [],
        'city-categories': [],
        'city-brands': [],
        'city-services': [],
        'pghostels': [],
        'spa-salon': [],
        'religious': [],
        'amc': [],
        'images': []
    };

    // 1. Static Pages
    const staticEntries = getStaticSitemapEntries();
    staticEntries.forEach(entry => {
        const url = entry.url;
        inventory['static-pages'].push(entry);
        registerUrlEntry({
            url,
            entityType: 'STATIC',
            entityId: url.replace(BASE_URL, '') || '/',
            indexable: true,
            sitemapGroup: 'static-pages',
            priority: entry.priority,
            changeFrequency: entry.changeFrequency
        });
    });

    // Fetch primary data sources in parallel
    const [
        servicesRes,
        citiesRes,
        categoriesRes,
        brandsRes,
        pgRes,
        spaRes
    ] = await Promise.all([
        fetchAPI('/app/applience-repairs-website/all-services', null, 'GET'),
        fetchAPI('/app/cities/cities_list', null, 'GET'),
        fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' }),
        fetchAPI('/app/brands/all_brands', null, 'GET'),
        fetchAPI('/app/products/featured_pg_hostels', null, 'GET'),
        fetchAPI('/app/products/all_spa_stores', null, 'GET')
    ]);

    const DEFAULT_SERVICES = [
        { slug: 'ac-repair-service' },
        { slug: 'refrigerator-repair-service' },
        { slug: 'washing-machine-repair-service' },
        { slug: 'microwave-repair-service' }
    ];

    const services = (servicesRes?.success && Array.isArray(servicesRes.data) && servicesRes.data.length >= 4) ? servicesRes.data.slice(0, 4) : DEFAULT_SERVICES;
    const cities = (citiesRes?.success && Array.isArray(citiesRes.cities) && citiesRes.cities.length > 0) ? citiesRes.cities : [];
    const categories = (categoriesRes?.success && Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) ? categoriesRes.data : [];
    const brands = (brandsRes?.success && Array.isArray(brandsRes.brands) && brandsRes.brands.length > 0) ? brandsRes.brands : [];

    // 2. Main Services
    services.forEach(s => {
        const slug = s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (slug) {
            const canonicalUrl = buildCanonicalUrl('MAIN_SERVICE', { slug });
            const entry = { url: canonicalUrl, priority: 0.9, changeFrequency: 'weekly', lastModified: new Date() };
            inventory['services'].push(entry);
            registerUrlEntry({
                url: canonicalUrl,
                entityType: 'MAIN_SERVICE',
                entityId: s._id || slug,
                indexable: true,
                sitemapGroup: 'services',
                priority: 0.9,
                changeFrequency: 'weekly'
            });
        }
    });

    // 3. City Landing Pages (Canonical Flat Format: /appliances-repair-service-center-{citySlug})
    cities.forEach(c => {
        const citySlug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-');
        if (citySlug) {
            const canonicalUrl = buildCanonicalUrl('CITY', { citySlug });
            const legacyUrl = `${BASE_URL}/appliances/repair-service/${citySlug}`;

            inventory['cities'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() });
            registerUrlEntry({
                url: canonicalUrl,
                entityType: 'CITY',
                entityId: c._id || citySlug,
                indexable: true,
                sitemapGroup: 'cities',
                priority: 0.8,
                changeFrequency: 'weekly'
            });
            markLegacyRedirect(legacyUrl, canonicalUrl, 'CITY_LEGACY');
        }
    });

    // 4. Categories
    categories.forEach(cat => {
        const catSlug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (catSlug) {
            const canonicalUrl = buildCanonicalUrl('CATEGORY', { catSlug });
            inventory['categories'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() });
            registerUrlEntry({
                url: canonicalUrl,
                entityType: 'CATEGORY',
                entityId: cat._id || catSlug,
                indexable: true,
                sitemapGroup: 'categories',
                priority: 0.8,
                changeFrequency: 'weekly'
            });
        }
    });

    // 5. Brands
    brands.forEach(b => {
        const brandSlug = b.slug || (b.name ? b.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (brandSlug) {
            const canonicalUrl = buildCanonicalUrl('BRAND', { brandSlug });
            const legacyUrl = `${BASE_URL}/appliances/brand/${brandSlug}`;

            inventory['brands'].push({ url: canonicalUrl, priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() });
            registerUrlEntry({
                url: canonicalUrl,
                entityType: 'BRAND',
                entityId: b._id || brandSlug,
                indexable: true,
                sitemapGroup: 'brands',
                priority: 0.7,
                changeFrequency: 'monthly'
            });
            markLegacyRedirect(legacyUrl, canonicalUrl, 'BRAND_LEGACY');
        }
    });

    // 6. City + Category Combinations (e.g. /ac-repair-service-center-hyderabad)
    cities.forEach(c => {
        const citySlug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-');
        if (!citySlug) return;

        categories.forEach(cat => {
            const catSlug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : '');
            if (!catSlug) return;

            const canonicalUrl = buildCanonicalUrl('CATEGORY_CITY', { categorySlug: catSlug, citySlug });
            const legacyUrl = `${BASE_URL}/appliances/repair-service/${citySlug}/${catSlug}`;

            inventory['city-categories'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() });
            registerUrlEntry({
                url: canonicalUrl,
                entityType: 'CATEGORY_CITY',
                entityId: `${citySlug}_${catSlug}`,
                indexable: true,
                sitemapGroup: 'city-categories',
                priority: 0.8,
                changeFrequency: 'weekly'
            });
            markLegacyRedirect(legacyUrl, canonicalUrl, 'CATEGORY_CITY_LEGACY');
        });
    });

    // 7. City + Brand Combinations (e.g. /godrej-appliance-repair-service-center/hyderabad)
    cities.forEach(c => {
        const citySlug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-');
        if (!citySlug) return;

        brands.forEach(b => {
            const brandSlug = b.slug || (b.name ? b.name.toLowerCase().replace(/\s+/g, '-') : '');
            if (!brandSlug) return;

            const canonicalUrl = buildCanonicalUrl('BRAND_CITY', { brandSlug, citySlug });
            const legacyUrl1 = `${BASE_URL}/${citySlug}/${brandSlug}`;

            inventory['city-brands'].push({ url: canonicalUrl, priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() });
            registerUrlEntry({
                url: canonicalUrl,
                entityType: 'BRAND_CITY',
                entityId: `${citySlug}_${brandSlug}`,
                indexable: true,
                sitemapGroup: 'city-brands',
                priority: 0.7,
                changeFrequency: 'monthly'
            });
            markLegacyRedirect(legacyUrl1, canonicalUrl, 'BRAND_CITY_LEGACY');
        });
    });

    // 8. City + Service Combinations (e.g. /nearby/ac-repair-service/hyderabad)
    cities.forEach(c => {
        const citySlug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-');
        if (!citySlug) return;

        services.forEach(s => {
            const serviceSlug = s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : '');
            if (!serviceSlug) return;

            const canonicalUrl = buildCanonicalUrl('CITY_SERVICE', { serviceSlug, citySlug });
            const legacyUrl = `${BASE_URL}/service-list/book-now/${serviceSlug}?city=${citySlug}`;

            inventory['city-services'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() });
            registerUrlEntry({
                url: canonicalUrl,
                entityType: 'CITY_SERVICE',
                entityId: `${citySlug}_${serviceSlug}`,
                indexable: true,
                sitemapGroup: 'city-services',
                priority: 0.8,
                changeFrequency: 'weekly'
            });
            markLegacyRedirect(legacyUrl, canonicalUrl, 'CITY_SERVICE_LEGACY');
        });
    });

    // 9. PG Hostels
    const pgPaths = [
        '/pghostels', '/pghostels/listings/boys-pg', '/pghostels/listings/girls-pg', '/pghostels/listings/coliving'
    ];
    pgPaths.forEach(path => {
        const url = `${BASE_URL}${path}`;
        inventory['pghostels'].push({ url, priority: 0.8, changeFrequency: 'daily', lastModified: new Date() });
        registerUrlEntry({ url, entityType: 'PGHOSTEL', entityId: path, indexable: true, sitemapGroup: 'pghostels', priority: 0.8, changeFrequency: 'daily' });
    });
    markLegacyRedirect(`${BASE_URL}/pg-hostel`, `${BASE_URL}/pghostels`, 'PGHOSTEL_LEGACY');

    const hostels = (pgRes?.success && Array.isArray(pgRes.hostels)) ? pgRes.hostels : [];
    hostels.forEach(h => {
        const slug = h.slug || h.hostelSlug || h._id;
        if (slug) {
            const canonicalUrl = buildCanonicalUrl('PGHOSTEL', { slug });
            inventory['pghostels'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() });
            registerUrlEntry({ url: canonicalUrl, entityType: 'PGHOSTEL', entityId: slug, indexable: true, sitemapGroup: 'pghostels', priority: 0.8, changeFrequency: 'weekly' });
        }
    });

    // 10. Spa & Salon
    const spaPaths = [
        '/spa-salon', '/spa-salon/packages',
        '/spa-salon/category/facial-spa', '/spa-salon/category/hair-care',
        '/spa-salon/category/body-massage', '/spa-salon/category/manicure-pedicure'
    ];
    spaPaths.forEach(path => {
        const url = `${BASE_URL}${path}`;
        inventory['spa-salon'].push({ url, priority: 0.8, changeFrequency: 'daily', lastModified: new Date() });
        registerUrlEntry({ url, entityType: 'SPASALON', entityId: path, indexable: true, sitemapGroup: 'spa-salon', priority: 0.8, changeFrequency: 'daily' });
    });

    const spaStores = (spaRes?.success && Array.isArray(spaRes.stores)) ? spaRes.stores : [];
    spaStores.forEach(s => {
        const slug = s.slug || s._id;
        if (slug) {
            const canonicalUrl = buildCanonicalUrl('SPASALON', { slug });
            inventory['spa-salon'].push({ url: canonicalUrl, priority: 0.7, changeFrequency: 'weekly', lastModified: new Date() });
            registerUrlEntry({ url: canonicalUrl, entityType: 'SPASALON', entityId: slug, indexable: true, sitemapGroup: 'spa-salon', priority: 0.7, changeFrequency: 'weekly' });
        }
    });

    // 11. Religious Services
    const religiousPaths = [
        '/religious-services', '/religious-services/all-services', '/religious-services/category',
        '/religious-services/category/griha-pravesh', '/religious-services/category/satyanarayan-puja',
        '/religious-services/category/ganesh-puja'
    ];
    religiousPaths.forEach(path => {
        const url = `${BASE_URL}${path}`;
        inventory['religious'].push({ url, priority: 0.8, changeFrequency: 'daily', lastModified: new Date() });
        registerUrlEntry({ url, entityType: 'RELIGIOUS', entityId: path, indexable: true, sitemapGroup: 'religious', priority: 0.8, changeFrequency: 'daily' });
    });
    markLegacyRedirect(`${BASE_URL}/religious`, `${BASE_URL}/religious-services`, 'RELIGIOUS_LEGACY');

    // 12. AMC Pages
    const amcPaths = ['/amc', '/amc/ac-maintenance-plan', '/amc/home-appliances-amc'];
    amcPaths.forEach(path => {
        const url = `${BASE_URL}${path}`;
        inventory['amc'].push({ url, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() });
        registerUrlEntry({ url, entityType: 'AMC', entityId: path, indexable: true, sitemapGroup: 'amc', priority: 0.8, changeFrequency: 'weekly' });
    });

    // 13. Images Sitemap Group
    services.forEach(s => {
        const slug = s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (slug) {
            const url = buildCanonicalUrl('MAIN_SERVICE', { slug });
            const imgs = [];
            if (s.image) imgs.push(s.image.startsWith('http') ? s.image : `https://api.doorstephub.com/${s.image.replace(/^\//, '')}`);
            if (s.bannerImage) imgs.push(s.bannerImage.startsWith('http') ? s.bannerImage : `https://api.doorstephub.com/${s.bannerImage.replace(/^\//, '')}`);
            imgs.push(`${BASE_URL}/d-hub-logo.png`);
            inventory['images'].push({ url, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date(), images: imgs });
        }
    });

    // Deduplicate entries globally across all urlset groups (excluding images group)
    const globalSeenUrls = new Set();
    Object.keys(inventory).forEach(group => {
        if (group === 'images') return; // Image sitemaps attach image metadata to page URLs
        inventory[group] = inventory[group].filter(entry => {
            if (!entry.url || globalSeenUrls.has(entry.url)) return false;
            globalSeenUrls.add(entry.url);
            return true;
        });
    });


    return inventory;
}

import { getImageSitemapChunks } from './imageInventory.js';

/**
 * Calculates the complete sitemap chunk manifest.
 * Maps groups into chunk handles (e.g. city-brands-1, city-brands-2, images-1, images-2).
 */
export async function getSitemapChunkManifest() {
    const inventory = await getFullSitemapInventory();
    const manifest = [];

    Object.keys(inventory).forEach(group => {
        if (group === 'images') return; // Handled dynamically by imageInventory
        const entries = inventory[group];
        const count = entries.length;
        const chunkCount = count === 0 ? 1 : Math.ceil(count / SITEMAP_CHUNK_SIZE);

        for (let page = 1; page <= chunkCount; page++) {
            const chunkHandle = chunkCount === 1 ? `${group}-1` : `${group}-${page}`;
            manifest.push({
                group,
                page,
                chunkHandle,
                count: Math.min(SITEMAP_CHUNK_SIZE, count - (page - 1) * SITEMAP_CHUNK_SIZE),
                totalGroupEntries: count
            });
        }
    });

    // Add Image Sitemap Chunks
    try {
        const { manifest: imageManifest } = await getImageSitemapChunks();
        manifest.push(...imageManifest);
    } catch (e) {
        console.error('Error attaching image sitemap chunks:', e);
    }

    return { manifest, inventory };
}

