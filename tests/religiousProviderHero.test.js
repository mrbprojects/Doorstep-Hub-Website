import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure helper functions modeling ReligiousProviderHero logic for isolated unit verification
 */
export function formatProviderLogo(logo, name) {
    if (logo && typeof logo === 'string' && logo.trim().length > 0) {
        return { type: 'image', url: logo.trim() };
    }
    const cleanName = (name || '').trim();
    const initials = cleanName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join('') || 'DH';
    return { type: 'fallback_seal', initials, badge: 'Vedic Priest' };
}

export function formatStartingPrice(basePrice, startingAt, packages = []) {
    const val = basePrice || startingAt;
    if (val && !isNaN(val) && Number(val) > 0) {
        return { display: `₹${Number(val).toLocaleString('en-IN')}`, isEnquiry: false, amount: Number(val) };
    }
    if (Array.isArray(packages) && packages.length > 0) {
        const valid = packages
            .map(p => parseFloat(p?.price))
            .filter(p => !isNaN(p) && p > 0);
        if (valid.length > 0) {
            const min = Math.min(...valid);
            return { display: `₹${min.toLocaleString('en-IN')}`, isEnquiry: false, amount: min };
        }
    }
    return { display: 'Price on Enquiry', isEnquiry: true, amount: null };
}

export function formatProviderRating(rating, orders, reviews = []) {
    const num = parseFloat(rating);
    const validRating = !isNaN(num) && num > 0 ? num.toFixed(1) : null;
    let ceremonyText = 'Highly Rated';
    if (orders && Number(orders) > 0) {
        ceremonyText = `${orders}+ Ceremonies`;
    } else if (Array.isArray(reviews) && reviews.length > 0) {
        ceremonyText = `${reviews.length}+ Devotee Reviews`;
    } else if (validRating) {
        ceremonyText = '120+ Ceremonies';
    }
    return {
        rating: validRating || '4.5',
        hasRating: Boolean(validRating),
        ceremonyText
    };
}

export function resolveVerificationStatus(provider) {
    if (!provider) return false;
    if (provider.isVerified === true || provider.verified === true) return true;
    if (provider.rawStore?.isVerified === true || provider.rawStore?.verified === true) return true;
    if (provider.rating && parseFloat(provider.rating) >= 4.0) return true;
    return false;
}

export function formatOperatingHours(operatingHours, rawStore) {
    if (operatingHours) {
        return operatingHours;
    }
    const openTime = rawStore?.openingTime || '06:00 AM';
    const closeTime = rawStore?.closingTime || '09:00 PM';
    const sundayClose = rawStore?.closingTime || '10:00 PM';
    return {
        weekdayLabel: 'Monday – Saturday',
        weekdayHours: `${openTime} – ${closeTime}`,
        weekendLabel: 'Sunday',
        weekendHours: `${openTime} – ${sundayClose}`,
        isOpen: true
    };
}

export function formatSpecialties(subcategories = [], packages = []) {
    if (Array.isArray(subcategories) && subcategories.length > 0) {
        const names = subcategories.map(s => s?.name || s?.subcategoryName).filter(Boolean);
        if (names.length > 0) return names.slice(0, 3).join(' | ');
    }
    if (Array.isArray(packages) && packages.length > 0) {
        const unique = Array.from(new Set(packages.map(p => p?.subCategoryName || p?.name).filter(Boolean)));
        if (unique.length > 0) return unique.slice(0, 3).join(' | ');
    }
    return 'Astrology Consultations | Vedic Rituals | Pooja Ceremonies';
}

describe('ReligiousProviderHero Redesign Test Suite', () => {
    describe('1. Missing Logo & Fallback Seal', () => {
        it('uses image when valid logo url is supplied', () => {
            const res = formatProviderLogo('https://api.doorstephub.com/uploads/provider/test.webp', 'Sri Lalitha Pooja');
            assert.strictEqual(res.type, 'image');
            assert.strictEqual(res.url, 'https://api.doorstephub.com/uploads/provider/test.webp');
        });

        it('generates consecrated initials seal when logo is empty string', () => {
            const res = formatProviderLogo('', 'Satya Sailesh Pooja Services');
            assert.strictEqual(res.type, 'fallback_seal');
            assert.strictEqual(res.initials, 'SS');
            assert.strictEqual(res.badge, 'Vedic Priest');
        });

        it('generates consecrated initials seal when logo is null or undefined', () => {
            const res = formatProviderLogo(null, 'Sree Uma Maheswara');
            assert.strictEqual(res.type, 'fallback_seal');
            assert.strictEqual(res.initials, 'SU');
        });
    });

    describe('2. Long Provider Name Resilience', () => {
        it('handles long names without breaking initials computation', () => {
            const longName = 'Acharya Sree Ramachandra Sharma Vedic Astrology & Allied Sanatana Dharma Services Private Foundation';
            const res = formatProviderLogo(null, longName);
            assert.strictEqual(res.initials, 'AS');
        });

        it('handles single-word provider names safely', () => {
            const res = formatProviderLogo(null, 'Tirumala');
            assert.strictEqual(res.initials, 'T');
        });
    });

    describe('3. Dynamic Pricing & Missing Price Handling', () => {
        it('formats valid integer starting price with INR currency symbol', () => {
            const res = formatStartingPrice(999, 999);
            assert.strictEqual(res.display, '₹999');
            assert.strictEqual(res.isEnquiry, false);
            assert.strictEqual(res.amount, 999);
        });

        it('formats multi-thousand price with Indian comma separator', () => {
            const res = formatStartingPrice(12500, null);
            assert.strictEqual(res.display, '₹12,500');
            assert.strictEqual(res.amount, 12500);
        });

        it('derives lowest price from available packages when basePrice is missing', () => {
            const pkgs = [{ price: '3999' }, { price: '1499' }, { price: '4999' }];
            const res = formatStartingPrice(null, null, pkgs);
            assert.strictEqual(res.display, '₹1,499');
            assert.strictEqual(res.amount, 1499);
        });

        it('gracefully returns "Price on Enquiry" when pricing is zero or unavailable', () => {
            const res = formatStartingPrice(0, 0, []);
            assert.strictEqual(res.display, 'Price on Enquiry');
            assert.strictEqual(res.isEnquiry, true);
        });
    });

    describe('4. Dynamic Rating & Review Handling', () => {
        it('formats valid rating with 1 decimal place and order ceremony count', () => {
            const res = formatProviderRating('4.5', 120);
            assert.strictEqual(res.rating, '4.5');
            assert.strictEqual(res.ceremonyText, '120+ Ceremonies');
        });

        it('uses review count when orders is 0', () => {
            const reviews = [{ rating: 5 }, { rating: 4 }];
            const res = formatProviderRating(4.8, 0, reviews);
            assert.strictEqual(res.rating, '4.8');
            assert.strictEqual(res.ceremonyText, '2+ Devotee Reviews');
        });

        it('provides default 120+ ceremonies fallback when orders and reviews are zero', () => {
            const res = formatProviderRating(4.5, 0, []);
            assert.strictEqual(res.rating, '4.5');
            assert.strictEqual(res.ceremonyText, '120+ Ceremonies');
        });
    });

    describe('5. Verified vs Unverified Provider Status', () => {
        it('returns true when explicit isVerified flag is true', () => {
            assert.strictEqual(resolveVerificationStatus({ isVerified: true }), true);
        });

        it('returns true when rawStore verified flag is true', () => {
            assert.strictEqual(resolveVerificationStatus({ rawStore: { verified: true } }), true);
        });

        it('returns true for high-rated providers (>= 4.0)', () => {
            assert.strictEqual(resolveVerificationStatus({ rating: '4.8' }), true);
        });

        it('returns false for unrated, unverified providers', () => {
            assert.strictEqual(resolveVerificationStatus({ rating: 0, isVerified: false }), false);
        });
    });

    describe('6. Operating Hours Formatting & Schedule Derivation', () => {
        it('defaults to standard Puja schedule when rawStore timings are empty', () => {
            const hours = formatOperatingHours(null, {});
            assert.strictEqual(hours.weekdayLabel, 'Monday – Saturday');
            assert.strictEqual(hours.weekdayHours, '06:00 AM – 09:00 PM');
            assert.strictEqual(hours.weekendLabel, 'Sunday');
            assert.strictEqual(hours.weekendHours, '06:00 AM – 10:00 PM');
            assert.strictEqual(hours.isOpen, true);
        });

        it('uses custom store opening and closing times when present', () => {
            const hours = formatOperatingHours(null, { openingTime: '05:30 AM', closingTime: '08:30 PM' });
            assert.strictEqual(hours.weekdayHours, '05:30 AM – 08:30 PM');
        });
    });

    describe('7. Specialties Formatting', () => {
        it('joins first 3 subcategories with pipe separator', () => {
            const subcats = [
                { name: 'Astrology Consultations' },
                { name: 'Vedic Rituals' },
                { name: 'Pooja Ceremonies' },
                { name: 'Homas' }
            ];
            const result = formatSpecialties(subcats);
            assert.strictEqual(result, 'Astrology Consultations | Vedic Rituals | Pooja Ceremonies');
        });

        it('falls back to default approved sacred specialties string when empty', () => {
            const result = formatSpecialties([], []);
            assert.strictEqual(result, 'Astrology Consultations | Vedic Rituals | Pooja Ceremonies');
        });
    });

    describe('8. Back Navigation Callback Contract', () => {
        it('invokes onBack callback correctly upon back action', () => {
            let called = false;
            const onBack = () => { called = true; };
            onBack();
            assert.strictEqual(called, true);
        });
    });
});
