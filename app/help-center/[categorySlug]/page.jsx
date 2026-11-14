import React from 'react';
import { redirect } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';
import {
    HELP_CATEGORIES,
    getCategoryBySlug,
    normalizeArticle
} from '@/components/help-center/helpCenterData';
import CategoryPageClient from './CategoryPageClient';


export const revalidate = 3600;

/**
 * Fetch all articles from the backend API for SSR
 */
async function fetchCategoryData(categorySlug) {
    const category = getCategoryBySlug(categorySlug);
    let allArticles = [];
    let settings = null;

    try {
        // 1. Fetch articles from backend API
        const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/knowledge-base?limit=100`, {
            next: { revalidate: 3600 }
        }).catch(() => null);

        if (res && res.ok) {
            const data = await res.json();
            if (data?.success && Array.isArray(data.data)) {
                allArticles = data.data.map(item => normalizeArticle(item)).filter(Boolean);
            }
        }

        // 2. Fetch global settings for support contacts
        const settingsRes = await fetch(`${API_BASE_URL}/app/get_global_settings`, {
            next: { revalidate: 3600 }
        }).catch(() => null);

        if (settingsRes && settingsRes.ok) {
            const sData = await settingsRes.json();
            if (sData?.policy) {
                settings = sData.policy;
            }
        }
    } catch (err) {
        console.error('Error fetching category data in SSR:', err);
    }

    // Compute category counts dynamically across all categories
    const categoryCounts = {};
    HELP_CATEGORIES.forEach(cat => {
        categoryCounts[cat.slug] = 0;
    });

    allArticles.forEach(art => {
        const catSlug = art.categorySlug || 'appliance-repair';
        if (categoryCounts[catSlug] !== undefined) {
            categoryCounts[catSlug] += 1;
        } else {
            categoryCounts['appliance-repair'] = (categoryCounts['appliance-repair'] || 0) + 1;
        }
    });

    return { category, allArticles, categoryCounts, settings };
}

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const categorySlug = resolvedParams?.categorySlug || 'appliance-repair';
    const category = getCategoryBySlug(categorySlug);

    const title = `${category.name} Help & Repair Guides | Doorstep Hub Help Center`;
    const description = category.description || `Browse Doorstep Hub troubleshooting tips, how-to guides and care manuals for ${category.name}.`;
    const canonical = `https://doorstephub.com/help-center/${categorySlug}`;

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
            type: 'website',
            images: [
                {
                    url: `https://doorstephub.com${category.heroImage}`,
                    width: 1200,
                    height: 630,
                    alt: `${category.name} Guides Doorstep Hub`,
                },
            ],
            siteName: 'Doorstep Hub',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`https://doorstephub.com${category.heroImage}`],
        },
    };
}

export default async function HelpCategoryPage({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const categorySlug = resolvedParams?.categorySlug || 'appliance-repair';


    const { category, allArticles, categoryCounts, settings } = await fetchCategoryData(categorySlug);

    // If not a recognized category, check if it's an article slug and redirect to detail page
    const isCategory = HELP_CATEGORIES.some(c => c.slug === categorySlug);
    if (!isCategory) {
        const matchingArticle = allArticles.find(a => a.slug === categorySlug);
        if (matchingArticle) {
            redirect(`/help-center/appliance-repair/${categorySlug}`);
        }
    }

    // Schema.org CollectionPage / BreadcrumbList
    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.name} Help Center`,
        description: category.description,
        url: `https://doorstephub.com/help-center/${categorySlug}`,
        publisher: {
            '@type': 'Organization',
            name: 'Doorstep Hub',
            logo: {
                '@type': 'ImageObject',
                url: 'https://doorstephub.com/d-hub-logo.png'
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <CategoryPageClient
                categorySlug={categorySlug}
                initialCategory={category}
                initialArticles={allArticles}
                initialCategoryCounts={categoryCounts}
                initialSettings={settings}
            />
        </>
    );
}
