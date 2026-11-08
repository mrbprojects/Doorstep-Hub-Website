import { API_BASE_URL, IMAGE_BASE_URL, SITE_URL as BASE_URL } from '../config/env.js';

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
            if (['ac', 'pc', 'tv', 'ro', 'pg', 'led', 'lcd', 'cctv', 'dsh', 'amc', 'otp', 'ifb', 'hp', 'lg'].includes(word.toLowerCase())) {
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
 * Resolves city-specific high-resolution banners from public assets.
 */
export function getCityAsset(citySlug) {
    if (!citySlug) return null;
    const norm = String(citySlug).toLowerCase().trim().replace(/_/g, '-');
    if (norm.includes('vizag') || norm.includes('visakhapatnam')) return { name: 'Vizag', image: `${BASE_URL}/Vizag.png` };
    if (norm.includes('hyderabad') || norm.includes('secunderabad')) return { name: 'Hyderabad', image: `${BASE_URL}/Hyderabad.png` };
    if (norm.includes('bangalore') || norm.includes('bengaluru')) return { name: 'Bangalore', image: `${BASE_URL}/Banglore.png` };
    if (norm.includes('mumbai') || norm.includes('chembur') || norm.includes('goregaon') || norm.includes('thane')) return { name: 'Mumbai', image: `${BASE_URL}/Mumbai.png` };
    if (norm.includes('delhi') || norm.includes('noida') || norm.includes('gurgaon')) return { name: 'Delhi', image: `${BASE_URL}/Delhi.png` };
    if (norm.includes('chennai') || norm.includes('alandur') || norm.includes('tambaram')) return { name: 'Chennai', image: `${BASE_URL}/chennai.png` };
    if (norm.includes('kolkata')) return { name: 'Kolkata', image: `${BASE_URL}/kolkata.png` };
    if (norm.includes('pune')) return { name: 'Pune', image: `${BASE_URL}/pune.png` };
    if (norm.includes('vijayawada')) return { name: 'Vijayawada', image: `${BASE_URL}/Vijayawada.png` };
    if (norm.includes('rajampet')) return { name: 'Rajampet', image: `${BASE_URL}/Rajampet.png` };
    if (norm.includes('tirupati') || norm.includes('thirupathi') || norm.includes('thiruapathi')) return { name: 'Tirupati', image: `${BASE_URL}/Thirupathi.png` };
    return null;
}

/**
 * Resolves verified brand assets (logos & official names)
 */
export const KNOWN_BRANDS = [
    { name: 'A.O. Smith', slug: 'ao-smith', image: 'uploads/brands/Ao_smitth.webp' },
    { name: 'Acer', slug: 'acer', image: 'uploads/brands/1780465083897-pngwing.com_(4).webp' },
    { name: 'All Brands', slug: 'all-brands', image: 'uploads/brands/1780557330276-4971442996-Multi_Brands_Home_Appliances.webp' },
    { name: 'Apple', slug: 'apple', image: 'uploads/brands/1780464713260-pngwing.com_(6).webp' },
    { name: 'Bajaj', slug: 'bajaj', image: 'uploads/brands/1780386459612-Bajaj.webp' },
    { name: 'Blue Star', slug: 'blue-star', image: 'uploads/brands/1780386525719-Blue_Star.webp' },
    { name: 'Bosch', slug: 'bosch', image: 'uploads/brands/1780378177445-Bosch.webp' },
    { name: 'Carrier', slug: 'carrier', image: 'uploads/brands/1780378063182-Carrier.webp' },
    { name: 'Crompton', slug: 'crompton', image: 'uploads/brands/1780386491840-Crompton.webp' },
    { name: 'Daikin', slug: 'daikin', image: 'uploads/brands/1780378019212-Daikin.webp' },
    { name: 'Dell', slug: 'dell', image: 'uploads/brands/1780464943694-pngwing.com (1).png' },
    { name: 'Eureka Forbes', slug: 'eureka-forbes', image: 'uploads/brands/1780378555630-Eureka_Forbes-optimized.webp' },
    { name: 'Eurekha Forbes', slug: 'eurekha-forbes', image: 'uploads/brands/1780378555630-Eureka_Forbes-optimized.webp' },
    { name: 'Godrej', slug: 'godrej', image: 'uploads/brands/1780386304370-Godrej.webp' },
    { name: 'HP', slug: 'hp', image: 'uploads/brands/1780464750566-pngwing.com.webp' },
    { name: 'Haier', slug: 'haier', image: 'uploads/brands/1780378145929-Haier.webp' },
    { name: 'Havells', slug: 'havells', image: 'uploads/brands/1780386435040-Havells-optimized.webp' },
    { name: 'Hitachi', slug: 'hitachi', image: 'uploads/brands/1780378100242-Hitachi.webp' },
    { name: 'IFB', slug: 'ifb', image: 'uploads/brands/1780386781518-IFB.webp' },
    { name: 'Kenstar', slug: 'kenstar', image: 'uploads/brands/1780383516134-Kenstar.webp' },
    { name: 'Kent', slug: 'kent', image: 'uploads/brands/Kent_Brand.webp' },
    { name: 'LG', slug: 'lg', image: 'uploads/brands/1780378331042-LG.webp' },
    { name: 'Lenovo', slug: 'lenovo', image: 'uploads/brands/1780465158969-pngwing.com_(3).webp' },
    { name: 'Livpure', slug: 'livpure', image: 'uploads/brands/Livpure.webp' },
    { name: 'Lloyd', slug: 'lloyd', image: 'uploads/brands/1780377557857-Lloyd.webp' },
    { name: 'MI', slug: 'mi', image: 'uploads/brands/MI_TV_Repair_Center.webp' },
    { name: 'MSI', slug: 'msi', image: 'uploads/brands/1780465194455-pngwing.com (5).png' },
    { name: 'Onida', slug: 'onida', image: 'uploads/brands/1780386810235-Onida.webp' },
    { name: 'Orient Electric', slug: 'orient-electric', image: 'uploads/brands/1780386661707-Orient_Electric.webp' },
    { name: 'Panasonic', slug: 'panasonic', image: 'uploads/brands/1780377627405-Panasonic.webp' },
    { name: 'Pureit', slug: 'pureit', image: 'uploads/brands/Pureit.webp' },
    { name: 'Realme', slug: 'realme', image: 'uploads/brands/Realme_TV_Repair_Center.webp' },
    { name: 'Samsung', slug: 'samsung', image: 'uploads/brands/1780378273486-Samsung.webp' },
    { name: 'Sony', slug: 'sony', image: 'uploads/brands/Sony_TV_Repair_Center.webp' },
    { name: 'TCL', slug: 'tcl', image: 'uploads/brands/1780377592715-tcl.webp' },
    { name: 'V-Guard', slug: 'v-guard', image: 'uploads/brands/1780386692123-Guard.webp' },
    { name: 'Voltas', slug: 'voltas', image: 'uploads/brands/1780386349103-Voltas.webp' },
    { name: 'Whirlpool', slug: 'whirlpool', image: 'uploads/brands/1780378208453-Whirlpool.webp' },
];

export function getBrandAsset(text) {
    if (!text) return null;
    const lower = String(text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const tokens = lower.split(/\s+/);

    for (const b of KNOWN_BRANDS) {
        const slugClean = b.slug.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const nameClean = b.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

        // Exact match of multi-word brand name or slug in text
        if (lower === slugClean || lower === nameClean) {
            return { name: b.name, image: `${IMAGE_BASE_URL}/${b.image}` };
        }

        // Check if multi-word brand is included as phrase
        if (slugClean.includes(' ') || nameClean.includes(' ')) {
            if (lower.includes(slugClean) || lower.includes(nameClean)) {
                return { name: b.name, image: `${IMAGE_BASE_URL}/${b.image}` };
            }
        }

        // For single-word brands (including short ones like mi, hp, lg, tcl, daikin, sony), check token match
        if (tokens.includes(slugClean) || tokens.includes(nameClean)) {
            return { name: b.name, image: `${IMAGE_BASE_URL}/${b.image}` };
        }
    }
    return null;
}

/**
 * Resolves appliance category & subcategory high-resolution images
 */
export function getApplianceCategoryAsset(text) {
    if (!text) return null;
    const lower = String(text).toLowerCase();

    if (lower.includes('refrigerator') || lower.includes('fridge')) {
        return {
            categoryName: 'Refrigerator Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1766396823192-df2e7e1d2cdfa6aa805b04d39928d00b.jpg`
        };
    }
    if (lower.includes('washing-machine') || lower.includes('washing machine') || lower.includes('washer')) {
        return {
            categoryName: 'Washing Machine Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1780375679417-Washing_Machine_Repair.webp`
        };
    }
    if (lower.includes('ac-') || lower.includes('air-conditioner') || lower.includes('split ac') || lower.includes('cassette ac') || lower.includes('ac repair') || lower.includes('air conditioner')) {
        return {
            categoryName: 'AC Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1766397470990-ac repair with tech.jpg`
        };
    }
    if (lower.includes('microwave') || lower.includes('oven')) {
        return {
            categoryName: 'Microwave Oven Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1780375661938-Oven_Repair.webp`
        };
    }
    if (lower.includes('tv') || lower.includes('television') || lower.includes('led') || lower.includes('lcd')) {
        return {
            categoryName: 'TV Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1765533311561-LED tv.jpg`
        };
    }
    if (lower.includes('computer') || lower.includes('laptop') || lower.includes('pc') || lower.includes('desktop')) {
        return {
            categoryName: 'Computer & Laptop Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1766397847160-laptop repair1.jpg`
        };
    }
    if (lower.includes('geyser') || lower.includes('water-heater') || lower.includes('water heater')) {
        return {
            categoryName: 'Geyser Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1765534457937-geyser fit.jpg`
        };
    }
    if (lower.includes('water-purifier') || lower.includes('ro-') || lower.includes('purifier') || lower.includes('water purifier')) {
        return {
            categoryName: 'Water Purifier Repair',
            image: `${IMAGE_BASE_URL}/uploads/ondemandcategory/1766259651368-Water Purifier icon.jpg`
        };
    }
    return null;
}

/**
 * Centralized Social Preview Image Selector
 * Evaluates candidate images in priority order and returns a valid absolute 1200x630 Open Graph image.
 */
export function getSocialPreviewImage(data = {}, extra = {}) {
    const contextPath = extra?.path || data?.path || '';
    const contextText = `${contextPath} ${data?.title || ''} ${data?.name || ''} ${data?.categoryName || ''} ${extra?.alt || ''}`;

    const brandAsset = getBrandAsset(contextText);
    const catAsset = getApplianceCategoryAsset(contextText);
    const cityAsset = getCityAsset(contextText);

    const candidates = [
        // 1. Explicit Direct Overrides
        extra?.image,

        // 2. Featured / Banner Images from data
        data?.featuredImage,
        data?.featured_image,
        data?.bannerImage,
        data?.banner_image,
        Array.isArray(data?.banner_images) ? data.banner_images[0] : null,
        data?.banner,

        // 3. Main Image / Cover Image from data
        data?.mainImage,
        data?.main_image,
        data?.coverImage,
        data?.cover_image,
        data?.image,
        Array.isArray(data?.images) ? data.images[0] : null,

        // 4. Provider / Profile / Logo Image
        data?.logo,
        data?.profile_image,
        data?.profilePic,
        data?.avatar,

        // 5. Content / Gallery / Document Images
        Array.isArray(data?.gallery) ? data.gallery[0] : null,
        Array.isArray(data?.business_images) ? data.business_images[0] : null,
        Array.isArray(data?.subCategories) && data.subCategories[0]?.image ? data.subCategories[0].image : null,
        Array.isArray(data?.data) && data.data[0]?.image ? data.data[0].image : null,

        // 6. Category Image
        data?.categoryImage,
        data?.category_image,
        data?.categoryId?.image,
        data?.category?.image,

        // 7. Child Services Images from extraData
        Array.isArray(extra?.services) && extra.services[0]?.image ? extra.services[0].image : null,
        Array.isArray(extra?.services) && Array.isArray(extra.services[0]?.banner_images) ? extra.services[0].banner_images[0] : null,

        // 8. Brand / Category / City context assets
        catAsset?.image,
        brandAsset?.image,
        cityAsset?.image,
    ];

    for (const candidate of candidates) {
        const valid = cleanAbsoluteImageUrl(candidate);
        if (valid) {
            return {
                url: valid,
                secureUrl: valid,
                width: 1200,
                height: 630,
                alt: data?.title || data?.name || data?.business_name || extra?.alt || 'Doorstep Hub Service',
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
        alt: data?.title || extra?.alt || 'Doorstep Hub | Home & Appliance Services',
        type: 'image/png'
    };
}

/**
 * Generates highly optimized fallback tags for different business verticals and route patterns
 */
export function getFallbackMetadata(path) {
    const normalizedPath = (path || '/').toLowerCase().replace(/\/$/, '');

    // AMC Services Fallback
    if (normalizedPath.startsWith('/amc')) {
        return {
            title: 'Doorstep Hub Book AMC Services for Home Appliances & Electronics',
            description: 'Protect your AC, computer, washing machine, LED/Smart TV, refrigerator and other home appliances with Doorstep Hub Book AMC Services. Get preventive maintenance, expert repair support, doorstep service and priority booking. Book your AMC today at doorstephub.com/amc or call 8886688666.',
            keywords: ['amc', 'annual maintenance contract', 'doorstep hub amc', 'appliance amc'],
            image: `${IMAGE_BASE_URL}/uploads/Doorstep-Hub-AMC-Service.png`
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
    if (normalizedPath === '/spa-salon' || normalizedPath.startsWith('/spa-salon/')) {
        const subPath = normalizedPath.replace(/^\/spa-salon\/?/, '');
        const name = subPath ? slugToTitle(subPath) : 'Spa & Salon';
        return {
            title: subPath ? `${name} | Premium Spa & Salon Services at Home - Doorstep Hub` : `Premium Spa & Salon Services at Home | Doorstep Hub`,
            description: `Book professional ${name} services at home. Relax and rejuvenate with our certified beauticians and therapists. Call 8886688666 to book!`,
            keywords: [subPath || 'spa salon', 'spa at home', 'doorstep salon', 'beauty services near me']
        };
    }

    // 3. Religious / Puja Services
    if (normalizedPath === '/religious-services' || normalizedPath.startsWith('/religious-services/')) {
        const subPath = normalizedPath.replace(/^\/religious-services\/?/, '');
        const name = subPath ? slugToTitle(subPath) : 'Puja & Religious';
        return {
            title: subPath ? `${name} | Book Pandits & Pujas Online - Doorstep Hub` : `Book Pandits & Puja Services Online | Doorstep Hub`,
            description: `Book experienced pandits/purohits online for ${name}. We provide high quality puja items and perform rituals with devotion at your home.`,
            keywords: [subPath || 'religious services', 'book pandit online', 'online puja booking', 'purohit services']
        };
    }

    // 4. PG & Hostels
    if (normalizedPath === '/pghostels' || normalizedPath.startsWith('/pghostels/')) {
        const subPath = normalizedPath.replace(/^\/pghostels\/?/, '');
        const name = subPath ? slugToTitle(subPath) : 'PG & Hostels';
        return {
            title: subPath ? `${name} | Premium PG & Hostels - Doorstep Hub` : `Find Best PG & Hostels Near You | Doorstep Hub`,
            description: `Explore premium PG and Hostels: ${name}. Safe, hygienic food, high-speed WiFi, laundry, and affordable monthly stays near you.`,
            keywords: [subPath || 'pghostels', 'pg near me', 'hostels near me', 'paying guest stay']
        };
    }

    // 5. Nearby / Book Now Route: /nearby/service-slug/city-slug or /nearby/service-slug
    if (normalizedPath.startsWith('/nearby/')) {
        const parts = normalizedPath.replace('/nearby/', '').split('/');
        const serviceSlug = parts[0] || '';
        const citySlug = parts[1] || '';
        const cleanedSlug = serviceSlug
            .replace(/-(?:book-doorstep-service-today|repair-service-today|service-today|book-now).*$/i, '');
        const brandAsset = getBrandAsset(serviceSlug);
        // If the slug ends with the brand slug again (e.g. blue-star-...-blue-star), strip it
        const finalSlug = brandAsset?.name && cleanedSlug.toLowerCase().endsWith(`-${brandAsset.name.toLowerCase().replace(/\s+/g, '-')}`)
            ? cleanedSlug.slice(0, -(brandAsset.name.length + 1))
            : cleanedSlug;
        const rawServiceName = slugToTitle(finalSlug);
        const cityAsset = getCityAsset(citySlug);
        const cityName = cityAsset?.name || slugToTitle(citySlug);
        const catAsset = getApplianceCategoryAsset(serviceSlug);

        const title = cityName
            ? `Book ${rawServiceName} in ${cityName} | Doorstep Hub`
            : `Book ${rawServiceName} | Doorstep Hub`;
        const description = cityName
            ? `Book certified ${rawServiceName} in ${cityName} at Doorstep Hub. Same day doorstep service, genuine spare parts, transparent pricing and service warranty.`
            : `Book certified ${rawServiceName} at Doorstep Hub. Same day doorstep service, genuine spare parts, transparent pricing and service warranty.`;

        const image = brandAsset?.image || catAsset?.image || cityAsset?.image;

        return {
            title,
            description,
            keywords: [serviceSlug, cityName, 'doorstep repair', 'certified technician'],
            image
        };
    }

    // 6. Flat City Landing Pages (e.g. /appliances-repair-service-center-vizag, /appliances-repair-service-vizag)
    const flatCityMatch = normalizedPath.match(/^\/(?:appliances-repair-service-center-|appliances-repair-service-|appliances\/repair-service\/)([a-z0-9-]+)$/i);
    if (flatCityMatch) {
        const citySlug = flatCityMatch[1];
        const cityAsset = getCityAsset(citySlug);
        const cityName = cityAsset?.name || slugToTitle(citySlug);
        return {
            title: `Appliance Repair Service Center in ${cityName} | Doorstep Hub`,
            description: `Book trusted home appliance repair and service in ${cityName} at Doorstep Hub. Expert technicians for Refrigerator, Washing Machine, AC, TV, Microwave, Geyser and more with doorstep warranty.`,
            keywords: [`appliance repair ${cityName}`, `home appliance service center ${cityName}`, `technician in ${cityName}`],
            image: cityAsset?.image || `${BASE_URL}/electric-appliance.png`
        };
    }

    // 7. Category + City Flat Route (e.g. /ac-repair-service-center-vizag, /refrigerator-repair-service-center-mumbai)
    const catCityFlatMatch = normalizedPath.match(/^\/([a-z0-9-]+)-service-center-([a-z0-9-]+)$/i);
    if (catCityFlatMatch) {
        const catSlug = catCityFlatMatch[1];
        const citySlug = catCityFlatMatch[2];
        const catAsset = getApplianceCategoryAsset(catSlug);
        const cityAsset = getCityAsset(citySlug);
        const catName = catAsset?.categoryName || slugToTitle(catSlug);
        const cityName = cityAsset?.name || slugToTitle(citySlug);

        return {
            title: `Professional ${catName} & Service Center in ${cityName} | Doorstep Hub`,
            description: `Get professional doorstep ${catName} in ${cityName} by expert technicians. Genuine spare parts, warranty on repairs, and same-day service.`,
            keywords: [`${catName} ${cityName}`, `repair service center in ${cityName}`],
            image: catAsset?.image || cityAsset?.image
        };
    }

    // 8. Brand Repair Route (e.g. /godrej-appliance-repair-service-center/vizag, /dell-service-repair-center/vizag)
    const flatBrandRegex =
        /^\/([a-z0-9]+(?:-[a-z0-9]+)*-(?:appliance-)?(?:service-repair|repair-service|service|repair)-center)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/i;
    const flatBrandLegacyRegex =
        /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*-(?:appliance-)?(?:service-repair|repair-service|service|repair)-center)$/i;

    if (flatBrandRegex.test(normalizedPath) || flatBrandLegacyRegex.test(normalizedPath)) {
        const isLegacy = flatBrandLegacyRegex.test(normalizedPath);
        const match = normalizedPath.match(isLegacy ? flatBrandLegacyRegex : flatBrandRegex);
        const rawBrandPart = match[isLegacy ? 2 : 1];
        const rawCityPart = match[isLegacy ? 1 : 2];

        // Clean out duplicate keywords from brand slug
        const cleanBrandSlug = rawBrandPart
            .replace(/-(?:appliance-)?(?:service-repair|repair-service|service|repair)-center$/i, '')
            .replace(/-services?$/i, '');
        const brandAsset = getBrandAsset(cleanBrandSlug);
        const brand = brandAsset?.name || slugToTitle(cleanBrandSlug);

        const cityAsset = getCityAsset(rawCityPart);
        const city = cityAsset?.name || slugToTitle(rawCityPart);

        return {
            title: `${brand} Repair & Service Center in ${city} | Doorstep Hub`,
            description: `Book ${brand} repair and service in ${city} at Doorstep Hub. Verified technicians, genuine ${brand} spare parts, and transparent pricing. Book now!`,
            keywords: [`${brand} repair ${city}`, `${brand} service center ${city}`, `doorstep repair`],
            image: brandAsset?.image || cityAsset?.image
        };
    }

    // 9. 3-Part Brand Repair Route (/city/category/brand or /appliances/repair-service/city/category/brand)
    const brand3PartRegex = /\/(?:appliances\/repair-service\/)?([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)$/;
    if (brand3PartRegex.test(normalizedPath) && !normalizedPath.startsWith('/sell-buy/')) {
        const match = normalizedPath.match(brand3PartRegex);
        const cityAsset = getCityAsset(match[1]);
        const city = cityAsset?.name || slugToTitle(match[1]);
        const catAsset = getApplianceCategoryAsset(match[2]);
        const category = catAsset?.categoryName || slugToTitle(match[2]);
        const brandAsset = getBrandAsset(match[3]);
        const brand = brandAsset?.name || slugToTitle(match[3]);

        return {
            title: `${brand} ${category} Service Center in ${city} | Doorstep Hub`,
            description: `Professional ${brand} ${category} repair and service in ${city}. Verified technicians, genuine spare parts, and transparent pricing. Book now!`,
            keywords: [`${brand} ${category} repair ${city}`, `${brand} service center ${city}`, `doorstep repair`],
            image: brandAsset?.image || catAsset?.image || cityAsset?.image
        };
    }

    // 10. 2-Segment Appliance Sub-service Fallback (e.g. /ac-repair-services/ac-installation-services)
    const twoSegmentMatch = normalizedPath.match(/^\/([a-z0-9-]+)\/([a-z0-9-]+)$/i);
    if (twoSegmentMatch && !normalizedPath.startsWith('/sell-buy/') && !normalizedPath.startsWith('/services/')) {
        const catSlug = twoSegmentMatch[1];
        const subSlug = twoSegmentMatch[2];
        const subName = slugToTitle(subSlug.replace(/-services$/i, ''));
        const catAsset = getApplianceCategoryAsset(catSlug);
        const catName = catAsset?.categoryName || slugToTitle(catSlug.replace(/-services$/i, ''));
        return {
            title: `${subName} | ${catName} | Doorstep Hub`,
            description: `Book professional ${subName} with expert doorstep service at Doorstep Hub. Certified technicians, transparent pricing, genuine spare parts, and complete warranty.`,
            keywords: [subSlug, `${subName} service`, `${catName} repair`, 'doorstep service'],
            image: catAsset?.image || `${BASE_URL}/electric-appliance.png`
        };
    }

    // 11. General Single Slug Fallback (e.g. /double-door-refrigerator-noise-repair-problems, /geyser-repair-service)
    const singleSlug = normalizedPath.replace(/^\//, '');
    if (singleSlug && !singleSlug.includes('/')) {
        const name = slugToTitle(singleSlug);
        const catAsset = getApplianceCategoryAsset(singleSlug);
        const brandAsset = getBrandAsset(singleSlug);
        return {
            title: `${name} | Doorstep Hub`,
            description: `Expert doorstep service for ${name} at Doorstep Hub. Certified technicians, transparent pricing, genuine spare parts, and complete warranty.`,
            keywords: [singleSlug, `${name} service`, `doorstep repair`],
            image: catAsset?.image || brandAsset?.image
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
                } catch { }
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
            } catch {
                // Ignore and fall through
            }
        }

        // 5. Fallback to Smart SEO API if not resolved yet
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
                        if (d.image || d.bannerImage || d.coverImage || d.logo) {
                            resolvedImageObj = getSocialPreviewImage(d, { path: cleanPath });
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
        ? (typeof defaultFallback.image === 'string'
            ? { url: cleanAbsoluteImageUrl(defaultFallback.image) || `${BASE_URL}/d-hub-logo.png`, secureUrl: cleanAbsoluteImageUrl(defaultFallback.image) || `${BASE_URL}/d-hub-logo.png`, width: 1200, height: 630, alt: title }
            : defaultFallback.image)
        : (resolvedImageObj || getSocialPreviewImage(resolvedData, { path: cleanPath, image: generatedFallback.image, alt: title }));

    // Ensure image alt text is accurate to page title
    finalImageObj.alt = title;

    // Avoid duplicate template suffix if title already includes branding
    const finalTitle = title.includes('Doorstep Hub') ? { absolute: title } : title;

    return {
        metadataBase: new URL(BASE_URL),
        title: finalTitle,
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
