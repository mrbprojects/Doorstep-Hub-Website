
import { ArticleViewPage } from '@/components/knowledge/ArticleViewPage';

export default function KnowledgeArticle({ params }) {
    return <ArticleViewPage slug={params.slug} />;
}
