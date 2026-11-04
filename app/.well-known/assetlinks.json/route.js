import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.doorstephub.customer',
      sha256_cert_fingerprints: [
        '78:64:0B:FC:FF:F7:6C:2B:A2:75:80:EC:39:4F:B5:07:E2:CA:6A:86:DD:42:77:2E:21:A9:5E:2C:58:9D:D1:E2',
        'C2:B3:12:C6:37:7F:AF:86:72:39:0C:E7:20:95:1C:FC:AF:22:42:09:82:AC:9D:2B:30:4A:E6:6C:EF:20:E7:74',
        '33:2E:C3:6F:F7:E7:83:E8:8F:C6:1C:CA:3B:3B:18:5A:EF:79:B4:C1:8D:D9:66:11:84:3F:45:4E:BF:5C:AF:28',
        '0A:D7:26:D1:7E:B1:F7:76:F6:B8:08:FD:A8:4A:3A:FA:FE:1F:FD:A0:38:AF:7C:44:69:4A:DD:71:D0:C6:0D:1D'
      ]
    }
  },
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.doorstephub.partner',
      sha256_cert_fingerprints: [
        '70:65:AD:1A:AB:05:BB:E3:E2:6F:8C:42:AB:F6:EF:C2:3C:03:0A:1B:53:91:88:D5:AD:6D:38:B6:5B:76:2C:84',
        'F7:CB:BA:5D:69:C3:1D:B7:74:B3:86:9B:A8:98:13:F9:23:8A:CB:E1:4A:13:8A:EC:AC:4F:24:5F:4A:54:2F:5A',
        '33:2E:C3:6F:F7:E7:83:E8:8F:C6:1C:CA:3B:3B:18:5A:EF:79:B4:C1:8D:D9:66:11:84:3F:45:4E:BF:5C:AF:28',
        '88:84:88:2C:FD:45:22:7B:DE:FE:03:87:EF:00:FE:5F:D2:8F:B1:12:F5:43:30:CB:BC:5A:57:8C:F3:33:D5:B9'
      ]
    }
  }
];

export async function GET() {
  return NextResponse.json(ASSET_LINKS, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
    }
  });
}

