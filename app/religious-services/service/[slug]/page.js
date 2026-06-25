import dynamic from 'next/dynamic';

const ReligiousServiceDetailPage = dynamic(
    () => import('@/components/religious/ReligiousServiceDetailPage'),
    { ssr: false }
);

export default function Page({ slugOverride = null }) {
    return <ReligiousServiceDetailPage slugOverride={slugOverride} />;
}
