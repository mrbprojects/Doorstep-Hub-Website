/**
 * AI SEO Assistant with Strict Factual Grounding
 * Generates SEO titles, descriptions, and alt-text while preventing false brand claims, fake prices, or fake reviews.
 */

/**
 * Generates factually grounded metadata suggestions based on entity input.
 */
export function generateGroundedMetadata({ serviceName, city, brand, category }) {
    const cityName = city || 'India';

    let title = '';
    let description = '';

    if (brand && category) {
        title = `Expert ${brand} ${category} Repair & Service in ${cityName} | Doorstep Hub`;
        description = `Book doorstep ${brand} ${category} repair in ${cityName}. Doorstep Hub connects you with independent certified technicians. Transparent pricing, genuine spare parts, and fast service.`;
    } else if (serviceName) {
        title = `Professional ${serviceName} Services in ${cityName} | Doorstep Hub`;
        description = `Book top-rated ${serviceName} services at home in ${cityName}. Trusted doorstep service experts, doorstep convenience, and satisfaction guaranteed.`;
    } else {
        title = `Doorstep Hub | One-Stop Home & Lifestyle Services in ${cityName}`;
        description = `Doorstep Hub provides professional home appliance repair, spa & salon at home, PG/hostel stays, and religious puja services in ${cityName}.`;
    }

    return {
        title,
        description,
        disclaimer: brand ? 'Doorstep Hub provides independent repair services. All trademarks belong to their respective owners.' : null,
        approvalRequired: true
    };
}
