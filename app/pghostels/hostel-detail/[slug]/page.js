import dynamic from 'next/dynamic';

const NewHostelDetailPage = dynamic(
    () => import('@/components/pghostels/NewHostelDetailPage'),
    { ssr: false }
);

export default function Page({ slugOverride = null }) {
    return <NewHostelDetailPage slugOverride={slugOverride} />;
}
