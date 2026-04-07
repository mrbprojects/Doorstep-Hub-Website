'use client';

// Proxy to expose spa-salon service details at root-level: /service/{slug}
import SpaServiceDetailPage from '../../spa-salon/service/[slug]/page';

export default function RootSpaServicePage() {
    return <SpaServiceDetailPage />;
}
