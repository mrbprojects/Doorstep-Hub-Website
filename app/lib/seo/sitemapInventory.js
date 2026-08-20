import { buildCanonicalUrl } from './canonicalManager.js';
import { registerUrlEntry, markLegacyRedirect, rebuildRegistryFromInventory } from './urlRegistry.js';
import { getStaticSitemapEntries, SITEMAP_CHUNK_SIZE } from './sitemapManager.js';

const BASE_URL = 'https://doorstephub.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || API_BASE_URL.replace(/\/v1\/dhubApi$/, '')).replace(/\/$/, '');

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

function getAbsoluteImageUrl(image) {
    if (!image || typeof image !== 'string') return null;
    if (/^https?:\/\//i.test(image)) return image;
    return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, '')}`;
}

function getEntityImages(entity = {}) {
    const candidates = [
        entity.image,
        entity.bannerImage,
        entity.banner_image,
        entity.thumbnail,
        entity.thumbnailImage,
        entity.categoryImage,
        entity.subcategoryImage,
        entity.brandImage,
        entity.logo,
        entity.icon,
        entity.cityImage
    ];
    return [...new Set(candidates.map(getAbsoluteImageUrl).filter(Boolean))];
}

async function fetchAllActiveSellBuyListings() {
    const limit = 100;
    const firstPage = await fetchAPI(`/sell-buy/listings?limit=${limit}&page=1`, null, 'GET');
    const firstPayload = firstPage?.error === false ? firstPage.data : firstPage;
    const listings = Array.isArray(firstPayload?.data) ? firstPayload.data : [];
    const totalPages = Math.min(Number(firstPayload?.meta?.totalPages || firstPayload?.last_page || 1), 100);

    if (totalPages <= 1) return listings;

    const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
            fetchAPI(`/sell-buy/listings?limit=${limit}&page=${index + 2}`, null, 'GET')
        )
    );

    return remainingPages.reduce((all, response) => {
        const payload = response?.error === false ? response.data : response;
        if (Array.isArray(payload?.data)) all.push(...payload.data);
        return all;
    }, listings);
}

async function fetchApplianceSubcategories(categories = []) {
    const responses = await Promise.all(categories.map(category => {
        const slug = category?.slug || (category?.name ? category.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (!slug) return Promise.resolve(null);
        return fetchAPI('/app/applience-repairs-website/getsubcategorysbycategoryid', { slug });
    }));

    return responses.flatMap((response, index) => {
        const subcategories = Array.isArray(response?.data) ? response.data : [];
        return subcategories.map(subcategory => ({ subcategory, category: categories[index] }));
    });
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
        'subcategories': [],
        'brands': [],
        'city-categories': [],
        'city-brands': [],
        'city-services': [],
        'pghostels': [],
        'spa-salon': [],
        'religious': [],
        'amc': [],
        'professional-categories': [],
        'professional-subcategories': [],
        'sell-buy': [],
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
        spaRes,
        professionalCatalogRes
    ] = await Promise.all([
        fetchAPI('/app/applience-repairs-website/all-services', null, 'GET'),
        fetchAPI('/app/cities/cities_list', null, 'GET'),
        fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' }),
        fetchAPI('/app/brands/all_brands', null, 'GET'),
        fetchAPI('/app/products/featured_pg_hostels', null, 'GET'),
        fetchAPI('/app/products/all_spa_stores', null, 'GET'),
        fetchAPI('/app/products/professional-services-catalog', null, 'GET')
    ]);

    const DEFAULT_SERVICES = [
        { slug: 'ac-repair-service' },
        { slug: 'refrigerator-repair-service' },
        { slug: 'washing-machine-repair-service' },
        { slug: 'microwave-repair-service' }
    ];

    const services = (servicesRes?.success && Array.isArray(servicesRes.data) && servicesRes.data.length > 0) ? servicesRes.data : DEFAULT_SERVICES;
    const cities = (citiesRes?.success && Array.isArray(citiesRes.cities) && citiesRes.cities.length > 0) ? citiesRes.cities : [];
    const categories = (categoriesRes?.success && Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) ? categoriesRes.data : [];
    const brands = (brandsRes?.success && Array.isArray(brandsRes.brands) && brandsRes.brands.length > 0) ? brandsRes.brands : [];

    // 2. Main Services
    services.forEach(s => {
        const slug = s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (slug) {
            const canonicalUrl = buildCanonicalUrl('MAIN_SERVICE', { slug });
            const images = getEntityImages(s);
            const entry = { url: canonicalUrl, priority: 0.9, changeFrequency: 'weekly', lastModified: s.updatedAt || new Date(), images };
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

            inventory['cities'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: c.updatedAt || new Date(), images: getEntityImages(c) });
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
            inventory['categories'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: cat.updatedAt || new Date(), images: getEntityImages(cat) });
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

    // 5. Appliance subcategory listing pages. These are sourced per published
    // category, so newly added subcategories are automatically added.
    const applianceSubcategories = await fetchApplianceSubcategories(categories);
    applianceSubcategories.forEach(({ subcategory, category }) => {
        const slug = subcategory?.slug || (subcategory?.name ? subcategory.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (!slug) return;
        const url = `${BASE_URL}/appliances/listing/${encodeURIComponent(slug)}`;
        const image = getAbsoluteImageUrl(subcategory.image || subcategory.subcategoryIcon || subcategory.icon);
        inventory.subcategories.push({
            url,
            priority: 0.7,
            changeFrequency: 'weekly',
            lastModified: subcategory.updatedAt || new Date(),
            images: image ? [image] : []
        });
        registerUrlEntry({
            url,
            entityType: 'APPLIANCE_SUBCATEGORY',
            entityId: subcategory._id || slug,
            indexable: true,
            sitemapGroup: 'subcategories',
            priority: 0.7,
            changeFrequency: 'weekly'
        });
    });

    // 5. Brands
    brands.forEach(b => {
        const brandSlug = b.slug || (b.name ? b.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (brandSlug) {
            const canonicalUrl = buildCanonicalUrl('BRAND', { brandSlug });
            const legacyUrl = `${BASE_URL}/appliances/brand/${brandSlug}`;

            inventory['brands'].push({ url: canonicalUrl, priority: 0.7, changeFrequency: 'monthly', lastModified: b.updatedAt || new Date(), images: getEntityImages(b) });
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

            inventory['city-categories'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: cat.updatedAt || new Date(), images: getEntityImages(cat) });
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

            inventory['city-brands'].push({ url: canonicalUrl, priority: 0.7, changeFrequency: 'monthly', lastModified: b.updatedAt || new Date(), images: getEntityImages(b) });
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

            inventory['city-services'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: s.updatedAt || new Date(), images: getEntityImages(s) });
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
            inventory['pghostels'].push({ url: canonicalUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: h.updatedAt || new Date(), images: getEntityImages(h) });
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
            inventory['spa-salon'].push({ url: canonicalUrl, priority: 0.7, changeFrequency: 'weekly', lastModified: s.updatedAt || new Date(), images: getEntityImages(s) });
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

    // 13. Spa, PG & Hostel and Religious categories/subcategories from the public catalog.
    // Each URL maps to an existing route; transaction and search routes remain excluded.
    const professionalCatalog = (professionalCatalogRes?.success && Array.isArray(professionalCatalogRes.data))
        ? professionalCatalogRes.data
        : [];
    const professionalRouteConfig = {
        'spa-saloons': { root: '/spa-salon', category: '/spa-salon/category', subcategory: '/spa-salon/subcategory' },
        'spa-salon': { root: '/spa-salon', category: '/spa-salon/category', subcategory: '/spa-salon/subcategory' },
        'pg-hostels': { root: '/pghostels', category: '/pghostels/listings', subcategory: '/pghostels/subcategory' },
        'pg-hostel': { root: '/pghostels', category: '/pghostels/listings', subcategory: '/pghostels/subcategory' },
        'religious-services': { root: '/religious-services', category: '/religious-services/category', subcategory: '/religious-services/subcategory' },
        'rituals-and-religious-services': { root: '/religious-services', category: '/religious-services/category', subcategory: '/religious-services/subcategory' }
    };
    professionalCatalog.forEach(node => {
        const service = node?.service || {};
        const serviceSlug = String(service.slug || service.name || '').toLowerCase().replace(/\s+/g, '-');
        const route = professionalRouteConfig[serviceSlug];
        if (!route) return;

        const rootUrl = `${BASE_URL}${route.root}`;
        inventory['professional-categories'].push({ url: rootUrl, priority: 0.9, changeFrequency: 'weekly', lastModified: service.updatedAt || new Date(), images: getEntityImages(service) });

        (node.categories || []).forEach(categoryNode => {
            const category = categoryNode?.category || {};
            const categorySlug = category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : '');
            if (!categorySlug) return;
            const categoryUrl = `${BASE_URL}${route.category}/${encodeURIComponent(categorySlug)}`;
            inventory['professional-categories'].push({ url: categoryUrl, priority: 0.8, changeFrequency: 'weekly', lastModified: category.updatedAt || new Date(), images: getEntityImages(category) });

            (categoryNode.subcategories || []).forEach(subcategory => {
                const subcategorySlug = subcategory?.slug || (subcategory?.name ? subcategory.name.toLowerCase().replace(/\s+/g, '-') : '');
                if (!subcategorySlug) return;
                const subcategoryUrl = `${BASE_URL}${route.subcategory}/${encodeURIComponent(subcategorySlug)}`;
                inventory['professional-subcategories'].push({ url: subcategoryUrl, priority: 0.7, changeFrequency: 'weekly', lastModified: subcategory.updatedAt || new Date(), images: getEntityImages(subcategory) });
            });
        });
    });

    // 14. Sell & Buy marketplace. Only public, indexable pages and ACTIVE listings are included.
    const sellBuyStaticPaths = [
        '/sell-buy',
        '/sell-buy/about',
        '/sell-buy/categories',
        '/sell-buy/contact-us',
        '/sell-buy/help',
        '/sell-buy/privacy-policy',
        '/sell-buy/safety',
        '/sell-buy/terms'
    ];
    sellBuyStaticPaths.forEach(path => {
        const url = `${BASE_URL}${path}`;
        inventory['sell-buy'].push({ url, priority: path === '/sell-buy' ? 0.9 : 0.5, changeFrequency: 'weekly', lastModified: new Date() });
        registerUrlEntry({ url, entityType: 'SELL_BUY_PAGE', entityId: path, indexable: true, sitemapGroup: 'sell-buy', priority: path === '/sell-buy' ? 0.9 : 0.5, changeFrequency: 'weekly' });
    });

    categories.forEach(category => {
        const slug = category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : '');
        if (!slug) return;
        const url = `${BASE_URL}/sell-buy/${slug}`;
        const categoryImages = getEntityImages(category);
        inventory['sell-buy'].push({
            url,
            priority: 0.7,
            changeFrequency: 'weekly',
            lastModified: category.updatedAt || new Date(),
            images: categoryImages
        });
        registerUrlEntry({ url, entityType: 'SELL_BUY_CATEGORY', entityId: category._id || slug, indexable: true, sitemapGroup: 'sell-buy', priority: 0.7, changeFrequency: 'weekly' });
    });

    const sellBuyListings = await fetchAllActiveSellBuyListings();
    sellBuyListings.forEach(listing => {
        if (!listing?.slug) return;
        const url = `${BASE_URL}/sell-buy/ad/${encodeURIComponent(listing.slug)}`;
        const images = [...new Set([
            listing.coverImage,
            listing.image,
            ...(Array.isArray(listing.images) ? listing.images : []),
            ...(Array.isArray(listing.gallery_images) ? listing.gallery_images.map(item => item?.image) : [])
        ]
            .map(getAbsoluteImageUrl)
            .filter(Boolean))];
        inventory['sell-buy'].push({
            url,
            priority: 0.7,
            changeFrequency: 'daily',
            lastModified: listing.updatedAt || listing.createdAt || new Date(),
            images
        });
        registerUrlEntry({ url, entityType: 'SELL_BUY_LISTING', entityId: listing._id || listing.slug, indexable: true, sitemapGroup: 'sell-buy', priority: 0.7, changeFrequency: 'daily' });
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

    // Rebuild after de-duplication so registered indexable URLs exactly match
    // the URLs emitted in the sitemap chunks.
    rebuildRegistryFromInventory(inventory);

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
        // Reuse the already-built inventory. Rebuilding it here doubles all
        // upstream API calls and makes /sitemap.xml unnecessarily slow.
        const { manifest: imageManifest } = await getImageSitemapChunks(inventory);
        manifest.push(...imageManifest);
    } catch (e) {
        console.error('Error attaching image sitemap chunks:', e);
    }

    return { manifest, inventory };
}
