/**
 * Initial Production Bulk URL Submission & Sitemap Reconciliation Script
 * Fetches all 2,000+ dynamic production URLs from Doorstep Hub APIs,
 * populates the central URL Registry, and submits valid URLs to IndexNow in safe batches.
 */

import { registerUrlEntry } from '../app/lib/seo/urlRegistry.js';
import { submitToIndexNow } from '../app/lib/seo/indexnow.js';

const BASE_URL = 'https://doorstephub.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

async function fetchAPI(endpoint, body = null, method = 'POST') {
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DoorstepHub-BulkSubmitter/1.0'
            },
        };
        if (body) config.body = JSON.stringify(body);
        const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
        return res.ok ? await res.json() : null;
    } catch (e) {
        return null;
    }
}

async function bulkProcessAllUrls() {
    console.log('===========================================================');
    console.log('   DOORSTEP HUB 2,000+ PRODUCTION URL RECONCILIATION');
    console.log('===========================================================\n');

    const allUrls = new Set();

    // 1. Static Pages
    const staticPaths = [
        '/', '/about-us', '/contact-us', '/privacy-policy', '/terms-conditions',
        '/careers', '/amc', '/appliances', '/spa-salon', '/pghostels', '/religious-services'
    ];
    staticPaths.forEach(path => {
        const url = `${BASE_URL}${path}`;
        allUrls.add(url);
        registerUrlEntry({ url, entityType: 'STATIC', entityId: path, indexable: true, sitemapGroup: 'static-pages' });
    });

    console.log(`[1] Static Pages Collected: ${staticPaths.length}`);

    // 2. Dynamic Main Services
    try {
        const serviceData = await fetchAPI('/app/applience-repairs-website/all-services', null, 'GET');
        const services = (serviceData?.success && Array.isArray(serviceData.data)) ? serviceData.data : [];
        services.forEach(s => {
            const slug = s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : '');
            if (slug) {
                const url = `${BASE_URL}/${slug}`;
                allUrls.add(url);
                registerUrlEntry({ url, entityType: 'SERVICE', entityId: s._id || slug, indexable: true, sitemapGroup: 'services' });
            }
        });
        console.log(`[2] Dynamic Services Collected: ${services.length}`);
    } catch (e) {
        console.error('Error fetching services:', e.message);
    }

    // 3. Cities & Appliance Repair City Pages
    try {
        const citiesData = await fetchAPI('/app/cities/cities_list', null, 'GET');
        const cities = (citiesData?.success && Array.isArray(citiesData.cities)) ? citiesData.cities : [];
        cities.forEach(c => {
            const citySlug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-');
            if (citySlug) {
                const url = `${BASE_URL}/appliances/repair-service/${citySlug}`;
                allUrls.add(url);
                registerUrlEntry({ url, entityType: 'CITY', entityId: c._id || citySlug, indexable: true, sitemapGroup: 'cities' });
            }
        });
        console.log(`[3] City Pages Collected: ${cities.length}`);
    } catch (e) {
        console.error('Error fetching cities:', e.message);
    }

    // 4. Categories
    try {
        const catData = await fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' });
        const categories = (catData?.success && Array.isArray(catData.data)) ? catData.data : [];
        categories.forEach(cat => {
            const catSlug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : '');
            if (catSlug) {
                const url = `${BASE_URL}/appliances/${catSlug}`;
                allUrls.add(url);
                registerUrlEntry({ url, entityType: 'CATEGORY', entityId: cat._id || catSlug, indexable: true, sitemapGroup: 'categories' });
            }
        });
        console.log(`[4] Category Pages Collected: ${categories.length}`);
    } catch (e) {
        console.error('Error fetching categories:', e.message);
    }

    // 5. Brands
    try {
        const brandData = await fetchAPI('/app/brands/all_brands', null, 'GET');
        const brands = (brandData?.success && Array.isArray(brandData.brands)) ? brandData.brands : [];
        brands.forEach(b => {
            const brandSlug = b.slug || (b.name ? b.name.toLowerCase().replace(/\s+/g, '-') : '');
            if (brandSlug) {
                const url = `${BASE_URL}/appliances/brand/${brandSlug}`;
                allUrls.add(url);
                registerUrlEntry({ url, entityType: 'BRAND', entityId: b._id || brandSlug, indexable: true, sitemapGroup: 'brands' });
            }
        });
        console.log(`[5] Brand Pages Collected: ${brands.length}`);
    } catch (e) {
        console.error('Error fetching brands:', e.message);
    }

    // 6. Dynamic City/Category/Brand Combinations
    try {
        const [citiesData, categoriesData, brandsData] = await Promise.all([
            fetchAPI('/app/cities/cities_list', null, 'GET'),
            fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' }),
            fetchAPI('/app/brands/all_brands', null, 'GET')
        ]);

        const cities = citiesData?.cities || [];
        const categories = categoriesData?.data || [];
        const brands = brandsData?.brands || [];

        let combosCount = 0;
        cities.forEach(c => {
            const citySlug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-');
            if (!citySlug) return;

            categories.forEach(cat => {
                const catSlug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : '');
                if (!catSlug) return;

                const catUrl = `${BASE_URL}/appliances/repair-service/${citySlug}/${catSlug}`;
                allUrls.add(catUrl);
                registerUrlEntry({ url: catUrl, entityType: 'CITY_CATEGORY', entityId: `${citySlug}_${catSlug}`, indexable: true, sitemapGroup: 'categories' });
                combosCount++;

                brands.forEach(b => {
                    const brandSlug = b.slug || (b.name ? b.name.toLowerCase().replace(/\s+/g, '-') : '');
                    if (!brandSlug) return;

                    const brandUrl = `${BASE_URL}/${citySlug}/${catSlug}/${brandSlug}`;
                    allUrls.add(brandUrl);
                    registerUrlEntry({ url: brandUrl, entityType: 'CITY_CATEGORY_BRAND', entityId: `${citySlug}_${catSlug}_${brandSlug}`, indexable: true, sitemapGroup: 'brands' });
                    combosCount++;
                });
            });
        });
        console.log(`[6] Dynamic City/Category/Brand Combinations Generated: ${combosCount}`);
    } catch (e) {
        console.error('Error generating combinations:', e.message);
    }

    // 7. PG Hostels, Spa/Salon, and Religious Verticals
    try {
        const pgPaths = [
            '/pghostels', '/pg-hostel', '/pghostels/listings/boys-pg', '/pghostels/listings/girls-pg', '/pghostels/listings/coliving'
        ];
        pgPaths.forEach(path => {
            const url = `${BASE_URL}${path}`;
            allUrls.add(url);
            registerUrlEntry({ url, entityType: 'PGHOSTEL', entityId: path, indexable: true, sitemapGroup: 'pghostels' });
        });

        const pgData = await fetchAPI('/app/products/featured_pg_hostels', null, 'GET');
        const hostels = (pgData?.success && Array.isArray(pgData.hostels)) ? pgData.hostels : [];
        hostels.forEach(h => {
            const slug = h.slug || h.hostelSlug || h._id;
            if (slug) {
                const url = `${BASE_URL}/pghostels/${slug}`;
                allUrls.add(url);
                registerUrlEntry({ url, entityType: 'PGHOSTEL_DETAIL', entityId: slug, indexable: true, sitemapGroup: 'pghostels' });
            }
        });

        const spaPaths = ['/spa-salon', '/spa-salon/packages'];
        spaPaths.forEach(path => {
            const url = `${BASE_URL}${path}`;
            allUrls.add(url);
            registerUrlEntry({ url, entityType: 'SPASALON', entityId: path, indexable: true, sitemapGroup: 'spa-salon' });
        });

        const religiousPaths = ['/religious-services', '/religious', '/religious-services/all-services', '/religious-services/category'];
        religiousPaths.forEach(path => {
            const url = `${BASE_URL}${path}`;
            allUrls.add(url);
            registerUrlEntry({ url, entityType: 'RELIGIOUS', entityId: path, indexable: true, sitemapGroup: 'religious' });
        });

        console.log(`[7] PG Hostels, Spa & Religious Pages Collected: ${pgPaths.length + hostels.length + spaPaths.length + religiousPaths.length}`);
    } catch (e) {
        console.error('Error fetching vertical pages:', e.message);
    }

    const totalCollected = Array.from(allUrls);
    console.log(`\n-----------------------------------------------------------`);
    console.log(` TOTAL INDEXABLE PRODUCTION URLS COLLECTED: ${totalCollected.length}`);
    console.log(`-----------------------------------------------------------\n`);

    // Submit to IndexNow in safe batches of 500
    const BATCH_SIZE = 500;
    let submittedCount = 0;

    for (let i = 0; i < totalCollected.length; i += BATCH_SIZE) {
        const batch = totalCollected.slice(i, i + BATCH_SIZE);
        console.log(`[IndexNow] Submitting Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);
        const res = await submitToIndexNow(batch, 'BULK_IMPORT_COMPLETED');
        if (res.success) {
            submittedCount += res.count;
            console.log(`   -> Batch ${Math.floor(i / BATCH_SIZE) + 1} Success! HTTP ${res.status || 200}`);
        } else {
            console.error(`   -> Batch ${Math.floor(i / BATCH_SIZE) + 1} Failed: ${res.error || res.reason}`);
        }
    }

    console.log('\n===========================================================');
    console.log(` SUMMARY: Registered ${totalCollected.length} URLs in Central Registry.`);
    console.log(` IndexNow Batch Submissions Completed: ${submittedCount} URLs`);
    console.log('===========================================================');
}

bulkProcessAllUrls();
