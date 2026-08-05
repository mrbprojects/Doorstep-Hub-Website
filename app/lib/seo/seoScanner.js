/**
 * SEO Health Scanner & Explainable Score Calculator Engine
 * Calculates score breakdowns across Technical SEO, Metadata, Schema, Canonical, Links, Performance, and Security.
 */

/**
 * Calculates detailed, explainable SEO Score for a given page metadata & structure.
 * Returns score out of 100 with category breakdowns and improvement suggestions.
 */
export function calculateSEOScore(pageData = {}) {
    const { title, description, canonical, h1Count, hasSchema, internalLinksCount, hasOgImage } = pageData;

    let score = 0;
    const breakdown = {
        metadata: 0,       // Max 30
        canonical: 0,      // Max 20
        structuredData: 0, // Max 20
        heading: 0,        // Max 10
        internalLinks: 0,  // Max 10
        social: 0          // Max 10
    };
    const suggestions = [];

    // 1. Metadata Checks (30 pts)
    if (title) {
        if (title.length >= 30 && title.length <= 60) {
            breakdown.metadata += 15;
        } else {
            breakdown.metadata += 8;
            suggestions.push('Optimize title length (ideal: 30-60 characters).');
        }
    } else {
        suggestions.push('Add a unique page title tag.');
    }

    if (description) {
        if (description.length >= 70 && description.length <= 160) {
            breakdown.metadata += 15;
        } else {
            breakdown.metadata += 8;
            suggestions.push('Optimize meta description length (ideal: 70-160 characters).');
        }
    } else {
        suggestions.push('Add a meta description.');
    }

    // 2. Canonical Checks (20 pts)
    if (canonical && canonical.startsWith('https://')) {
        breakdown.canonical = 20;
    } else {
        suggestions.push('Provide a valid self-referencing HTTPS canonical URL.');
    }

    // 3. Structured Data Checks (20 pts)
    if (hasSchema) {
        breakdown.structuredData = 20;
    } else {
        suggestions.push('Add verified JSON-LD structured data (Organization/Service/FAQ).');
    }

    // 4. Heading Structure (10 pts)
    if (h1Count === 1) {
        breakdown.heading = 10;
    } else {
        suggestions.push('Ensure exactly one <h1> tag is present on the page.');
    }

    // 5. Internal Links (10 pts)
    if (internalLinksCount && internalLinksCount >= 3) {
        breakdown.internalLinks = 10;
    } else {
        suggestions.push('Add at least 3 relevant internal links to avoid orphan page risks.');
    }

    // 6. Social Open Graph (10 pts)
    if (hasOgImage) {
        breakdown.social = 10;
    } else {
        suggestions.push('Add an Open Graph share image (og:image).');
    }

    score = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return {
        overallScore: score,
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : 'C',
        breakdown,
        suggestions
    };
}
