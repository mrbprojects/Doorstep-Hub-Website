import { ArticleViewPage } from '@/components/knowledge/ArticleViewPage';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

async function getArticleData(slug) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base`, {
            next: { revalidate: 3600 }
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            const foundArticle = data.data.find(item => item.slug === slug);
            if (!foundArticle) return null;

            const rawDate = foundArticle.createdAt || foundArticle.created_at || foundArticle.date || foundArticle.updatedAt;
            let formattedDate = 'Recently Updated';
            if (rawDate) {
                const parsedDate = new Date(rawDate);
                if (!isNaN(parsedDate.getTime())) {
                    formattedDate = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
            }

            const fullContent = foundArticle.content || foundArticle.description || foundArticle.summary || 'No content available.';

            const article = {
                id: foundArticle._id,
                title: foundArticle.title,
                category: foundArticle.subcategoryId?.name || foundArticle.categoryId?.name || 'General',
                readTime: foundArticle.readTime ? `${foundArticle.readTime} min read` : '3 min read',
                image: foundArticle.coverImage?.url ? encodeURI(`https://api.doorstephub.com${foundArticle.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
                content: fullContent,
                summary: foundArticle.summary ? foundArticle.summary.replace(/<[^>]*>?/gm, '').substring(0, 160) : '',
                author: foundArticle.author || 'Doorstep Hub',
                date: formattedDate,
                isoDate: rawDate ? new Date(rawDate).toISOString() : new Date().toISOString(),
                tags: foundArticle.tags || []
            };

            const related = data.data.filter(item => item.slug !== slug).slice(0, 3).map(item => ({
                id: item._id,
                title: item.title,
                category: item.subcategoryId?.name || 'General',
                image: item.coverImage?.url ? encodeURI(`https://api.doorstephub.com${item.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
                slug: item.slug,
                readTime: `${item.readTime || 3} min read`
            }));

            return { article, related };
        }
    } catch (err) {
        console.error('Error fetching article in SSR:', err);
    }
    return null;
}

export async function generateMetadata({ params }) {
    const data = await getArticleData(params.slug);
    if (!data || !data.article) {
        return {
            title: 'Knowledge Base Article | Doorstep Hub',
            description: 'Expert appliance care and repair guides from Doorstep Hub.'
        };
    }

    const { article } = data;
    const cleanDesc = article.summary || `${article.title} - Step-by-step guidance and repair tips by Doorstep Hub experts.`;

    return {
        title: `${article.title} | Doorstep Hub`,
        description: cleanDesc,
        alternates: {
            canonical: `https://doorstephub.com/knowledge/${params.slug}`,
        },
        openGraph: {
            title: article.title,
            description: cleanDesc,
            url: `https://doorstephub.com/knowledge/${params.slug}`,
            type: 'article',
            publishedTime: article.isoDate,
            images: [
                {
                    url: article.image,
                    width: 1200,
                    height: 630,
                    alt: article.title
                }
            ],
            siteName: 'Doorstep Hub'
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: cleanDesc,
            images: [article.image]
        }
    };
}

export default async function KnowledgeArticle({ params }) {
    const data = await getArticleData(params.slug);

    if (!data || !data.article) {
        return <ArticleViewPage slug={params.slug} />;
    }

    const { article, related } = data;

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.summary,
        image: [article.image],
        datePublished: article.isoDate,
        dateModified: article.isoDate,
        author: {
            '@type': 'Organization',
            name: 'Doorstep Hub',
            url: 'https://doorstephub.com'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Doorstep Hub',
            logo: {
                '@type': 'ImageObject',
                url: 'https://doorstephub.com/d-hub-logo.png'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://doorstephub.com/knowledge/${params.slug}`
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <ArticleViewPage
                slug={params.slug}
                initialArticle={article}
                initialRelated={related}
            />
        </>
    );
}
