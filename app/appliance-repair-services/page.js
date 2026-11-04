'use client';

import dynamic from 'next/dynamic';

const ApplianceHomePage = dynamic(
    () => import('@/components/appliances/ApplianceHomePage').then(m => m.ApplianceHomePage),
    { ssr: false }
);

export default function ApplianceRepairServicesPage() {
    return <ApplianceHomePage />;
}
