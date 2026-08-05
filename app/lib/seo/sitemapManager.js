/**
 * Enterprise Sitemap Manager & Generator
 * Generates XML sitemap index and modular chunked XML sitemaps for Doorstep Hub.
 */

const BASE_URL = 'https://doorstephub.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

// Static indexable routes
const STATIC_ROUTES = [
    { url: `${BASE_URL}/`, priority: 1.0, changefreq: 'daily' },
    { url: `${BASE_URL}/about-us`, priority: 0.5, changefreq: 'monthly' },
    { url: `${BASE_URL}/contact-us`, priority: 0.5, changefreq: 'monthly' },
    { url: `${BASE_URL}/privacy-policy`, priority: 0.3, changefreq: 'yearly' },
    { url: `${BASE_URL}/terms-conditions`, priority: 0.3, changefreq: 'yearly' },
    { url: `${BASE_URL}/careers`, priority: 0.4, changefreq: 'monthly' },
    { url: `${BASE_URL}/amc`, priority: 0.8, changefreq: 'weekly' },
    { url: `${BASE_URL}/appliances`, priority: 0.9, changefreq: 'daily' },
    { url: `${BASE_URL}/spa-salon`, priority: 0.9, changefreq: 'daily' },
    { url: `${BASE_URL}/pghostels`, priority: 0.9, changefreq: 'daily' },
    { url: `${BASE_URL}/religious-services`, priority: 0.9, changefreq: 'daily' },
];

/**
 * Builds XML format for Sitemap Index file.
 */
export function buildSitemapIndexXML(sitemapGroups) {
    const now = new Date().toISOString();
    const sitemapEntries = sitemapGroups.map(group => `
    <sitemap>
        <loc>${BASE_URL}/sitemaps/${group}.xml</loc>
        <lastmod>${now}</lastmod>
    </sitemap>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Builds XML format for a URL set sitemap.
 */
export function buildUrlSetXML(urlEntries) {
    const urls = urlEntries.map(entry => {
        const lastmod = entry.lastModified ? new Date(entry.lastModified).toISOString() : new Date().toISOString();
        const changefreq = entry.changeFrequency || 'weekly';
        const priority = entry.priority !== undefined ? entry.priority : 0.7;

        return `    <url>
        <loc>${escapeXml(entry.url)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>${entry.image ? `
        <image:image>
            <image:loc>${escapeXml(entry.image)}</image:loc>
        </image:image>` : ''}
    </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
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
