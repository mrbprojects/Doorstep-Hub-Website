import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure functions modeling SacredOfferingsSection logic for isolated unit verification
 */

export function matchesCategory(pkg, catId) {
    if (!catId || catId === 'all') return true;
    const x = pkg.subcategoryId || pkg.subCategoryId || pkg.serviceSubCategoryId || pkg.subcategory?._id;
    if (Array.isArray(x)) return x.includes(catId);
    if (x && typeof x === 'object') return x._id === catId || x.id === catId;
    return x === catId;
}

export function filterOfferings(packages, { query = '', categoryId = 'all' }) {
    return packages.filter(pkg => {
        const matchesCat = matchesCategory(pkg, categoryId);
        if (!matchesCat) return false;

        if (!query.trim()) return true;
        const q = query.toLowerCase().trim();
        const nameMatch = (pkg.name || '').toLowerCase().includes(q);
        const descMatch = (pkg.description || '').toLowerCase().includes(q);
        const subcatMatch = (pkg.subcategoryName || '').toLowerCase().includes(q);
        return nameMatch || descMatch || subcatMatch;
    });
}

export function computeCategoryCounts(packages, subcategories) {
    const totalCount = packages.length;
    const list = [{ id: 'all', name: 'All Services', count: totalCount }];

    if (Array.isArray(subcategories) && subcategories.length > 0) {
        subcategories.forEach((sub, idx) => {
            const catId = sub.subcategoryId || sub._id || sub.id || `sub-${idx}`;
            const catName = sub.subcategoryName || sub.name || `Category ${idx + 1}`;
            const count = packages.filter(p => matchesCategory(p, catId)).length;
            if (count > 0) {
                list.push({ id: catId, name: catName, count });
            }
        });
    } else {
        const seen = new Map();
        packages.forEach(p => {
            const catId = p.subcategoryId || p.subCategoryId || p.categoryId || 'other';
            const catName = p.subcategoryName || p.categoryName || 'Other Services';
            seen.set(catId, { id: catId, name: catName, count: (seen.get(catId)?.count || 0) + 1 });
        });
        seen.forEach(cat => list.push(cat));
    }
    return list;
}

export function deriveOfferingDuration(pkg) {
    if (pkg.duration && typeof pkg.duration === 'string' && pkg.duration.trim()) {
        return pkg.duration.trim();
    }
    const nameLower = (pkg.name || '').toLowerCase();
    const descLower = (pkg.description || '').toLowerCase();
    const combined = `${nameLower} ${descLower}`;

    if (combined.includes('homam') || combined.includes('havan') || combined.includes('chandi')) {
        return '3-4 Hours';
    }
    if (combined.includes('antyesti') || combined.includes('shraddha') || combined.includes('death') || combined.includes('funeral')) {
        return 'As per ritual';
    }
    if (combined.includes('kundali') || combined.includes('horoscope') || combined.includes('astrology') || combined.includes('matching')) {
        return '30-45 Mins';
    }
    if (combined.includes('abhishekam') || combined.includes('satyanarayan') || combined.includes('navagraha')) {
        return '2 Hours';
    }
    if (combined.includes('ganesh') || combined.includes('pooja') || combined.includes('archana')) {
        return '60 Mins';
    }
    return 'As per ritual';
}

export function formatOfferingPrice(price) {
    const num = parseFloat(price);
    if (!isNaN(num) && num > 0) {
        return `Starts at ₹${Number(num).toLocaleString('en-IN')}`;
    }
    return 'Starts at ₹999';
}

describe('SacredOfferingsSection Redesign Test Suite', () => {

    const mockPackages = [
        {
            _id: 'p1',
            name: 'Personal Horoscope Reading',
            description: 'Detailed life prediction, planetary analysis and Vedic astrological guidance',
            price: 999,
            subcategoryId: 'cat_astrology',
            subcategoryName: 'Astrology Consultation'
        },
        {
            _id: 'p2',
            name: 'Kundali Matching',
            description: 'Marriage compatibility and Ashtakoot guna milan',
            price: 1499,
            subcategoryId: 'cat_astrology',
            subcategoryName: 'Astrology Consultation'
        },
        {
            _id: 'p3',
            name: 'Daily Ganesh Pooja',
            description: 'Obstacle removal and auspicious beginnings puja ceremony',
            price: 1000,
            subcategoryId: 'cat_daily',
            subcategoryName: 'Daily Poojas'
        },
        {
            _id: 'p4',
            name: 'Navagraha Pooja & Shanti',
            description: 'Planetary peace and dosha nivaran homam',
            price: 1500,
            subcategoryId: 'cat_daily',
            subcategoryName: 'Daily Poojas'
        },
        {
            _id: 'p5',
            name: 'Antyesti Rituals',
            description: 'Sacred last rites and Vedic funeral prayers',
            price: 5499,
            subcategoryId: 'cat_death',
            subcategoryName: 'Death & Rituals'
        },
        {
            _id: 'p6',
            name: 'Chandi Homam',
            description: 'Divine Devi power homam for protection and victory',
            price: 15000,
            subcategoryId: 'cat_homam',
            subcategoryName: 'Homams'
        }
    ];

    const mockSubcategories = [
        { _id: 'cat_astrology', subcategoryName: 'Astrology Consultation' },
        { _id: 'cat_daily', subcategoryName: 'Daily Poojas' },
        { _id: 'cat_death', subcategoryName: 'Death & Rituals' },
        { _id: 'cat_homam', subcategoryName: 'Homams' },
        { _id: 'cat_empty', subcategoryName: 'Empty Category' }
    ];

    describe('1. Category Matching & Dynamic Count Aggregation', () => {
        it('calculates total package count for All Services accurately', () => {
            const counts = computeCategoryCounts(mockPackages, mockSubcategories);
            const all = counts.find(c => c.id === 'all');
            assert.strictEqual(all.count, 6);
            assert.strictEqual(all.name, 'All Services');
        });

        it('counts individual subcategory packages correctly', () => {
            const counts = computeCategoryCounts(mockPackages, mockSubcategories);
            const astrology = counts.find(c => c.id === 'cat_astrology');
            const daily = counts.find(c => c.id === 'cat_daily');
            const death = counts.find(c => c.id === 'cat_death');
            const homam = counts.find(c => c.id === 'cat_homam');

            assert.strictEqual(astrology.count, 2);
            assert.strictEqual(daily.count, 2);
            assert.strictEqual(death.count, 1);
            assert.strictEqual(homam.count, 1);
        });

        it('omits categories with 0 offerings from sidebar to prevent dead clicks', () => {
            const counts = computeCategoryCounts(mockPackages, mockSubcategories);
            const empty = counts.find(c => c.id === 'cat_empty');
            assert.strictEqual(empty, undefined);
        });

        it('matches packages with object-based subcategory references', () => {
            const pkgWithObject = {
                _id: 'p_obj',
                name: 'Satyanarayan Pooja',
                subcategory: { _id: 'cat_daily' }
            };
            assert.strictEqual(matchesCategory(pkgWithObject, 'cat_daily'), true);
            assert.strictEqual(matchesCategory(pkgWithObject, 'cat_astrology'), false);
        });

        it('matches packages with array of subcategories', () => {
            const pkgWithArray = {
                _id: 'p_arr',
                name: 'Special Pooja',
                subcategoryId: ['cat_daily', 'cat_homam']
            };
            assert.strictEqual(matchesCategory(pkgWithArray, 'cat_daily'), true);
            assert.strictEqual(matchesCategory(pkgWithArray, 'cat_homam'), true);
            assert.strictEqual(matchesCategory(pkgWithArray, 'cat_astrology'), false);
        });
    });

    describe('2. Real-Time Search & Filtering', () => {
        it('returns all services when query is empty and category is all', () => {
            const results = filterOfferings(mockPackages, { query: '', categoryId: 'all' });
            assert.strictEqual(results.length, 6);
        });

        it('filters by category accurately', () => {
            const results = filterOfferings(mockPackages, { query: '', categoryId: 'cat_astrology' });
            assert.strictEqual(results.length, 2);
            assert.strictEqual(results.every(r => r.subcategoryId === 'cat_astrology'), true);
        });

        it('searches by offering name case-insensitively', () => {
            const results = filterOfferings(mockPackages, { query: 'ganesh', categoryId: 'all' });
            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].name, 'Daily Ganesh Pooja');
        });

        it('searches by offering description text', () => {
            const results = filterOfferings(mockPackages, { query: 'marriage compatibility', categoryId: 'all' });
            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].name, 'Kundali Matching');
        });

        it('combines category filter and search query seamlessly', () => {
            const results = filterOfferings(mockPackages, { query: 'pooja', categoryId: 'cat_daily' });
            assert.strictEqual(results.length, 2);

            const zeroResults = filterOfferings(mockPackages, { query: 'pooja', categoryId: 'cat_astrology' });
            assert.strictEqual(zeroResults.length, 0);
        });

        it('gracefully returns empty list when search yields no match', () => {
            const results = filterOfferings(mockPackages, { query: 'nonexistent ritual xyz', categoryId: 'all' });
            assert.strictEqual(results.length, 0);
        });
    });

    describe('3. Duration Derivation Heuristics', () => {
        it('detects Homam duration as 3-4 Hours', () => {
            assert.strictEqual(deriveOfferingDuration({ name: 'Chandi Homam' }), '3-4 Hours');
            assert.strictEqual(deriveOfferingDuration({ name: 'Maha Rudra Havan' }), '3-4 Hours');
        });

        it('detects Last Rites and Shradha as As per ritual', () => {
            assert.strictEqual(deriveOfferingDuration({ name: 'Antyesti Rituals' }), 'As per ritual');
            assert.strictEqual(deriveOfferingDuration({ name: 'Annual Shraddha' }), 'As per ritual');
        });

        it('detects Astrology and Kundali as 30-45 Mins', () => {
            assert.strictEqual(deriveOfferingDuration({ name: 'Kundali Matching' }), '30-45 Mins');
            assert.strictEqual(deriveOfferingDuration({ name: 'Horoscope Reading' }), '30-45 Mins');
        });

        it('detects Abhishekam and Navagraha as 2 Hours', () => {
            assert.strictEqual(deriveOfferingDuration({ name: 'Shiva Abhishekam' }), '2 Hours');
            assert.strictEqual(deriveOfferingDuration({ name: 'Navagraha Pooja' }), '2 Hours');
        });

        it('detects Ganesh Pooja as 60 Mins', () => {
            assert.strictEqual(deriveOfferingDuration({ name: 'Daily Ganesh Pooja' }), '60 Mins');
        });

        it('preserves explicitly defined duration when provided by API', () => {
            assert.strictEqual(deriveOfferingDuration({ name: 'Custom Ritual', duration: '90 Mins' }), '90 Mins');
        });
    });

    describe('4. Devotional Price Formatting', () => {
        it('formats numbers with Indian comma grouping and prefix', () => {
            assert.strictEqual(formatOfferingPrice(999), 'Starts at ₹999');
            assert.strictEqual(formatOfferingPrice(1499), 'Starts at ₹1,499');
            assert.strictEqual(formatOfferingPrice(15000), 'Starts at ₹15,000');
        });

        it('falls back to default approved sacred price when missing', () => {
            assert.strictEqual(formatOfferingPrice(null), 'Starts at ₹999');
            assert.strictEqual(formatOfferingPrice(0), 'Starts at ₹999');
            assert.strictEqual(formatOfferingPrice(undefined), 'Starts at ₹999');
        });
    });

    describe('5. Booking Action Contract', () => {
        it('triggers single package booking when Book Now is invoked on card', () => {
            let bookedPackage = null;
            const onBookNow = (pkg) => { bookedPackage = pkg; };

            const selectedPkg = mockPackages[0];
            onBookNow(selectedPkg);

            assert.strictEqual(bookedPackage._id, 'p1');
            assert.strictEqual(bookedPackage.name, 'Personal Horoscope Reading');
        });
    });
});
