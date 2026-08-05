import { NextResponse } from 'next/server';
import { buildSitemapIndexXML } from '@/lib/seo/sitemapManager';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
    const sitemapGroups = [
        'static-pages',
        'services',
        'cities',
        'categories',
        'brands',
        'pghostels',
        'spa-salon',
        'religious',
        'amc'
    ];

    const xml = buildSitemapIndexXML(sitemapGroups);

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
}
