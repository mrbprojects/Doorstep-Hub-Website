import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('ReligiousLandingHero Component & Assets Test Suite', () => {
  const publicReligiousDir = path.resolve(process.cwd(), 'public/religious');
  const heroComponentPath = path.resolve(process.cwd(), 'app/components/religious/ReligiousLandingHero.jsx');
  const landingPagePath = path.resolve(process.cwd(), 'app/religious-services/page.jsx');

  describe('1. Asset Verification', () => {
    it('ensures clean temple sunset background asset exists', () => {
      const bgPath = path.join(publicReligiousDir, 'hero-temple-bg.webp');
      assert.strictEqual(fs.existsSync(bgPath), true, 'hero-temple-bg.webp must exist in public/religious/');
      const stats = fs.statSync(bgPath);
      assert.ok(stats.size > 10000, 'Temple background asset size should be > 10KB');
    });

    it('ensures transparent foreground Kalash & thali asset exists', () => {
      const kalashPath = path.join(publicReligiousDir, 'hero-kalash-thali.webp');
      assert.strictEqual(fs.existsSync(kalashPath), true, 'hero-kalash-thali.webp must exist in public/religious/');
      const stats = fs.statSync(kalashPath);
      assert.ok(stats.size > 50000, 'Kalash asset size should be > 50KB');
    });
  });

  describe('2. Component Contract & Structure', () => {
    it('verifies ReligiousLandingHero component file exists and is valid JSX', () => {
      assert.strictEqual(fs.existsSync(heroComponentPath), true, 'ReligiousLandingHero.jsx must exist');
      const content = fs.readFileSync(heroComponentPath, 'utf8');
      assert.ok(content.includes('use client'), 'Hero must be a client component');
      assert.ok(content.includes('ReligiousLandingHero'), 'Hero must export ReligiousLandingHero');
    });

    it('verifies two-line headline and trust badge copy match approved design reference', () => {
      const content = fs.readFileSync(heroComponentPath, 'utf8');
      assert.ok(content.includes('Trusted by 50,000+ Devotees'), 'Trust badge text must match reference');
      assert.ok(content.includes('Book Trusted Religious &'), 'First line of headline must match reference');
      assert.ok(content.includes('Spiritual Services'), 'Second line of headline must match reference');
      assert.ok(
        content.includes('Discover and book authentic poojas, homams, rituals and Vedic ceremonies from verified priests at your doorstep.'),
        'Subtitle copy must match reference'
      );
    });

    it('verifies 8 sacred category tiles are present with exact reference titles', () => {
      const content = fs.readFileSync(heroComponentPath, 'utf8');
      const expectedTiles = [
        'Astrology Consultation',
        'Daily Poojas',
        'Death & Rituals',
        'Dosham Remedies',
        'Festival Poojas',
        'Homams',
        'Education & Career',
        'All Services'
      ];

      for (const title of expectedTiles) {
        assert.ok(content.includes(title), `Tile title "${title}" must be present in ReligiousLandingHero`);
      }
    });

    it('verifies floating 4-item trust strip contains exact reference items', () => {
      const content = fs.readFileSync(heroComponentPath, 'utf8');
      const expectedTrustPoints = [
        'Verified Priests',
        'Authentic Vedic Rituals',
        'At Your Doorstep',
        'Instant Booking'
      ];

      for (const point of expectedTrustPoints) {
        assert.ok(content.includes(point), `Trust point "${point}" must be present in trust strip`);
      }
    });

    it('verifies search bar with placeholder and search action button is integrated', () => {
      const content = fs.readFileSync(heroComponentPath, 'utf8');
      assert.ok(content.includes('Search for pooja, homam, ritual or service...'), 'Search input placeholder must match reference');
      assert.ok(content.includes('handleSearchSubmit'), 'Hero must have handleSearchSubmit');
      assert.ok(content.includes('/religious-services/all-services?search='), 'Search must route to all-services query');
    });

    it('verifies devotional ornaments: hanging diyas, arch finial, and lotus divider', () => {
      const content = fs.readFileSync(heroComponentPath, 'utf8');
      assert.ok(content.includes('HangingDiya'), 'Hero must render hanging diyas with chains');
      assert.ok(content.includes('CornerMangoLeaves'), 'Hero must render corner mango leaves');
      assert.ok(content.includes('LotusOrnamentalDivider'), 'Hero must render gold lotus divider');
      assert.ok(content.includes('ArchLotusFinial'), 'Hero must render arch lotus finial on category panel');
    });
  });

  describe('3. Landing Page Integration Contract', () => {
    it('verifies app/religious-services/page.jsx imports and mounts ReligiousLandingHero', () => {
      const content = fs.readFileSync(landingPagePath, 'utf8');
      assert.ok(content.includes('ReligiousLandingHero'), 'page.jsx must import ReligiousLandingHero');
      assert.ok(content.includes('<ReligiousLandingHero'), 'page.jsx must render <ReligiousLandingHero');
      assert.ok(content.includes('id="sacred-categories"'), 'Sacred categories anchor must remain intact below hero');
    });
  });
});
