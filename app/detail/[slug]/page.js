'use client';

// Proxy route to expose spa-salon detail at /detail/{slug}
import SpaSalonDetailSlugPage from '../../spa-salon/detail/[slug]/page';

export default function RootSpaDetailPage() {
    return <SpaSalonDetailSlugPage />;
}
