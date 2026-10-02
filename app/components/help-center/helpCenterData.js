import { getImageUrl } from '@/config/env';
import {
    Wrench,
    Sparkles,
    Heart,
    Building2,
    Flame,
    RefreshCw,
    Tv,
    Shield,
    Calendar,
    User
} from 'lucide-react';


/**
 * 6 Core Help Center Categories as specified in the Doorstep Hub design system
 */
export const HELP_CATEGORIES = [
    {
        id: 'appliance-repair',
        slug: 'appliance-repair',
        name: 'Appliance Repair',
        shortName: 'Appliances',
        description: 'Find guides, troubleshooting tips and helpful articles for TV, AC, Fridge, Washing Machine, Microwave and other appliances.',
        heroImage: '/hero-technician.jpg',
        badge: 'APPLIANCE REPAIR',
        iconName: 'Wrench',
        bookingRoute: '/book-appointment',
        serviceKeywords: ['appliance', 'ac', 'tv', 'washing', 'fridge', 'refrigerator', 'microwave', 'computer', 'laptop', 'repair'],
    },
    {
        id: 'salon-beauty-services',
        slug: 'salon-beauty-services',
        name: 'Salon & Beauty Services',
        shortName: 'Salon & Spa',
        description: 'Explore beauty care guides, waxing, facial tips, hair spa maintenance, and hygienic doorstep salon safety procedures.',
        heroImage: '/spa-pet-women.png',
        badge: 'SALON & BEAUTY',
        iconName: 'Sparkles',
        bookingRoute: '/spa-salon',
        serviceKeywords: ['salon', 'beauty', 'spa', 'facial', 'waxing', 'hair', 'massage', 'skin'],
    },
    {
        id: 'pet-care-services',
        slug: 'pet-care-services',
        name: 'Pet Care Services',
        shortName: 'Pet Care',
        description: 'Helpful advice on doorstep dog bathing, pet grooming, tick treatments, cat care routines, and animal safety tips.',
        heroImage: '/spa-pet-hero.png',
        badge: 'PET CARE',
        iconName: 'Heart',
        bookingRoute: '/spa-salon',
        serviceKeywords: ['pet', 'dog', 'cat', 'grooming', 'vet'],
    },
    {
        id: 'pg-hostel',
        slug: 'pg-hostel',
        name: 'PG & Hostel',
        shortName: 'PG & Hostels',
        description: 'Understand PG rental agreements, verification checklist, security deposits, food policies, and roommate etiquette.',
        heroImage: '/categories-hero-bg.jpg',
        badge: 'PG & HOSTEL',
        iconName: 'Building2',
        bookingRoute: '/pg-hostel',
        serviceKeywords: ['pg', 'hostel', 'coliving', 'rent', 'room'],
    },
    {
        id: 'pooja-religious-services',
        slug: 'pooja-religious-services',
        name: 'Pooja & Religious Services',
        shortName: 'Religious',
        description: 'Vedic ritual procedures, pooja samagri checklists, auspicious muhuratham timings, and verified pandit booking guides.',
        heroImage: '/Bharath.png',
        badge: 'POOJA & RITUALS',
        iconName: 'Flame',
        bookingRoute: '/religious-services',
        serviceKeywords: ['pooja', 'puja', 'religious', 'pandit', 'havan', 'homa'],
    },
    {
        id: 'buy-sell-old-things',
        slug: 'buy-sell-old-things',
        name: 'Buy & Sell Old Things',
        shortName: 'Buy & Sell',
        description: 'Used appliance pricing guides, doorstep inspection criteria, safe transaction practices, and free pickup guidelines.',
        heroImage: '/right-side-image.png',
        badge: 'BUY & SELL',
        iconName: 'RefreshCw',
        bookingRoute: '/sell-buy',
        serviceKeywords: ['buy', 'sell', 'used', 'second-hand', 'old', 'scrap', 'resell'],
    },
];

export const CATEGORY_ICON_MAP = {
    Wrench,
    Sparkles,
    Heart,
    Building2,
    Flame,
    RefreshCw,
    Tv,
    Shield,
    Calendar,
    User,
};

/**
 * Find category definition by slug (or fallback to appliance-repair)
 */
export function getCategoryBySlug(slug) {
    if (!slug) return HELP_CATEGORIES[0];
    const normalized = String(slug).toLowerCase().trim();
    const found = HELP_CATEGORIES.find(c => c.slug === normalized || c.id === normalized);
    if (found) return found;

    // Fallback dynamic category
    return {
        id: normalized,
        slug: normalized,
        name: normalized
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
        shortName: normalized.split('-')[0],
        description: 'Browse helpful guides, troubleshooting articles, and expert advice from Doorstep Hub professionals.',
        heroImage: '/hero-technician.jpg',
        badge: normalized.toUpperCase().replace(/-/g, ' '),
        iconName: 'Wrench',
        bookingRoute: '/book-appointment',
        serviceKeywords: [normalized],
    };
}

/**
 * Format date nicely
 */
export function formatArticleDate(rawDate) {
    if (!rawDate) return 'Recently Updated';
    try {
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return 'Recently Updated';
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Recently Updated';
    }
}

/**
 * Resolve full article image URL
 */
export function resolveArticleImageUrl(article) {
    if (article?.coverImage?.url) {
        return getImageUrl(article.coverImage.url, '/hero-technician.jpg');
    }
    if (article?.image) {
        return getImageUrl(article.image, '/hero-technician.jpg');
    }
    return '/hero-technician.jpg';
}

/**
 * Clean HTML excerpt
 */
export function extractCleanExcerpt(contentOrSummary, maxLength = 130) {
    if (!contentOrSummary) return '';
    const clean = String(contentOrSummary)
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (clean.length <= maxLength) return clean;
    return clean.substring(0, maxLength) + '...';
}

/**
 * Map raw backend article to clean normalized object
 */
export function normalizeArticle(raw, fallbackCategorySlug = 'appliance-repair') {
    if (!raw) return null;

    const rawDate = raw.publishedAt || raw.createdAt || raw.updatedAt;
    const categoryName = raw.subcategoryId?.name || raw.categoryId?.name || raw.serviceId?.name || 'General';
    const cleanCategorySlug = raw.serviceId?.slug || fallbackCategorySlug;

    return {
        id: raw._id || raw.id,
        title: raw.title || 'Help Guide',
        slug: raw.slug || '',
        categorySlug: cleanCategorySlug,
        category: categoryName,
        serviceName: raw.serviceId?.name || 'Appliance Service',
        summary: raw.summary || '',
        excerpt: extractCleanExcerpt(raw.summary || raw.content || raw.description || ''),
        readTime: raw.readTime ? `${raw.readTime} min read` : '5 min read',
        readTimeNumber: raw.readTime || 5,
        image: resolveArticleImageUrl(raw),
        publishedAt: rawDate,
        date: formatArticleDate(rawDate),
        isTrending: Boolean(raw.isTrending),
        faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
        metaDescription: raw.metaDescription || extractCleanExcerpt(raw.summary, 160),
        metaKeywords: raw.metaKeywords || raw.metakeywords || '',
    };
}
/**
 * Extract H2 and H3 headings from HTML string for Table of Contents
 */

export function extractHeadingsFromHtml(html = '', faqs = []) {
    const headings = [];
    if (html) {
        const regex = /<(h[23])[^>]*>(.*?)<\/\1>/gi;
        let match;
        let count = 0;
        while ((match = regex.exec(html)) !== null) {
            count++;
            const title = match[2].replace(/<[^>]*>?/gm, '').trim();
            if (title) {
                const safeSlug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '') || `section-${count}`;
                headings.push({
                    id: `heading-${safeSlug}`,
                    title,
                    level: match[1].toLowerCase()
                });
            }
        }
    }

    if (faqs && faqs.length > 0) {
        headings.push({
            id: 'frequently-asked-questions',
            title: 'Frequently Asked Questions',
            level: 'h2'
        });
    }

    return headings;
}

