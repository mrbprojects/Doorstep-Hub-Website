/**
 * Doorstep Hub Enterprise Image Inventory & Extraction Engine
 * Traverses all 1,264 canonical pages, builds structured image metadata,
 * and generates chunked Google Image Sitemap entries.
 */

import { getFullSitemapInventory } from './sitemapInventory.js';
import { buildCanonicalUrl } from './canonicalManager.js';
import { SITEMAP_CHUNK_SIZE } from './sitemapManager.js';

const BASE_URL = 'https://doorstephub.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

function normalizeImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `https://devapis.doorstephub.com/uploads/${url}`;
}

function detectImageFormat(url) {
    if (!url) return 'UNKNOWN';
    const cleanUrl = url.toLowerCase().split('?')[0];
    if (cleanUrl.endsWith('.webp')) return 'WEBP';
    if (cleanUrl.endsWith('.avif')) return 'AVIF';
    if (cleanUrl.endsWith('.svg')) return 'SVG';
    if (cleanUrl.endsWith('.png')) return 'PNG';
    if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'JPEG';
    return 'WEBP';
}

function isModernFormat(format) {
    return ['WEBP', 'AVIF', 'SVG'].includes(format);
}

/**
 * Builds the complete image inventory across all 1,264 canonical pages.
 */
export async function getCompleteImageInventory(providedInventory = null) {
    const sitemapInventory = providedInventory || await getFullSitemapInventory();
    const imageRecords = [];

    // Common brand logos & fallback assets
    const defaultLogo = `${BASE_URL}/d-hub-logo.png`;
    const defaultHero = `${BASE_URL}/dhub-hero-banner.webp`;
    const defaultTrustBadge = `${BASE_URL}/dhub-verified-badge.webp`;

    // Process each sitemap group to build associated image records
    for (const group of Object.keys(sitemapInventory)) {
        if (group === 'images') continue; // Skip raw images group
        const pages = sitemapInventory[group];

        for (const page of pages) {
            const pageUrl = page.url;
            const path = pageUrl.replace(BASE_URL, '') || '/';
            const pageImages = [];

            // 1. Static Pages
            if (group === 'static-pages') {
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultLogo,
                    title: 'Doorstep Hub Official Logo',
                    caption: 'Doorstep Hub Trusted Home Services Logo',
                    alt: 'Doorstep Hub Logo',
                    width: 512,
                    height: 512,
                    format: 'PNG',
                    isModernFormat: false
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultHero,
                    title: 'Doorstep Hub Home & Appliance Services Banner',
                    caption: 'Book Professional Appliance Repair & Lifestyle Services Across India',
                    alt: 'Doorstep Hub Service Banner',
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultTrustBadge,
                    title: 'Verified Technician Trust Seal',
                    caption: 'Doorstep Hub Verified & Background-Checked Technicians',
                    alt: 'Doorstep Hub Verified Badge',
                    width: 400,
                    height: 400,
                    format: 'WEBP',
                    isModernFormat: true
                });
            }

            // 2. City Pages (23 pages)
            else if (group === 'cities') {
                const citySlug = path.replace('/appliances-repair-service-center-', '');
                const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/cities/${citySlug}-appliance-repair.webp`,
                    title: `Appliance Repair & Service Center in ${cityName}`,
                    caption: `Trusted Home Appliance Repair Services in ${cityName}`,
                    alt: `Appliance Repair Center ${cityName}`,
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultTrustBadge,
                    title: `Verified ${cityName} Service Technicians`,
                    caption: `Doorstep Hub 90-Day Guarantee in ${cityName}`,
                    alt: `${cityName} Doorstep Hub Verified Badge`,
                    width: 400,
                    height: 400,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultLogo,
                    title: `Doorstep Hub ${cityName}`,
                    caption: `Doorstep Hub ${cityName} Official Service Seal`,
                    alt: `Doorstep Hub ${cityName} Logo`,
                    width: 512,
                    height: 512,
                    format: 'PNG',
                    isModernFormat: false
                });
            }

            // 3. Category Pages (8 pages)
            else if (group === 'categories') {
                const catSlug = path.replace('/appliances/', '');
                const catName = catSlug.replace('-', ' ').toUpperCase();

                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/categories/${catSlug}-banner.webp`,
                    title: `${catName} Repair & Service Doorstep Hub`,
                    caption: `Professional ${catName} Repair & Maintenance Services`,
                    alt: `${catName} Banner`,
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/categories/${catSlug}-icon.webp`,
                    title: `${catName} Category Icon`,
                    caption: `Doorstep Hub ${catName} Category`,
                    alt: `${catName} Icon`,
                    width: 512,
                    height: 512,
                    format: 'WEBP',
                    isModernFormat: true
                });
            }

            // 4. Brand Pages (38 pages)
            else if (group === 'brands') {
                const brandSlug = path.replace(/^\//, '');
                const brandName = brandSlug.replace('-appliance-repair-service-center', '').replace('-', ' ').toUpperCase();

                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/brands/${brandSlug}-logo.webp`,
                    title: `${brandName} Authorized Appliance Service Logo`,
                    caption: `Authorized ${brandName} Repair Service Center`,
                    alt: `${brandName} Logo`,
                    width: 512,
                    height: 512,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/brands/${brandSlug}-banner.webp`,
                    title: `${brandName} Appliance Repair Banner`,
                    caption: `Genuine Spare Parts & Certified ${brandName} Technicians`,
                    alt: `${brandName} Repair Banner`,
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultTrustBadge,
                    title: `${brandName} Genuine Warranty Seal`,
                    caption: `Doorstep Hub 90-Day Warranty for ${brandName} Repairs`,
                    alt: `${brandName} Warranty Seal`,
                    width: 400,
                    height: 400,
                    format: 'WEBP',
                    isModernFormat: true
                });
            }

            // 5. Brand-City Pages (874 pages)
            else if (group === 'city-brands') {
                const parts = path.replace(/^\//, '').split('/');
                const brandSlug = parts[0] || '';
                const citySlug = parts[1] || '';
                const brandName = brandSlug.replace('-appliance-repair-service-center', '').replace('-', ' ').toUpperCase();
                const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/brands/${brandSlug}-${citySlug}.webp`,
                    title: `${brandName} Service Center ${cityName}`,
                    caption: `Doorstep ${brandName} Appliance Repair Service Center in ${cityName}`,
                    alt: `${brandName} Service Center ${cityName}`,
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/brands/${brandSlug}-logo.webp`,
                    title: `${brandName} Official Brand Logo ${cityName}`,
                    caption: `Certified ${brandName} Technicians in ${cityName}`,
                    alt: `${brandName} Logo ${cityName}`,
                    width: 512,
                    height: 512,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultTrustBadge,
                    title: `${cityName} Doorstep Hub Service Guarantee`,
                    caption: `Doorstep Hub Verified Badge ${cityName}`,
                    alt: `Doorstep Hub Service Guarantee ${cityName}`,
                    width: 400,
                    height: 400,
                    format: 'WEBP',
                    isModernFormat: true
                });
            }

            // 6. Category-City Pages (184 pages)
            else if (group === 'city-categories') {
                const cleanPath = path.replace(/^\//, '').replace('-service-center-', '/');
                const parts = cleanPath.split('/');
                const catSlug = parts[0] || 'appliance';
                const citySlug = parts[1] || 'city';
                const catName = catSlug.replace('-', ' ').toUpperCase();
                const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/services/${catSlug}-${citySlug}.webp`,
                    title: `${catName} Repair Service in ${cityName}`,
                    caption: `Professional ${catName} Repair Technicians in ${cityName}`,
                    alt: `${catName} Repair ${cityName}`,
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultTrustBadge,
                    title: `Doorstep Hub 90-Day ${cityName} Guarantee`,
                    caption: `Certified Technicians for ${catName} in ${cityName}`,
                    alt: `${catName} Verified Badge ${cityName}`,
                    width: 400,
                    height: 400,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultLogo,
                    title: `Doorstep Hub ${catName} ${cityName}`,
                    caption: `Doorstep Hub Official Service Partner ${cityName}`,
                    alt: `Doorstep Hub Logo ${cityName}`,
                    width: 512,
                    height: 512,
                    format: 'PNG',
                    isModernFormat: false
                });
            }

            // 7. City-Service Pages (92 pages)
            else if (group === 'city-services') {
                const parts = path.replace('/nearby/', '').split('/');
                const svcSlug = parts[0] || 'service';
                const citySlug = parts[1] || 'city';
                const svcName = svcSlug.replace('-', ' ').toUpperCase();
                const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/nearby/${svcSlug}-${citySlug}.webp`,
                    title: `Nearby ${svcName} in ${cityName}`,
                    caption: `Book Nearby ${svcName} Technicians in ${cityName}`,
                    alt: `Nearby ${svcName} ${cityName}`,
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultTrustBadge,
                    title: `Same Day ${svcName} Service ${cityName}`,
                    caption: `Verified Technicians in ${cityName}`,
                    alt: `Verified Badge ${cityName}`,
                    width: 400,
                    height: 400,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultLogo,
                    title: `Doorstep Hub ${cityName}`,
                    caption: `Doorstep Hub Booking Seal`,
                    alt: `Doorstep Hub Logo`,
                    width: 512,
                    height: 512,
                    format: 'PNG',
                    isModernFormat: false
                });
            }

            // 8. Main Services, PG, Spa, Religious, AMC
            else {
                const name = path.replace(/^\//, '').replace(/-/g, ' ').toUpperCase() || 'SERVICE';
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: `${BASE_URL}/gallery${path}.webp`,
                    title: `${name} Doorstep Hub Service Image`,
                    caption: `Book Professional ${name} at Doorstep Hub`,
                    alt: `${name} Image`,
                    width: 1200,
                    height: 630,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultTrustBadge,
                    title: `${name} Verification Badge`,
                    caption: `Doorstep Hub Certified ${name}`,
                    alt: `${name} Verified Badge`,
                    width: 400,
                    height: 400,
                    format: 'WEBP',
                    isModernFormat: true
                });
                pageImages.push({
                    loc: pageUrl,
                    imageLoc: defaultLogo,
                    title: 'Doorstep Hub Official Logo',
                    caption: 'Doorstep Hub Trusted Logo',
                    alt: 'Doorstep Hub Logo',
                    width: 512,
                    height: 512,
                    format: 'PNG',
                    isModernFormat: false
                });
            }

            imageRecords.push(...pageImages);
        }
    }

    return imageRecords;
}

/**
 * Calculates image sitemap chunks (1,000 images per XML file).
 */
export async function getImageSitemapChunks(providedInventory = null) {
    const images = await getCompleteImageInventory(providedInventory);
    const totalCount = images.length;
    const chunkCount = Math.ceil(totalCount / SITEMAP_CHUNK_SIZE) || 1;

    const manifest = [];
    for (let page = 1; page <= chunkCount; page++) {
        const chunkHandle = `images-${page}`;
        const startIndex = (page - 1) * SITEMAP_CHUNK_SIZE;
        const chunkEntries = images.slice(startIndex, startIndex + SITEMAP_CHUNK_SIZE);

        manifest.push({
            group: 'images',
            page,
            chunkHandle,
            count: chunkEntries.length,
            entries: chunkEntries
        });
    }

    return { totalCount, chunkCount, manifest, images };
}
