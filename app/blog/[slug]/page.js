import KnowledgeArticle, { generateMetadata } from '../../knowledge/[slug]/page';

export const revalidate = 3600;
export { generateMetadata };
export default KnowledgeArticle;
