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
 * Curated fallback excerpts for featured reference articles to guarantee exact visual fidelity
 */
const CURATED_EXCERPTS = {
    'how-do-i-contact-the-pandit-about-ceremony-requirements':
        'Learn how to communicate with a pandit after booking, share your ceremony details, and ask questions...',
    'how-do-i-book-a-housewarming-pooja':
        'Follow this step-by-step guide to book a Griha Pravesh or Housewarming Pooja on Doorstep Hub with ease.',
    'prepare-before-pandit-arrives':
        'A complete checklist of items, spiritual setup, and important preparations to ensure a smooth pooja service at your home.',
    'pooja-service-charges':
        "Understand how pooja service pricing is determined, what's included, and factors that may affect the cost.",
};

/**
 * Resolve full article image URL with reliable fallback chain:
 * 1. CMS cover image (prefixed with NEXT_PUBLIC_IMAGE_BASE_URL)
 * 2. Category fallback image
 * 3. Branded technician fallback
 */
export function resolveArticleImageUrl(article) {
    const raw = article?.coverImage?.url || article?.image;
    if (raw && typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            // Fix any stale devapis URL
            if (trimmed.includes('devapis.doorstephub.com')) {
                return trimmed.replace('https://devapis.doorstephub.com', process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com');
            }
            return trimmed;
        }
        if (trimmed.startsWith('/uploads')) {
            const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com';
            return `${base.replace(/\/+$/, '')}/${trimmed.replace(/^\/+/, '')}`;
        }
        if (trimmed.startsWith('/')) {
            return trimmed;
        }
        const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com';
        return `${base.replace(/\/+$/, '')}/${trimmed}`;
    }

    // Category-specific fallbacks to prevent any broken icon
    const cat = String(article?.category || article?.serviceName || article?.subcategoryId?.name || '').toLowerCase();
    if (cat.includes('religious') || cat.includes('pooja') || cat.includes('puja') || cat.includes('pandit')) {
        return '/Bharath.png';
    }
    if (cat.includes('salon') || cat.includes('spa') || cat.includes('beauty')) {
        return '/spa-pet-women.png';
    }
    if (cat.includes('pet')) {
        return '/spa-pet-hero.png';
    }
    if (cat.includes('pg') || cat.includes('hostel')) {
        return '/categories-hero-bg.jpg';
    }
    if (cat.includes('buy') || cat.includes('sell') || cat.includes('old')) {
        return '/right-side-image.png';
    }
    return '/hero-technician.jpg';
}

/**
 * Clean HTML excerpt safely — strips all tags, skips title-repeating headings, decodes HTML entities
 */
export function extractCleanExcerpt(contentOrSummary, maxLength = 140, slug = '') {
    if (slug && CURATED_EXCERPTS[slug]) {
        return CURATED_EXCERPTS[slug];
    }
    if (!contentOrSummary) return '';

    const str = String(contentOrSummary);

    // If HTML has <p> tags, extract first paragraph or meaningful text
    const pMatch = str.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    let candidate = pMatch ? pMatch[1] : str;

    candidate = candidate
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();

    // If candidate text is too short, fallback to stripping all headings and getting body text
    if (candidate.length < 30) {
        candidate = str
            .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/\s+/g, ' ')
            .trim();
    }

    if (!candidate) return '';
    if (candidate.length <= maxLength) return candidate;
    return candidate.substring(0, maxLength).trim() + '...';
}

/**
 * Automatically resolve accurate business vertical category and slug for an article
 */
export function resolveArticleCategory(raw, fallbackCategorySlug = 'appliance-repair') {
    if (!raw) return { slug: fallbackCategorySlug, name: 'General' };

    const sName = (raw.serviceId?.name || raw.service_name || raw.serviceName || '').toLowerCase();
    const cName = (raw.categoryId?.name || raw.category_name || raw.category || '').toLowerCase();
    const subName = (raw.subcategoryId?.name || raw.subcategory_name || '').toLowerCase();
    const title = (raw.title || '').toLowerCase();

    // Explicit serviceId slug if present
    if (raw.serviceId?.slug && HELP_CATEGORIES.some(c => c.slug === raw.serviceId.slug)) {
        const matched = HELP_CATEGORIES.find(c => c.slug === raw.serviceId.slug);
        return { slug: matched.slug, name: matched.name };
    }

    // 1. Religious Services / Pooja
    if (
        sName.includes('religious') || cName.includes('religious') || subName.includes('religious') ||
        title.includes('pooja') || title.includes('puja') || title.includes('pandit') ||
        title.includes('ceremony') || title.includes('havan') || title.includes('homa')
    ) {
        return { slug: 'pooja-religious-services', name: 'Religious Services' };
    }

    // 2. Buy & Sell
    if (
        sName.includes('sell') || sName.includes('buy') || cName.includes('sell') || cName.includes('buy') ||
        title.includes('sell') || title.includes('buy') || title.includes('item is sold') || title.includes('second-hand')
    ) {
        return { slug: 'buy-sell-old-things', name: 'Buy & Sell' };
    }

    // 3. Pet Care Services
    if (
        title.includes('pet') || title.includes('dog') || title.includes('cat') ||
        title.includes('puppy') || title.includes('grooming') ||
        sName.includes('pet care') || cName.includes('pet care')
    ) {
        return { slug: 'pet-care-services', name: 'Pet Care' };
    }

    // 4. Salon & Beauty Services
    if (
        sName.includes('saloon') || sName.includes('salon') || cName.includes('saloon') || cName.includes('salon') ||
        title.includes('salon') || title.includes('facial') || title.includes('waxing') ||
        title.includes('beauty') || title.includes('spa') || title.includes('makeup') ||
        title.includes('skin') || title.includes('hair')
    ) {
        return { slug: 'salon-beauty-services', name: 'Salon & Beauty' };
    }

    // 5. PG & Hostel
    if (
        sName.includes('pg') || sName.includes('hostel') || cName.includes('pg') || cName.includes('hostel') ||
        title.includes('pg') || title.includes('hostel') || title.includes('coliving') ||
        title.includes('room rent') || title.includes('roommate')
    ) {
        return { slug: 'pg-hostel', name: 'PG & Hostel' };
    }

    // 6. Appliance Repair
    if (
        sName.includes('appliance') || sName.includes('tv') || sName.includes('ac') ||
        cName.includes('appliance') || title.includes('appliance') || title.includes('tv') ||
        title.includes('ac') || title.includes('fridge') || title.includes('refrigerator') ||
        title.includes('washing machine') || title.includes('microwave') || title.includes('repair')
    ) {
        return { slug: 'appliance-repair', name: 'Appliance Repair' };
    }

    // Fallback based on provided fallbackCategorySlug if valid
    if (fallbackCategorySlug) {
        const found = HELP_CATEGORIES.find(c => c.slug === fallbackCategorySlug);
        if (found) return { slug: found.slug, name: found.name };
    }

    return { slug: 'appliance-repair', name: raw.serviceId?.name || 'Appliance Repair' };
}

/**
 * Map raw backend article to clean normalized object
 */
export function normalizeArticle(raw, fallbackCategorySlug = 'appliance-repair') {
    if (!raw) return null;

    const rawDate = raw.publishedAt || raw.createdAt || raw.updatedAt;
    const catResolved = resolveArticleCategory(raw, fallbackCategorySlug);
    const categoryName = raw.subcategoryId?.name || raw.categoryId?.name || catResolved.name;
    const cleanCategorySlug = catResolved.slug;
    const slug = raw.slug || '';

    return {
        id: raw._id || raw.id,
        title: raw.title || 'Help Guide',
        slug,
        categorySlug: cleanCategorySlug,
        category: categoryName,
        serviceName: raw.serviceId?.name || catResolved.name,
        summary: raw.summary || '',
        excerpt: extractCleanExcerpt(raw.summary || raw.content || raw.description || '', 140, slug),
        readTime: raw.readTime ? `${raw.readTime} min read` : '5 min read',
        readTimeNumber: raw.readTime || 5,
        image: resolveArticleImageUrl(raw),
        publishedAt: rawDate,
        date: formatArticleDate(rawDate),
        isTrending: Boolean(raw.isTrending),
        faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
        metaDescription: raw.metaDescription || extractCleanExcerpt(raw.summary, 160, slug),
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

