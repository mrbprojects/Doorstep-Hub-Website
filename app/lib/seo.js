// Server-side SEO metadata fetching and generation utilities
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
const BASE_URL = 'https://doorstephub.com';

// Helper to capitalize words from a slug (e.g., ac-repair -> AC Repair)
function slugToTitle(slug) {
    if (!slug) return '';
    return slug
        .split('-')
        .map(word => {
            if (['ac', 'pc', 'tv', 'ro', 'pg'].includes(word.toLowerCase())) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

// Generates highly optimized fallback tags for different business verticals
function getFallbackMetadata(path) {
    const normalizedPath = path.toLowerCase().replace(/\/$/, '');

    // Default site fallback
    const defaultMeta = {
        title: 'Doorstep Hub | One-Stop Home & Lifestyle Services in India',
        description: 'Doorstep Hub Delivers Professional Appliance Repair, Spa & Saloon, PG & Hostel Booking Sytem Lifestyle and Religious services across India.',
        keywords: ['home services', 'doorstep repair', 'appliance repair', 'spa home services', 'pandits online', 'pg hostels']
    };

    // AMC Services Fallback
    if (normalizedPath.startsWith('/amc')) {
        return {
            title: 'Doorstep Hub Book AMC Services for Home Appliances & Electronics',
            description: 'Protect your AC, computer, washing machine, LED/Smart TV, refrigerator and other home appliances with Doorstep Hub Book AMC Services. Get preventive maintenance, expert repair support, doorstep service and priority booking. Book your AMC today at doorstephub.com/amc or call 8886688666.',
            keywords: ['amc', 'annual maintenance contract', 'doorstep hub amc', 'appliance amc']
        };
    }

    // 1. Spa & Salon Services
    if (normalizedPath.startsWith('/spa-salon/')) {
        const subPath = normalizedPath.replace('/spa-salon/', '');
        if (subPath) {
            const name = slugToTitle(subPath);
            return {
                title: `${name} | Premium Spa & Salon Services at Home - Doorstep Hub`,
                description: `Book professional ${name} services at home. Relax and rejuvenate with our certified beauticians and therapists. Call 8886688666 to book!`,
                keywords: [subPath, 'spa at home', 'doorstep salon', 'beauty services near me']
            };
        }
    }

    // 2. Religious / Puja Services
    if (normalizedPath.startsWith('/religious-services/')) {
        const subPath = normalizedPath.replace('/religious-services/', '');
        if (subPath) {
            const name = slugToTitle(subPath);
            return {
                title: `${name} | Book Pandits & Pujas Online - Doorstep Hub`,
                description: `Book experienced pandits/purohits online for ${name}. We provide high quality puja items and perform rituals with devotion at your home.`,
                keywords: [subPath, 'book pandit online', 'online puja booking', 'purohit services']
            };
        }
    }

    // 3. PG & Hostels
    if (normalizedPath.startsWith('/pghostels/')) {
        const subPath = normalizedPath.replace('/pghostels/', '');
        if (subPath) {
            const name = slugToTitle(subPath);
            return {
                title: `${name} | Premium PG & Hostels - Doorstep Hub`,
                description: `Explore premium PG and Hostels: ${name}. Safe, hygienic food, high-speed WiFi, laundry, and affordable monthly stays near you.`,
                keywords: [subPath, 'pg near me', 'hostels near me', 'paying guest stay']
            };
        }
    }

    // 4. Appliance Brand Repair Route: /[city]/[category]/[brand] or /[city]/[brand]
    const brandRegex = /\/(appliances\/repair-service|(?![a-zA-Z0-9-]+\.))[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;
    if (brandRegex.test(normalizedPath)) {
        const parts = normalizedPath.replace(/^\/(appliances\/repair-service\/)?/, '').split('/');
        if (parts.length === 3) {
            const city = slugToTitle(parts[0]);
            const category = slugToTitle(parts[1]);
            const brand = slugToTitle(parts[2]);
            return {
                title: `Authorized ${brand} ${category} Service Center in ${city} | Doorstep Hub`,
                description: `Professional ${brand} ${category} repair and service in ${city}. Verified technicians, genuine spare parts, and transparent pricing. Book now!`,
                keywords: [`${brand} ${category} repair ${city}`, `${brand} service center ${city}`, `doorstep repair`]
            };
        }
    }

    const flatBrandRegex =
        /^\/[a-z0-9]+(?:-[a-z0-9]+)*-(?:appliance-)?repair-service-center\/[a-z0-9]+(?:-[a-z0-9]+)*$/i;
    const flatBrandLegacyRegex =
        /^\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*-(?:appliance-)?repair-service-center$/i;
    if (flatBrandRegex.test(normalizedPath) || flatBrandLegacyRegex.test(normalizedPath)) {
        const parts = normalizedPath.replace(/^\//, '').split('/');
        const isLegacy = flatBrandLegacyRegex.test(normalizedPath);
        const city = slugToTitle(parts[isLegacy ? 0 : 1]);
        const brand = slugToTitle(parts[isLegacy ? 1 : 0]);
        return {
            title: `Authorized ${brand} Appliance Repair Service Center in ${city} | Doorstep Hub`,
            description: `Professional ${brand} appliance repair and service in ${city}. Verified technicians, genuine spare parts, and transparent pricing. Book now!`,
            keywords: [`${brand} repair ${city}`, `${brand} service center ${city}`, `doorstep repair`]
        };
    }

    // 5. Appliance Category/City Route: /appliances/repair-service/[city]/[category]
    const catCityRegex = /\/appliances\/repair-service\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;
    if (catCityRegex.test(normalizedPath)) {
        const parts = normalizedPath.replace('/appliances/repair-service/', '').split('/');
        if (parts.length === 2) {
            const city = slugToTitle(parts[0]);
            const category = slugToTitle(parts[1]);
            return {
                title: `Professional ${category} Repair & Service in ${city} | Doorstep Hub`,
                description: `Get professional doorstep ${category} repair and service in ${city} by expert technicians. Genuine spare parts, warranty on repairs, and same-day service.`,
                keywords: [`${category} repair ${city}`, `${category} service ${city}`, `${category} technician`]
            };
        }
    }

    // 6. Appliance City Route: /appliances/repair-service/[city]
    const cityRegex = /\/appliances\/repair-service\/[a-zA-Z0-9-]+$/;
    if (cityRegex.test(normalizedPath)) {
        const city = slugToTitle(normalizedPath.split('/').pop());
        return {
            title: `Best Home Appliance Repair & Services in ${city} | Doorstep Hub`,
            description: `Book trusted home appliance repair and maintenance services in ${city}. Certified technicians for AC, Refrigerator, ReRO, Washing Machine repair.`,
            keywords: [`appliance repair ${city}`, `washing machine repair ${city}`, `fridge repair ${city}`]
        };
    }

    // 7. General Slug Fallback (e.g. /geyser-repair-service)
    const singleSlug = normalizedPath.replace(/^\//, '');
    if (singleSlug && !singleSlug.includes('/')) {
        const name = slugToTitle(singleSlug);
        return {
            title: `${name} | Reliable Doorstep Service - Doorstep Hub`,
            description: `Book professional doorstep ${name} at Doorstep Hub. Certified technicians, transparent pricing, genuine spares, and complete warranty.`,
            keywords: [singleSlug, `${name} service`, `doorstep repair`]
        };
    }

    return defaultMeta;
}

/**
 * Fetch and construct Next.js metadata objects from server-side APIs
 * @param {string} rawPath - The request URL path
 * @param {Object} [defaultFallback] - Optional custom fallback metadata
 * @returns {Promise<Object>} Next.js Metadata object
 */
export async function getSEOMetadata(rawPath, defaultFallback = null) {
    const cleanPath = (rawPath || '/').split('?')[0].replace(/\/$/, '') || '/';
    const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;

    let seoData = null;

    try {
        // Resolve dynamic endpoints based on route patterns (matching DynamicSEO client component logic)
        if (cleanPath.includes('/details/')) {
            const slug = cleanPath.split('/details/').pop();
            const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/dhub_service_details/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                next: { revalidate: 3600 }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.seo) {
                    seoData = result.seo;
                }
            }
        } else if (cleanPath.includes('/store/') || cleanPath.includes('/service-list/')) {
            const id = cleanPath.includes('/store/') ? cleanPath.split('/store/').pop() : cleanPath.split('/service-list/').pop();
            const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/service_center_services/${id}`, {
                next: { revalidate: 3600 }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.serviceCenter?.seo) {
                    seoData = result.serviceCenter.seo;
                }
            }
        }

        // Fallback to Smart SEO API if not resolved yet
        if (!seoData) {
            const response = await fetch(`${API_BASE_URL}/web/seo/get-page-seo?path=${encodeURIComponent(cleanPath)}`, {
                next: { revalidate: 3600 }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    seoData = result.data.data || result.data;
                }
            }
        }
    } catch (error) {
        console.error(`[SEO Server] Error fetching SEO metadata for path ${cleanPath}:`, error);
    }

    // Determine fallback values
    const generatedFallback = getFallbackMetadata(cleanPath);
    const title = seoData?.title && seoData.title !== 'Doorstep Hub | One-Stop Home & Lifestyle Services in India'
        ? seoData.title
        : (defaultFallback?.title || generatedFallback.title);

    const description = seoData?.description && seoData.description !== 'Doorstep Hub Delivers Professional Appliance Repair, Spa & Saloon, PG & Hostel Booking Sytem Lifestyle and Religious services across India.'
        ? seoData.description
        : (defaultFallback?.description || generatedFallback.description);

    const keywordsRaw = seoData?.keywords || defaultFallback?.keywords || generatedFallback.keywords;
    const keywords = Array.isArray(keywordsRaw) ? keywordsRaw.join(', ') : String(keywordsRaw || '');

    let rawImageUrl = seoData?.image || defaultFallback?.image || generatedFallback?.image;
    let imageUrl = 'https://doorstephub.com/d-hub-logo.png';

    if (rawImageUrl && typeof rawImageUrl === 'string') {
        if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
            imageUrl = rawImageUrl;
        } else {
            imageUrl = `https://devapis.doorstephub.com/${rawImageUrl.replace(/^\//, '')}`;
        }
    } else if (cleanPath.startsWith('/amc')) {
        imageUrl = 'https://devapis.doorstephub.com/uploads/Doorstep-Hub-AMC-Service.png';
    }

    return {
        metadataBase: new URL('https://doorstephub.com'),
        title,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Doorstep Hub',
            images: [
                {
                    url: imageUrl,
                    secureUrl: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                    type: imageUrl.endsWith('.png') ? 'image/png' : imageUrl.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
                },
            ],
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [
                {
                    url: imageUrl,
                    alt: title
                }
            ],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

/**
 * Generates JSON-LD schema microdata for schema.org/ImageObject
 */
export function generateImageObjectSchema({ url, title, caption, width = 1200, height = 630 }) {
    if (!url) return null;
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        'contentUrl': url,
        'url': url,
        'name': title || 'Doorstep Hub Service Image',
        'description': caption || title || 'Doorstep Hub Home & Appliance Service Image',
        'width': width,
        'height': height
    };
}

