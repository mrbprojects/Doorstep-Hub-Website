import { KnowledgeListingPage } from '@/components/knowledge/KnowledgeListingPage';

export const revalidate = 3600;

export const metadata = {
    title: 'Knowledge Base & Appliance Care Guides | Doorstep Hub',
    description: 'Explore comprehensive expert guides, appliance repair tips, maintenance checklists, and home service advice from Doorstep Hub professionals.',
    alternates: {
        canonical: 'https://doorstephub.com/knowledge',
    },
    openGraph: {
        title: 'Knowledge Base & Appliance Care Guides | Doorstep Hub',
        description: 'Explore expert guides, repair tips, and home maintenance checklists by Doorstep Hub.',
        url: 'https://doorstephub.com/knowledge',
        type: 'website',
    },
};

export default async function KnowledgeBase() {
    let initialArticles = [];

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base`, {
            next: { revalidate: 3600 }
        });
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
            initialArticles = data.data.map(item => {
                const rawDate = item.createdAt || item.created_at || item.date || item.updatedAt;
                let formattedDate = 'Recently Updated';
                if (rawDate) {
                    const parsedDate = new Date(rawDate);
                    if (!isNaN(parsedDate.getTime())) {
                        formattedDate = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    }
                }

                return {
                    id: item._id,
                    title: item.title,
                    category: item.subcategoryId?.name || item.categoryId?.name || item.serviceId?.name || 'General',
                    readTime: item.readTime ? `${item.readTime} min read` : '3 min read',
                    image: item.coverImage?.url ? encodeURI(`https://api.doorstephub.com${item.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
                    summary: item.summary ? item.summary.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...' : (item.description?.substring(0, 160) || '') + '...',
                    author: item.author || 'Doorstep Hub',
                    date: formattedDate,
                    slug: item.slug,
                    isTrending: item.isTrending
                };
            });
        }
    } catch (error) {
        console.error('Error fetching knowledge base in SSR:', error);
    }

    return <KnowledgeListingPage initialArticles={initialArticles} />;
}
