import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const APPLE_APP_SITE_ASSOCIATION = {
  applinks: {
    apps: [],
    details: [
      {
        appID: 'Z8UNCTCRRH.com.doorstephub.partner',
        paths: [
          '/service-partner',
          '/service-partner/*',
          '/partner',
          '/partner/*'
        ]
      },
      {
        appID: 'Z8UNCTCRRH.com.doorstephub.customers',
        paths: [
          'NOT /service-partner',
          'NOT /service-partner/*',
          'NOT /partner',
          'NOT /partner/*',
          'NOT /api/*',
          'NOT /admin/*',
          '/',
          '/appliances/*',
          '/appliance-repair-services/*',
          '/services/*',
          '/spa-salon/*',
          '/religious-services/*',
          '/pghostels/*',
          '/offers/*',
          '/sell-buy/*',
          '/book-now/*',
          '/account/*',
          '/*'
        ]
      }
    ]
  },
  webcredentials: {
    apps: [
      'Z8UNCTCRRH.com.doorstephub.customers',
      'Z8UNCTCRRH.com.doorstephub.partner'
    ]
  }
};

export async function GET() {
  return NextResponse.json(APPLE_APP_SITE_ASSOCIATION, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
    }
  });
}
