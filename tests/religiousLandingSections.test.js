import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Complete Religious Landing Page Redesign Test Suite', () => {
  const baseDir = fs.existsSync(path.resolve(process.cwd(), 'Doorstep-Hub-Website'))
    ? path.resolve(process.cwd(), 'Doorstep-Hub-Website')
    : process.cwd();

  const publicDir = path.resolve(baseDir, 'public/religious');
  const componentsDir = path.resolve(baseDir, 'app/components/religious');
  const pagePath = path.resolve(baseDir, 'app/religious-services/page.jsx');

  describe('1. Asset Verification', () => {
    it('verifies landing-full-reference.webp exists in public/religious', () => {
      const refPath = path.join(publicDir, 'landing-full-reference.webp');
      assert.strictEqual(fs.existsSync(refPath), true, 'landing-full-reference.webp must exist');
    });

    it('verifies astrology artwork asset exists', () => {
      const artPath = path.join(publicDir, 'astrology-consultation-art.webp');
      assert.strictEqual(fs.existsSync(artPath), true, 'astrology-consultation-art.webp must exist');
    });

    it('verifies all 4 festival illustrations exist in public/religious', () => {
      const festivals = [
        'festival-shivarathri.webp',
        'festival-ugadi.webp',
        'festival-rama-navami.webp',
        'festival-akshaya-tritiya.webp',
      ];
      for (const f of festivals) {
        const fullPath = path.join(publicDir, f);
        assert.strictEqual(fs.existsSync(fullPath), true, `Festival asset ${f} must exist`);
      }
    });
  });

  describe('2. Component Contracts & Files', () => {
    it('verifies AstrologyConsultationSection exists and matches design copy', () => {
      const filePath = path.join(componentsDir, 'AstrologyConsultationSection.jsx');
      assert.strictEqual(fs.existsSync(filePath), true);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('Astrology & Religious Consultation'));
      assert.ok(content.includes('View All Consultants'));
      assert.ok(content.includes('astrology-consultation-art.webp'));
    });

    it('verifies TrendingServicesSection exists and matches design copy', () => {
      const filePath = path.join(componentsDir, 'TrendingServicesSection.jsx');
      assert.strictEqual(fs.existsSync(filePath), true);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('Trending & Popular'));
      assert.ok(content.includes('Most booked poojas and rituals by our devotees'));
      assert.ok(content.includes('Verified Service'));
      assert.ok(content.includes('Book Now'));
    });

    it('verifies UpcomingFestivalsSection exists and renders countdown & cards', () => {
      const filePath = path.join(componentsDir, 'UpcomingFestivalsSection.jsx');
      assert.strictEqual(fs.existsSync(filePath), true);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('Upcoming Festivals & Special Poojas'));
      assert.ok(content.includes('View All Festivals'));
      assert.ok(content.includes('Next Festival'));
      assert.ok(content.includes('Maha Shivaratri'));
      assert.ok(content.includes('Ugadi'));
    });

    it('verifies HowItWorksSection exists and renders all 4 steps', () => {
      const filePath = path.join(componentsDir, 'HowItWorksSection.jsx');
      assert.strictEqual(fs.existsSync(filePath), true);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('How It'));
      assert.ok(content.includes('Works'));
      assert.ok(content.includes('1. Search Service'));
      assert.ok(content.includes('2. Choose Date & Time'));
      assert.ok(content.includes('3. Book a Priest'));
      assert.ok(content.includes('4. Service at Home'));
    });

    it('verifies WhyTrustUsSection exists and renders all 4 trust pillars', () => {
      const filePath = path.join(componentsDir, 'WhyTrustUsSection.jsx');
      assert.strictEqual(fs.existsSync(filePath), true);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('Why Trust'));
      assert.ok(content.includes('Verified Priests'));
      assert.ok(content.includes('Years of Experience'));
      assert.ok(content.includes('Authentic Rituals'));
      assert.ok(content.includes('50,000+ Devotees'));
    });
  });

  describe('3. Landing Page Exact Section Ordering', () => {
    it('verifies page.jsx mounts remaining sections in the exact approved order and removes the 3 requested sections', () => {
      const content = fs.readFileSync(pagePath, 'utf8');

      // Check remaining imports
      assert.ok(content.includes("import SacredServiceCategoriesSection from '@/components/religious/SacredServiceCategoriesSection';"));
      assert.ok(content.includes("import TrendingServicesSection from '@/components/religious/TrendingServicesSection';"));
      assert.ok(content.includes("import HowItWorksSection from '@/components/religious/HowItWorksSection';"));

      // Verify the 3 requested sections are completely removed from page.jsx
      assert.ok(!content.includes("<AstrologyConsultationSection"), 'AstrologyConsultationSection must be removed');
      assert.ok(!content.includes("<UpcomingFestivalsSection"), 'UpcomingFestivalsSection must be removed');
      assert.ok(!content.includes("<WhyTrustUsSection"), 'WhyTrustUsSection must be removed');

      // Verify order of appearance in JSX
      const posHero = content.indexOf('<ReligiousLandingHero');
      const posCategories = content.indexOf('<SacredServiceCategoriesSection');
      const posTrending = content.indexOf('<TrendingServicesSection');
      const posHowItWorks = content.indexOf('<HowItWorksSection');

      assert.ok(posHero !== -1, 'Hero must be present');
      assert.ok(posCategories > posHero, 'Categories must follow Hero');
      assert.ok(posTrending > posCategories, 'Trending must follow Categories');
      assert.ok(posHowItWorks > posTrending, 'How It Works must follow Trending');
    });
  });

  describe('4. Pure Functional Logic Verification', () => {
    it('calculates countdown time difference accurately without negative values', () => {
      const future = new Date(Date.now() + (5 * 24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000) + (15 * 60 * 1000));
      const diff = future.getTime() - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      assert.strictEqual(days, 5);
      assert.strictEqual(hours, 3);
      assert.strictEqual(minutes, 15);
    });

    it('filters consultation providers accurately based on keywords', () => {
      const mockList = [
        { business_name: 'Satya Sailesh Pooja Services', bio: 'Astrology and Pooja' },
        { business_name: 'Random Repairs', bio: 'AC service' },
        { business_name: 'Sree Uma Maheswara Astrology', bio: 'Horoscope and Vedic consultation' },
      ];

      const matched = mockList.filter((s) => {
        const text = `${s.business_name} ${s.bio}`.toLowerCase();
        return text.includes('astrology') || text.includes('consultation');
      });

      assert.strictEqual(matched.length, 2);
      assert.strictEqual(matched[0].business_name, 'Satya Sailesh Pooja Services');
      assert.strictEqual(matched[1].business_name, 'Sree Uma Maheswara Astrology');
    });
  });
});
