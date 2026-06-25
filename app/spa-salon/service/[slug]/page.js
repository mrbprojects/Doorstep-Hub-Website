import dynamic from 'next/dynamic';

const SpaServiceDetailPage = dynamic(
    () => import('@/components/spasalon/SpaServiceDetailPage'),
    { ssr: false }
);

export default function Page({ slugOverride = null }) {
    return <SpaServiceDetailPage slugOverride={slugOverride} />;
}
