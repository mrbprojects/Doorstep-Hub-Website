import { NextResponse } from 'next/server';
import { buildSitemapIndexXML } from '../lib/seo/sitemapManager.js';
import { getSitemapChunkManifest } from '../lib/seo/sitemapInventory.js';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
    try {
        const { manifest } = await getSitemapChunkManifest();
        const xml = buildSitemapIndexXML(manifest);

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                'X-Sitemap-Version': '2.0.0'
            }
        });
    } catch (e) {
        console.error('Error generating /sitemap.xml index:', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

