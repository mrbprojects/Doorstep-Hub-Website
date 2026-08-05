/**
 * Internal Linking Engine
 * Generates highly relevant internal link recommendations based on entity relationships.
 */

const BASE_URL = 'https://doorstephub.com';

/**
 * Returns relevant internal links for a given entity context (City, Category, Brand).
 */
export function getInternalLinks(entityType, params = {}) {
    const { city, category, brand } = params;
    const links = [];

    if (city && category) {
        links.push({
            label: `${category} Repair Services in ${city}`,
            url: `${BASE_URL}/appliances/repair-service/${city.toLowerCase()}/${category.toLowerCase()}`
        });
    }

    if (city && brand) {
        links.push({
            label: `Authorized ${brand} Service Center in ${city}`,
            url: `${BASE_URL}/${brand.toLowerCase()}-appliance-repair-service-center/${city.toLowerCase()}`
        });
    }

    // Related verticals
    links.push({
        label: 'Annual Maintenance Contracts (AMC)',
        url: `${BASE_URL}/amc`
    });

    links.push({
        label: 'Spa & Salon at Home',
        url: `${BASE_URL}/spa-salon`
    });

    return links;
}
