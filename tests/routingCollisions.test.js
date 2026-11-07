import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    isApplianceCategorySlug,
    isValidCitySlug,
    isKnownCitySlug,
    isBookNowFlatServiceSlug,
    parseBookNowCityFlatPath,
    resolveBookNowCityFlatRewrite,
    resolveApplianceRepairFlatPath,
    resolveApplianceCategoryCityFlatPath,
    resolveFlatBrandCityRewritePath,
    resolveNearbyBookNowRewrite,
    parseNearbyBookNowPath,
    RESERVED_CITY_SLUGS,
    KNOWN_CITIES
} from '../app/lib/applianceRepairSlugs.js';

describe('Routing Collision Prevention & Precedence Audit (Task 2)', () => {

    describe('1. Category Slugs vs Bookable Services', () => {
        const applianceCategories = [
            'ac-repair-services',
            'washing-machine-repair-services',
            'refrigerator-repair-services',
            'tv-repair-services',
            'computer-repair-services',
            'water-purifier-repair-services',
            'geyser-repair-services',
            'microwave-repair-services',
            'appliance-repair-services',
            'appliances-repair-services'
        ];

        for (const cat of applianceCategories) {
            it(`should recognize "${cat}" as an appliance category`, () => {
                assert.strictEqual(isApplianceCategorySlug(cat), true);
            });

            it(`should NEVER classify category "${cat}" as an individual bookable service`, () => {
                assert.strictEqual(isBookNowFlatServiceSlug(cat), false);
            });
        }
    });

    describe('2. Sub-service Slugs vs Legitimate Cities', () => {
        const subServiceSlugs = [
            'ac-installation-services',
            'ac-gas-leak-repair',
            'desktop-pc-repair-services',
            'laptop-screen-replacement',
            'double-door-refrigerator-repair',
            'single-door-refrigerator-repair',
            'front-load-washing-machine-repair',
            'top-load-washing-machine-repair',
            'led-tv-repair',
            'geyser-installation-services'
        ];

        for (const sub of subServiceSlugs) {
            it(`should NEVER classify sub-service "${sub}" as a valid city`, () => {
                assert.strictEqual(isValidCitySlug(sub), false);
                assert.strictEqual(isKnownCitySlug(sub), false);
            });
        }

        const validCities = [
            'hyderabad', 'bangalore', 'bengaluru', 'mumbai', 'chennai',
            'vijayawada', 'pune', 'delhi', 'vizag', 'visakhapatnam',
            'tirupati', 'ahmedabad', 'coimbatore', 'kochi', 'khammam', 'guntur'
        ];

        for (const city of validCities) {
            it(`should recognize legitimate operating city "${city}"`, () => {
                assert.strictEqual(isKnownCitySlug(city), true);
                assert.strictEqual(isValidCitySlug(city), true);
            });
        }
    });

    describe('3. Two-Segment Routing Collision Prevention', () => {
        it('prevents 2-segment category/subservice URLs from being hijacked into /book-now/', () => {
            const twoSegmentPaths = [
                'ac-repair-services/ac-installation-services',
                'computer-repair-services/desktop-pc-repair-services',
                'refrigerator-repair-services/double-door-refrigerator-repair',
                'washing-machine-repair-services/front-load-washing-machine-repair',
                'tv-repair-services/led-tv-screen-repair'
            ];

            for (const p of twoSegmentPaths) {
                const parsed = parseBookNowCityFlatPath(p);
                assert.strictEqual(parsed, null, `Path "${p}" must NOT match book-now flat parser`);
                const rewrite = resolveBookNowCityFlatRewrite(p);
                assert.strictEqual(rewrite, null, `Path "${p}" must NOT resolve to book-now rewrite`);
            }
        });

        it('correctly parses legitimate legacy service + city paths', () => {
            const validLegacyPaths = [
                { path: 'split-ac-repair-service/hyderabad', expectedService: 'split-ac-repair-service', expectedCity: 'hyderabad' },
                { path: 'book-washing-machine-repair/bangalore', expectedService: 'book-washing-machine-repair', expectedCity: 'bangalore' },
                { path: 'microwave-oven-repair-services/mumbai', expectedService: 'microwave-oven-repair-services', expectedCity: 'mumbai' }
            ];

            for (const { path, expectedService, expectedCity } of validLegacyPaths) {
                const parsed = parseBookNowCityFlatPath(path);
                assert.ok(parsed, `Path "${path}" should match book-now flat parser`);
                assert.strictEqual(parsed.serviceSlug, expectedService);
                assert.strictEqual(parsed.citySlug, expectedCity);

                const rewrite = resolveBookNowCityFlatRewrite(path);
                assert.ok(rewrite);
                assert.strictEqual(rewrite.pathname, `/book-now/${expectedService}`);
                assert.strictEqual(rewrite.search, `?city=${encodeURIComponent(expectedCity)}`);
            }
        });
    });

    describe('4. Canonical Precedence: Nearby Book-Now, Flat City, Brand & Reserved Routes', () => {
        it('resolves canonical /nearby/{service}/{city} paths without collision', () => {
            const parsed = parseNearbyBookNowPath('nearby/split-ac-gas-filling/hyderabad');
            assert.ok(parsed);
            assert.strictEqual(parsed.serviceSlug, 'split-ac-gas-filling');
            assert.strictEqual(parsed.citySlug, 'hyderabad');

            const rewrite = resolveNearbyBookNowRewrite('nearby/split-ac-gas-filling/hyderabad');
            assert.ok(rewrite);
            assert.strictEqual(rewrite.pathname, '/book-now/split-ac-gas-filling');
            assert.strictEqual(rewrite.search, '?city=hyderabad');
        });

        it('resolves flat city landing pages correctly', () => {
            const path = resolveApplianceRepairFlatPath('appliances-repair-service-center-hyderabad');
            assert.strictEqual(path, '/appliances/repair-service/hyderabad');
        });

        it('resolves category + city brand selection flat URLs correctly', () => {
            const path = resolveApplianceCategoryCityFlatPath('ac-repair-service-center-mumbai');
            assert.strictEqual(path, '/appliances/repair-service/mumbai/ac-repair-services');
        });

        it('resolves flat brand URLs correctly', () => {
            const path = resolveFlatBrandCityRewritePath('realme-tv-repair-service-center/mumbai');
            assert.strictEqual(path, '/appliances/repair-service/mumbai/brand/realme-tv-repair-service-center');
        });

        it('rejects unknown or invalid URLs from matching book-now or city rewrites', () => {
            assert.strictEqual(parseBookNowCityFlatPath('fake-category/unknown-child'), null);
            assert.strictEqual(parseBookNowCityFlatPath('non-existent-action/random-word'), null);
            assert.strictEqual(resolveApplianceRepairFlatPath('appliances-repair-service-center-invalid*city'), null);
            assert.strictEqual(resolveApplianceCategoryCityFlatPath('invalid-category-service-center-hyderabad'), null);
        });
    });
});
