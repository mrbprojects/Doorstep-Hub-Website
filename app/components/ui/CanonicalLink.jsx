'use client';

import { usePathname } from 'next/navigation';

export function CanonicalLink() {
    const pathname = usePathname();
    const siteUrl = 'https://doorstephub.com';

    // Construct the full canonical URL
    const canonicalUrl = `${siteUrl}${pathname === '/' ? '' : pathname}`;

    return <link rel="canonical" href={canonicalUrl} />;
}
