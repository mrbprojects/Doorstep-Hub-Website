/**
 * Enterprise Sitemap Manager & Generator
 * Generates XML sitemap index and modular chunked XML sitemaps for Doorstep Hub.
 */

const BASE_URL = 'https://doorstephub.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

export const SITEMAP_CHUNK_SIZE = 1000;

// Static indexable routes
const STATIC_ROUTES = [
    { url: `${BASE_URL}/`, priority: 1.0, changeFrequency: 'daily' },
    { url: `${BASE_URL}/about-us`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/contact-us`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/careers`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/faqs`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/knowledge`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/blog`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/privacy-policy`, priority: 0.5, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/terms-conditions`, priority: 0.5, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/refund-policy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/deletion-requests`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/appliances`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${BASE_URL}/appliances/categories`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/appliances/centers`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/appliances/explore`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/appliances/featured`, priority: 0.7, changeFrequency: 'daily' },
    { url: `${BASE_URL}/appliances/recent`, priority: 0.7, changeFrequency: 'daily' },
    { url: `${BASE_URL}/appliances/repair-service`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/appliance-repairs/services-centers`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${BASE_URL}/services`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${BASE_URL}/pghostels`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${BASE_URL}/spa-salon`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${BASE_URL}/religious-services`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${BASE_URL}/amc`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/book-appointment`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/appliance-repairs/services-centers`, priority: 0.8, changeFrequency: 'daily' }
];

/**
 * Builds XML format for Sitemap Index file.
 * Handles both group strings and chunk object descriptors.
 */
export function buildSitemapIndexXML(chunks = []) {
    const now = new Date().toISOString();
    const sitemapEntries = chunks.map(chunk => {
        const handle = typeof chunk === 'string' ? chunk : (chunk.chunkHandle || `${chunk.group}-${chunk.page || 1}`);
        const lastmod = chunk.lastModified ? new Date(chunk.lastModified).toISOString() : now;
        return `    <sitemap>
        <loc>${BASE_URL}/sitemaps/${escapeXml(handle)}.xml</loc>
        <lastmod>${lastmod}</lastmod>
    </sitemap>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Paginates an array of entries into deterministic chunk pages (1-indexed).
 */
export function paginateEntries(entries = [], chunkPage = 1, chunkSize = SITEMAP_CHUNK_SIZE) {
    const total = entries.length;
    const totalChunks = Math.max(1, Math.ceil(total / chunkSize));
    const page = Math.max(1, Math.min(chunkPage, totalChunks));
    const start = (page - 1) * chunkSize;
    const end = start + chunkSize;

    return {
        entries: entries.slice(start, end),
        page,
        totalChunks,
        totalEntries: total
    };
}

/**
 * Builds XML format for a URL set sitemap.
 */
export function buildUrlSetXML(urlEntries = []) {
    const urls = urlEntries.map(entry => {
        const urlStr = typeof entry === 'string' ? entry : entry.url;
        const lastmod = (entry && entry.lastModified) ? new Date(entry.lastModified).toISOString() : new Date().toISOString();
        const changefreq = (entry && entry.changeFrequency) || 'weekly';
        const priority = (entry && entry.priority !== undefined) ? entry.priority : 0.7;

        const imagesList = Array.isArray(entry?.images) ? entry.images : (entry?.image ? [entry.image] : []);
        const imageXmlBlocks = imagesList.map(imgUrl => `
        <image:image>
            <image:loc>${escapeXml(imgUrl)}</image:loc>
        </image:image>`).join('');

        return `    <url>
        <loc>${escapeXml(urlStr)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>${imageXmlBlocks}
    </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

/**
 * Builds XML format specifically for Google Image Sitemaps.
 */
export function buildImageUrlSetXML(imageEntries = []) {
    const urlMap = {};
    imageEntries.forEach(item => {
        const pageUrl = item.loc || item.url;
        if (!pageUrl) return;
        if (!urlMap[pageUrl]) urlMap[pageUrl] = [];
        urlMap[pageUrl].push(item);
    });

    const urlBlocks = Object.keys(urlMap).map(pageUrl => {
        const images = urlMap[pageUrl];
        const imageXmlBlocks = images.map(img => {
            const titleBlock = img.title ? `
            <image:title>${escapeXml(img.title)}</image:title>` : '';
            const captionBlock = img.caption ? `
            <image:caption>${escapeXml(img.caption)}</image:caption>` : '';
            return `
        <image:image>
            <image:loc>${escapeXml(img.imageLoc || img.url)}</image:loc>${titleBlock}${captionBlock}
        </image:image>`;
        }).join('');

        return `    <url>
        <loc>${escapeXml(pageUrl)}</loc>${imageXmlBlocks}
    </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlBlocks}
</urlset>`;
}


export function escapeXml(unsafe = '') {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export function getStaticSitemapEntries() {
    return STATIC_ROUTES;
}
