import { NextResponse } from 'next/server';
import { getSitemapChunkManifest } from '../../../../lib/seo/sitemapInventory.js';
import { getRegistryStats } from '../../../../lib/seo/urlRegistry.js';

export const dynamic = 'force-dynamic';

const allowedAdminOrigins = [
    process.env.ADMIN_APP_ORIGIN,
    'https://admin.doorstephub.com',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

function getCorsHeaders(request) {
    const origin = request.headers.get('origin');
    return {
    'Access-Control-Allow-Origin': allowedAdminOrigins.includes(origin) ? origin : allowedAdminOrigins[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
}

export function OPTIONS(request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request) {
    try {
        const { manifest, inventory } = await getSitemapChunkManifest();
        const registryStats = getRegistryStats();

        let totalSitemapUrls = 0;
        const groupMetrics = {};

        Object.keys(inventory).forEach(group => {
            const count = inventory[group].length;
            totalSitemapUrls += count;
            const chunks = manifest.filter(m => m.group === group).length;
            groupMetrics[group] = {
                urlsCount: count,
                chunksCount: chunks
            };
        });

        return NextResponse.json({
            success: true,
            version: '2.0.0',
            reconciliation: {
                totalRegistryEntries: registryStats.total,
                totalCanonicalIndexableUrls: registryStats.indexable,
                totalLegacyRedirectsRetained: registryStats.redirects,
                totalSitemapUrlsEmitted: totalSitemapUrls,
                differenceCanonicalVsSitemap: registryStats.indexable - totalSitemapUrls,
                totalChunksManifested: manifest.length
            },
            sitemapHealth: {
                status: 'INVENTORY_ONLY',
                redirectsInSitemap: null,
                non200InSitemap: null,
                canonicalMismatches: null,
                noindexInSitemap: null,
                groups: groupMetrics
            },
            lastUpdated: new Date().toISOString()
        }, { headers: getCorsHeaders(request) });
    } catch (e) {
        console.error('Error in SEO Reconciliation API:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: getCorsHeaders(request) });
    }
}
