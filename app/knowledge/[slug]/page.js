import dynamic from 'next/dynamic';

const ArticleViewPage = dynamic(
    () => import('@/components/knowledge/ArticleViewPage').then(m => m.ArticleViewPage),
    { ssr: false }
);

export default function KnowledgeArticle({ params }) {
    return <ArticleViewPage slug={params.slug} />;
}
