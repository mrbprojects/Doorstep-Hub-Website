import React from 'react';
import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';
import {
    getCategoryBySlug,
    normalizeArticle,
    extractHeadingsFromHtml
} from '@/components/help-center/helpCenterData';
import ArticlePageClient from './ArticlePageClient';

export const revalidate = 3600;

/**
 * Fetch single article and related articles by slug for SSR
 */
async function fetchArticleData(categorySlug, articleSlug) {
    const category = getCategoryBySlug(categorySlug);
    let article = null;
    let relatedArticles = [];

    try {
        // 1. Fetch single article by slug from backend
        const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/knowledge-base/${articleSlug}`, {
            next: { revalidate: 3600 }
        }).catch(() => null);

        if (res && res.ok) {
            const data = await res.json();
            if (data?.success && data.data) {
                article = normalizeArticle(data.data, categorySlug);
                // Preserve full content HTML and raw FAQs
                article.contentHtml = data.data.summary || data.data.content || data.data.description || '';
                article.faqs = Array.isArray(data.data.faqs) ? data.data.faqs : [];
            }
        }

        // 2. Fetch related articles
        const listRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/knowledge-base?limit=10`, {
            next: { revalidate: 3600 }
        }).catch(() => null);

        if (listRes && listRes.ok) {
            const listData = await listRes.json();
            if (listData?.success && Array.isArray(listData.data)) {
                relatedArticles = listData.data
                    .filter(item => item.slug !== articleSlug)
                    .slice(0, 3)
                    .map(item => normalizeArticle(item, categorySlug));
            }
        }
    } catch (err) {
        console.error('Error fetching article data in SSR:', err);
    }

    return { category, article, relatedArticles };
}

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const categorySlug = resolvedParams?.categorySlug || 'appliance-repair';
    const articleSlug = resolvedParams?.articleSlug || '';

    const { category, article } = await fetchArticleData(categorySlug, articleSlug);

    if (!article) {
        return {
            title: 'Help Center Article | Doorstep Hub',
            description: 'Read expert home service and appliance repair guides from Doorstep Hub.',
        };
    }

    const title = `${article.title} | Doorstep Hub Help Center`;
    const description = article.metaDescription || article.excerpt || `${article.title} - Step-by-step guidance from Doorstep Hub experts.`;
    const canonical = `https://doorstephub.com/help-center/${categorySlug}/${articleSlug}`;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            type: 'article',
            publishedTime: article.publishedAt,
            images: [
                {
                    url: article.image,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                },
            ],
            siteName: 'Doorstep Hub',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [article.image],
        },
    };
}

export default async function HelpArticleDetailPage({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const categorySlug = resolvedParams?.categorySlug || 'appliance-repair';
    const articleSlug = resolvedParams?.articleSlug || '';


    const { category, article, relatedArticles } = await fetchArticleData(categorySlug, articleSlug);

    if (!article) {
        notFound();
    }

    // Article Schema.org JSON-LD
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.metaDescription || article.excerpt,
        image: [article.image],
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
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
            '@id': `https://doorstephub.com/help-center/${categorySlug}/${articleSlug}`
        }
    };

    // FAQPage Schema if FAQs exist
    const faqSchema = article.faqs && article.faqs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    } : null;

    const headings = extractHeadingsFromHtml(article.contentHtml, article.faqs);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}

            <ArticlePageClient
                categorySlug={categorySlug}
                articleSlug={articleSlug}
                initialCategory={category}
                initialArticle={article}
                initialRelated={relatedArticles}
                initialHeadings={headings}
            />
        </>
    );
}

