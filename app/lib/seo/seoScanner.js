/**
 * SEO Health Scanner & Explainable Score Calculator Engine
 * Weighted Categories (Total: 100):
 * - Technical Indexability: 20
 * - Canonical & URL Integrity: 15
 * - Metadata: 15
 * - Content Quality & Uniqueness: 15
 * - Structured Data: 10
 * - Internal Linking: 10
 * - Images & Open Graph: 5
 * - Performance: 5
 * - Local/Entity Relevance: 5
 */
export function calculateSEOScore(pageData = {}) {
    const {
        statusCode = 200,
        canonical = '',
        title = '',
        description = '',
        h1Count = 1,
        hasSchema = false,
        internalLinksCount = 0,
        hasOgImage = false,
        imagesWithAltCount = 0,
        totalImagesCount = 0,
        wordCount = 300,
        isNoIndex = false,
        isRedirect = false,
        isRobotsBlocked = false,
        canonicalMismatch = false,
        soft404 = false,
        brokenBookingCta = false,
        cityRelevance = true,
        performanceMs = 150
    } = pageData;

    const breakdown = {
        technicalIndexability: 0, // Max 20
        canonicalIntegrity: 0,     // Max 15
        metadata: 0,               // Max 15
        contentQuality: 0,         // Max 15
        structuredData: 0,         // Max 10
        internalLinking: 0,        // Max 10
        imagesAndOg: 0,             // Max 5
        performance: 0,            // Max 5
        localRelevance: 0          // Max 5
    };

    const suggestions = [];
    const criticalFailures = [];

    // Critical Failures Audit
    if (statusCode !== 200) criticalFailures.push(`Page returned non-200 HTTP status: ${statusCode}`);
    if (isRedirect) criticalFailures.push('URL is a redirect target or redirect source in sitemap');
    if (canonicalMismatch) criticalFailures.push('Canonical URL does not match current target URL');
    if (isNoIndex) criticalFailures.push('Page contains noindex directive');
    if (isRobotsBlocked) criticalFailures.push('Page is blocked by robots.txt');
    if (!title || title.trim().length === 0) criticalFailures.push('Missing H1 or title tag');
    if (h1Count === 0) criticalFailures.push('Missing H1 heading tag');
    if (soft404) criticalFailures.push('Soft 404 detected');
    if (brokenBookingCta) criticalFailures.push('Broken booking call-to-action');

    // 1. Technical Indexability (20 pts)
    if (statusCode === 200 && !isNoIndex && !isRobotsBlocked && !isRedirect) {
        breakdown.technicalIndexability = 20;
    } else {
        suggestions.push('Ensure HTTP status is 200, indexable, and not blocked by robots or redirecting.');
    }

    // 2. Canonical & URL Integrity (15 pts)
    if (canonical && canonical.startsWith('https://') && !canonicalMismatch) {
        breakdown.canonicalIntegrity = 15;
    } else {
        suggestions.push('Ensure a valid, self-referencing HTTPS canonical URL is declared.');
    }

    // 3. Metadata (15 pts)
    let metaPts = 0;
    if (title && title.length >= 30 && title.length <= 60) metaPts += 8;
    else if (title) { metaPts += 4; suggestions.push('Optimize page title length (30-60 chars).'); }
    else suggestions.push('Add page title tag.');

    if (description && description.length >= 70 && description.length <= 160) metaPts += 7;
    else if (description) { metaPts += 3; suggestions.push('Optimize meta description length (70-160 chars).'); }
    else suggestions.push('Add meta description.');

    breakdown.metadata = metaPts;

    // 4. Content Quality & Uniqueness (15 pts)
    if (wordCount >= 300 && h1Count === 1) {
        breakdown.contentQuality = 15;
    } else if (wordCount >= 150) {
        breakdown.contentQuality = 8;
        suggestions.push('Expand content quality (target 300+ words).');
    } else {
        suggestions.push('Avoid thin content; provide descriptive entity information.');
    }

    // 5. Structured Data (10 pts)
    if (hasSchema) {
        breakdown.structuredData = 10;
    } else {
        suggestions.push('Add verified JSON-LD structured data (Service / LocalBusiness / FAQ / Organization).');
    }

    // 6. Internal Linking (10 pts)
    if (internalLinksCount >= 3) {
        breakdown.internalLinking = 10;
    } else {
        suggestions.push('Include at least 3 relevant internal links.');
    }

    // 7. Images & Open Graph (5 pts)
    let imgPts = 0;
    if (hasOgImage) imgPts += 3;
    if (totalImagesCount === 0 || imagesWithAltCount >= totalImagesCount * 0.8) imgPts += 2;
    breakdown.imagesAndOg = imgPts;
    if (!hasOgImage) suggestions.push('Add Open Graph share image (og:image).');

    // 8. Performance (5 pts)
    if (performanceMs <= 300) {
        breakdown.performance = 5;
    } else if (performanceMs <= 800) {
        breakdown.performance = 3;
    }

    // 9. Local / Entity Relevance (5 pts)
    if (cityRelevance) {
        breakdown.localRelevance = 5;
    }

    let calculatedScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

    // Hard Cap Rule for Critical Failures
    if (criticalFailures.length > 0) {
        calculatedScore = Math.min(49, calculatedScore);
    }

    let scoreBand = 'Critical';
    if (calculatedScore >= 90) scoreBand = '90–100: Excellent';
    else if (calculatedScore >= 80) scoreBand = '80–89: Good, minor improvements';
    else if (calculatedScore >= 70) scoreBand = '70–79: Needs improvement';
    else if (calculatedScore >= 50) scoreBand = '50–69: Poor';

    return {
        overallScore: calculatedScore,
        scoreBand,
        isEligibleFor90Plus: calculatedScore >= 90 && criticalFailures.length === 0,
        criticalFailures,
        breakdown,
        suggestions
    };
}

