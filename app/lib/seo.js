import { API_BASE_URL, IMAGE_BASE_URL, SITE_URL as BASE_URL, getImageUrl } from '../config/env.js';

/**
 * Capitalizes words from a slug (e.g., ac-repair -> AC Repair, guguloth-raju -> Guguloth Raju)
 */
export function slugToTitle(slug) {
    if (!slug || typeof slug !== 'string') return '';
    const clean = slug.split('?')[0].replace(/^\/+|\/+$/g, '');
    const lastPart = clean.split('/').pop() || clean;
    return lastPart
        .split('-')
        .map(word => {
            if (['ac', 'pc', 'tv', 'ro', 'pg', 'led', 'lcd', 'cctv', 'dsh', 'amc', 'otp'].includes(word.toLowerCase())) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Validates and converts an image path to an absolute HTTPS URL.
 */
function cleanAbsoluteImageUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;
    if (trimmed.includes('default_image.jpg') || trimmed.includes('default_profile')) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed.replace('http://', 'https://');
    }
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${IMAGE_BASE_URL}${path}`;
}

/**
 * Centralized Social Preview Image Selector
 * Evaluates candidate images in priority order and returns a valid absolute 1200x630 Open Graph image.
 * 
 * Priority:
 * 1. Page-specific banner / featured image
 * 2. Main visible image on that page
 * 3. First valid content / gallery / document image
 * 4. Provider / Profile image (when provider is primary subject)
 * 5. Category image
 * 6. Child service images (from extra data)
 * 7. Global fallback social card (1200x630)
 */
export function getSocialPreviewImage(data = {}, extra = {}) {
    const candidates = [
        // 1. Featured / Banner Images
        data?.featuredImage,
        data?.featured_image,
        data?.bannerImage,
        data?.banner_image,
        Array.isArray(data?.banner_images) ? data.banner_images[0] : null,
        data?.banner,

        // 2. Main Image / Cover Image
        data?.mainImage,
        data?.main_image,
        data?.coverImage,
        data?.cover_image,
        data?.image,
        Array.isArray(data?.images) ? data.images[0] : null,

        // 3. Provider / Profile / Logo Image
        data?.logo,
        data?.profile_image,
        data?.profilePic,
        data?.avatar,

        // 4. Content / Gallery / Document Images
        Array.isArray(data?.gallery) ? data.gallery[0] : null,
        Array.isArray(data?.business_images) ? data.business_images[0] : null,
        Array.isArray(data?.subCategories) && data.subCategories[0]?.image ? data.subCategories[0].image : null,
        Array.isArray(data?.data) && data.data[0]?.image ? data.data[0].image : null,

        // 5. Category Image
        data?.categoryImage,
        data?.category_image,
        data?.categoryId?.image,
        data?.category?.image,

        // 6. Child Services Images from extraData
        Array.isArray(extra?.services) && extra.services[0]?.image ? extra.services[0].image : null,
        Array.isArray(extra?.services) && Array.isArray(extra.services[0]?.banner_images) ? extra.services[0].banner_images[0] : null,
    ];

    for (const candidate of candidates) {
        const valid = cleanAbsoluteImageUrl(candidate);
        if (valid) {
            return {
                url: valid,
                secureUrl: valid,
                width: 1200,
                height: 630,
                alt: data?.title || data?.name || data?.business_name || 'Doorstep Hub Service',
                type: valid.endsWith('.png') ? 'image/png' : valid.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
            };
        }
    }

    // High-resolution global fallback
    const fallbackUrl = `${BASE_URL}/d-hub-logo.png`;
    return {
        url: fallbackUrl,
        secureUrl: fallbackUrl,
        width: 1200,
        height: 630,
        alt: 'Doorstep Hub | Home & Appliance Services',
        type: 'image/png'
    };
}

/**
 * Generates highly optimized fallback tags for different business verticals
 */
export function getFallbackMetadata(path) {
    const normalizedPath = (path || '/').toLowerCase().replace(/\/$/, '');

    // AMC Services Fallback
    if (normalizedPath.startsWith('/amc')) {
        return {
            title: 'Doorstep Hub Book AMC Services for Home Appliances & Electronics',
            description: 'Protect your AC, computer, washing machine, LED/Smart TV, refrigerator and other home appliances with Doorstep Hub Book AMC Services. Get preventive maintenance, expert repair support, doorstep service and priority booking. Book your AMC today at doorstephub.com/amc or call 8886688666.',
            keywords: ['amc', 'annual maintenance contract', 'doorstep hub amc', 'appliance amc']
        };
    }

    // 1. Service List / Provider Detail Fallback (e.g. /service-list/guguloth-raju)
    if (normalizedPath.startsWith('/service-list/')) {
        const slug = normalizedPath.replace('/service-list/', '');
        const name = slugToTitle(slug);
        return {
            title: `${name} | Doorstep Hub Verified Service Provider`,
            description: `Book trusted, certified home appliance and repair services from ${name} on Doorstep Hub. Transparent pricing, verified professionals, and complete warranty.`,
            keywords: [slug, `${name} service`, `${name} hyderabad`, 'doorstep repair', 'verified provider']
        };
    }

    // 2. Spa & Salon Services
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

    // 3. Religious / Puja Services
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

    // 4. PG & Hostels
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

    // 5. Appliance Brand Repair Route
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

    // 6. Appliance Category/City Route
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

    // 7. General Single Slug Fallback (e.g. /geyser-repair-service)
    const singleSlug = normalizedPath.replace(/^\//, '');
    if (singleSlug && !singleSlug.includes('/')) {
        const name = slugToTitle(singleSlug);
        return {
            title: `${name} | Reliable Doorstep Service - Doorstep Hub`,
            description: `Book professional doorstep ${name} at Doorstep Hub. Certified technicians, transparent pricing, genuine spares, and complete warranty.`,
            keywords: [singleSlug, `${name} service`, `doorstep repair`]
        };
    }

    // Default site fallback
    return {
        title: 'Doorstep Hub | One-Stop Home & Lifestyle Services in India',
        description: 'Doorstep Hub Delivers Professional Appliance Repair, Spa & Saloon, PG & Hostel Booking System, Lifestyle and Religious services across India.',
        keywords: ['home services', 'doorstep repair', 'appliance repair', 'spa home services', 'pandits online', 'pg hostels']
    };
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

    let resolvedData = null;
    let resolvedImageObj = null;

    try {
        // 1. Service Details endpoint (/details/[slug])
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
                if (result.success) {
                    resolvedData = {
                        title: result.seo?.title || result.data?.name || result.data?.title,
                        description: result.seo?.description || result.data?.description,
                        keywords: result.seo?.keywords,
                    };
                    resolvedImageObj = getSocialPreviewImage(result.data || result);
                }
            }
        }
        // 2. Service Center / Store / Service List (/service-list/[slug] or /store/[slug])
        else if (cleanPath.includes('/store/') || cleanPath.includes('/service-list/')) {
            const slug = cleanPath.includes('/store/') ? cleanPath.split('/store/').pop() : cleanPath.split('/service-list/').pop();
            const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/service_center_services/${slug}`, {
                next: { revalidate: 3600 }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.serviceCenter) {
                    const sc = result.serviceCenter;
                    resolvedData = {
                        title: sc.seo?.title || sc.metaTitle || (sc.business_name ? `${sc.business_name} | Doorstep Hub` : null) || (sc.name ? `${sc.name} | Doorstep Hub` : null),
                        description: sc.seo?.description || sc.metaDescription || sc.bio,
                        keywords: sc.seo?.keywords || sc.metakeywords,
                    };
                    resolvedImageObj = getSocialPreviewImage(sc, { services: result.services });
                }
            }
        }
        // 3. Sell & Buy Category or Ad
        else if (cleanPath.startsWith('/sell-buy/')) {
            const sub = cleanPath.replace('/sell-buy/', '');
            if (sub.startsWith('ad/')) {
                const adSlug = sub.replace('ad/', '');
                try {
                    const res = await fetch(`${API_BASE_URL}/sell-buy/listings/${adSlug}`, { next: { revalidate: 60 } });
                    if (res.ok) {
                        const json = await res.json();
                        const listing = json.data?.listing;
                        if (listing) {
                            resolvedData = {
                                title: `${listing.title} | Buy & Sell on Doorstep Hub`,
                                description: listing.description?.substring(0, 160) || `Buy and sell ${listing.title} on Doorstep Hub.`,
                            };
                            resolvedImageObj = getSocialPreviewImage(listing);
                        }
                    }
                } catch(e) {}
            } else if (!sub.includes('/')) {
                // Category page
                const catName = slugToTitle(sub);
                resolvedData = {
                    title: `Buy & Sell Used ${catName} | Doorstep Hub Marketplace`,
                    description: `Find verified pre-owned ${catName} at best prices. Browse local listings with inspection guarantee and direct buyer-seller chat on Doorstep Hub.`,
                };
            }
        }
        // 4. Root Slug / Category / Subcategory (/side-by-side-door-refrigerator-repair, etc.)
        else if (cleanPath.startsWith('/') && !cleanPath.includes('/', 1)) {
            const slug = cleanPath.slice(1);
            // Try fetching category/subcategory
            try {
                const catResponse = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug }),
                    next: { revalidate: 3600 }
                });
                if (catResponse.ok) {
                    const catData = await catResponse.json();
                    if (catData.success && Array.isArray(catData.data) && catData.data.length > 0) {
                        const name = catData.categoryName || slugToTitle(slug);
                        resolvedData = {
                            title: `Best ${name} Services | Doorstep Hub`,
                            description: `Book top-rated doorstep ${name} by certified technicians. Transparent pricing, genuine spare parts, and doorstep service.`,
                            keywords: [slug, `${name} service`, `${name} repair`, 'doorstep service']
                        };
                        resolvedImageObj = getSocialPreviewImage(catData);
                    }
                }
            } catch (catErr) {
                // Ignore and fall through
            }
        }

        // 4. Fallback to Smart SEO API if not resolved yet
        if (!resolvedData) {
            const response = await fetch(`${API_BASE_URL}/web/seo/get-page-seo?path=${encodeURIComponent(cleanPath)}`, {
                next: { revalidate: 3600 }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const d = result.data.data || result.data;
                    if (d.title && d.title !== 'Doorstep Hub | One-Stop Home & Lifestyle Services in India') {
                        resolvedData = d;
                        if (!resolvedImageObj) {
                            resolvedImageObj = getSocialPreviewImage(d);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`[SEO Server] Error fetching SEO metadata for path ${cleanPath}:`, error);
    }

    // Determine accurate fallback values
    const generatedFallback = getFallbackMetadata(cleanPath);
    const title = defaultFallback?.title || resolvedData?.title || generatedFallback.title;
    const description = defaultFallback?.description || resolvedData?.description || generatedFallback.description;

    const keywordsRaw = defaultFallback?.keywords || resolvedData?.keywords || generatedFallback.keywords;
    const keywords = Array.isArray(keywordsRaw) ? keywordsRaw.join(', ') : String(keywordsRaw || '');

    const finalImageObj = defaultFallback?.image 
        ? (typeof defaultFallback.image === 'string' ? { url: cleanAbsoluteImageUrl(defaultFallback.image) || `${BASE_URL}/d-hub-logo.png`, secureUrl: cleanAbsoluteImageUrl(defaultFallback.image) || `${BASE_URL}/d-hub-logo.png`, width: 1200, height: 630, alt: title } : defaultFallback.image)
        : (resolvedImageObj || getSocialPreviewImage(resolvedData, {}));

    // Ensure image alt text is accurate to page title
    finalImageObj.alt = title;

    return {
        metadataBase: new URL(BASE_URL),
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
                    url: finalImageObj.url,
                    secureUrl: finalImageObj.secureUrl || finalImageObj.url,
                    width: finalImageObj.width || 1200,
                    height: finalImageObj.height || 630,
                    alt: title,
                    type: finalImageObj.url.endsWith('.png') ? 'image/png' : finalImageObj.url.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
                },
            ],
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [finalImageObj.url],
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
