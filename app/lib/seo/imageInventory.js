/**
 * Doorstep Hub Enterprise Image Inventory & Extraction Engine
 * Traverses all 1,264 canonical pages, builds structured image metadata,
 * and generates chunked Google Image Sitemap entries.
 */

import { getFullSitemapInventory } from './sitemapInventory.js';

import { SITEMAP_CHUNK_SIZE } from './sitemapManager.js';

const BASE_URL = 'https://doorstephub.com';


function normalizeImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `https://api.doorstephub.com/uploads/${url}`;
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

    // Process each sitemap group to build associated image records
    for (const group of Object.keys(sitemapInventory)) {
        if (group === 'images') continue; // Skip raw images group
        const pages = sitemapInventory[group];

        for (const page of pages) {
            const pageUrl = page.url;
            
            const pageImages = [];

            // Preserve real uploaded media supplied by the page inventory. This is
            // used by Sell & Buy listings and avoids publishing made-up image URLs.
            if (Array.isArray(page.images) && page.images.length > 0) {
                page.images.forEach((imageUrl, index) => {
                    const normalizedUrl = normalizeImageUrl(imageUrl);
                    if (!normalizedUrl) return;
                    pageImages.push({
                        loc: pageUrl,
                        imageLoc: normalizedUrl,
                        title: group === 'sell-buy' ? 'Doorstep Hub Sell & Buy Listing Image' : 'Doorstep Hub Page Image',
                        caption: group === 'sell-buy' ? 'Verified marketplace listing on Doorstep Hub' : 'Doorstep Hub page image',
                        alt: group === 'sell-buy' ? 'Doorstep Hub Sell & Buy listing image' : 'Doorstep Hub image',
                        width: page.imageWidth || 800,
                        height: page.imageHeight || 600,
                        format: detectImageFormat(normalizedUrl),
                        isModernFormat: isModernFormat(detectImageFormat(normalizedUrl)),
                        position: index + 1
                    });
                });
            }

            // Never use a shared logo, a generic placeholder, or a guessed
            // file path as a page image. A URL belongs in an image sitemap
            // only when its actual page media was supplied by the inventory.
            if (pageImages.length > 0) {
                imageRecords.push(...pageImages);
            }
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
