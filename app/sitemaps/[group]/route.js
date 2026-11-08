import { NextResponse } from 'next/server';
import { buildUrlSetXML, buildImageUrlSetXML, paginateEntries } from '../../lib/seo/sitemapManager.js';
import { getFullSitemapInventory } from '../../lib/seo/sitemapInventory.js';
import { getImageSitemapChunks } from '../../lib/seo/imageInventory.js';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request, { params }) {
    let rawGroup = params.group || '';
    if (rawGroup.endsWith('.xml')) {
        rawGroup = rawGroup.replace(/\.xml$/, '');
    }

    // Parse group name and page chunk index (e.g. city-brands-2 -> group: city-brands, page: 2)
    const match = rawGroup.match(/^(.+)-(\d+)$/);
    let groupName = rawGroup;
    let requestedPage = 1;

    if (match) {
        groupName = match[1];
        requestedPage = parseInt(match[2], 10);
    }

    try {
        if (groupName === 'images') {
            const {  images } = await getImageSitemapChunks();
            const paginated = paginateEntries(images, requestedPage);

            if (requestedPage > paginated.totalChunks || requestedPage < 1) {
                return new NextResponse('Image Sitemap Chunk Out of Bounds', { status: 404 });
            }

            const xml = buildImageUrlSetXML(paginated.entries);
            return new NextResponse(xml, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                    'X-Sitemap-Group': 'images',
                    'X-Sitemap-Page': String(paginated.page),
                    'X-Sitemap-Total-Chunks': String(paginated.totalChunks)
                }
            });
        }

        const inventory = await getFullSitemapInventory();

        if (!inventory[groupName]) {
            return new NextResponse('Sitemap Group Not Found', { status: 404 });
        }

        const allGroupEntries = inventory[groupName];
        if (allGroupEntries.length === 0) {
            return new NextResponse('Sitemap Group Empty', { status: 404 });
        }

        const paginated = paginateEntries(allGroupEntries, requestedPage);

        // Check if page chunk requested is beyond maximum available chunks
        if (requestedPage > paginated.totalChunks || requestedPage < 1) {
            return new NextResponse('Sitemap Chunk Out of Bounds', { status: 404 });
        }

        const xml = buildUrlSetXML(paginated.entries);


        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                'X-Sitemap-Group': groupName,
                'X-Sitemap-Page': String(paginated.page),
                'X-Sitemap-Total-Chunks': String(paginated.totalChunks),
                'X-Sitemap-Chunk-Size': String(paginated.entries.length)
            }
        });
    } catch (e) {
        console.error(`Error serving child sitemap chunk ${rawGroup}:`, e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

