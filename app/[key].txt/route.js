import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const keyParam = params?.key || '';
    const configuredKey = process.env.INDEXNOW_KEY;

    if (configuredKey && keyParam === configuredKey) {
        return new NextResponse(configuredKey, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400'
            }
        });
    }

    return new NextResponse('Not Found', { status: 404 });
}
