import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Pure logic functions mirroring SacredServiceCategoriesSection
function resolveImage(src) {
  if (!src) return '';
  if (typeof src !== 'string') return '';
  if (src.startsWith('http')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com';
  return `${baseUrl}/${src.replace(/^\//, '')}`;
}

const REFERENCE_FALLBACKS = [
  { keywords: ['astrology', 'jyotish', 'horoscope', 'kundali'], image: '/religious/categories/astrology-consultation.webp' },
  { keywords: ['birth', 'namakaran', 'cradle', 'baby'], image: '/religious/categories/birth-ceremonies.webp' },
  { keywords: ['daily', 'nitya', 'regular'], image: '/religious/categories/daily-poojas.webp' },
  { keywords: ['dosham', 'nivaran', 'shanti', 'remedy', 'remedies', 'graha'], image: '/religious/categories/dosham-remedies.webp' },
  { keywords: ['festival', 'utsav', 'ganesh', 'diwali', 'navratri', 'shiva'], image: '/religious/categories/festival-poojas.webp' },
  { keywords: ['homam', 'havan', 'yagya', 'yagnam'], image: '/religious/categories/homams-dosham-nivaran.webp' },
  { keywords: ['education', 'career', 'vidya', 'saraswati', 'exam'], image: '/religious/categories/education-career.webp' },
  { keywords: ['health', 'ayush', 'dhanvantari', 'mrityunjaya'], image: '/religious/categories/homams-health.webp' },
  { keywords: ['prosperity', 'lakshmi', 'kubera', 'wealth'], image: '/religious/categories/homams-prosperity.webp' },
  { keywords: ['horoscope', 'jathakam', 'chart'], image: '/religious/categories/horoscope-services.webp' },
  { keywords: ['house', 'griha', 'vastu', 'pravesh'], image: '/religious/categories/house-ceremonies.webp' },
  { keywords: ['marriage', 'wedding', 'vivah', 'kalyanam'], image: '/religious/categories/marriage-ceremonies.webp' },
  { keywords: ['muhurtham', 'panchangam', 'timing'], image: '/religious/categories/muhurtham-fixing.webp' },
  { keywords: ['special', 'occasion', 'anniversary'], image: '/religious/categories/special-occasion-poojas.webp' },
  { keywords: ['temple', 'mandir', 'at home'], image: '/religious/categories/temple-style-poojas.webp' },
];

function getCategoryFallbackImage(name = '', slug = '', index = 0) {
  const query = `${name} ${slug}`.toLowerCase();
  for (const item of REFERENCE_FALLBACKS) {
    if (item.keywords.some(kw => query.includes(kw))) {
      return item.image;
    }
  }
  return REFERENCE_FALLBACKS[index % REFERENCE_FALLBACKS.length].image;
}

function filterSubcategories(allSubcats, byCatMap, selectedKey) {
  if (selectedKey === 'all') {
    return allSubcats;
  }
  return byCatMap[selectedKey] || [];
}

describe('SacredServiceCategoriesSection Test Suite', () => {
  const baseDir = fs.existsSync(path.resolve(process.cwd(), 'Doorstep-Hub-Website'))
    ? path.resolve(process.cwd(), 'Doorstep-Hub-Website')
    : process.cwd();

  const publicDir = path.resolve(baseDir, 'public/religious');
  const componentPath = path.resolve(baseDir, 'app/components/religious/SacredServiceCategoriesSection.jsx');
  const pagePath = path.resolve(baseDir, 'app/religious-services/page.jsx');

  describe('1. Asset Verification', () => {
    it('verifies master categories-reference.webp exists in public/religious', () => {
      const refPath = path.join(publicDir, 'categories-reference.webp');
      assert.strictEqual(fs.existsSync(refPath), true, 'categories-reference.webp must exist');
      assert.ok(fs.statSync(refPath).size > 20000, 'Reference image must be valid size');
    });

    it('verifies sidebar diya & lotus decoration asset exists', () => {
      const diyaPath = path.join(publicDir, 'categories/sidebar-diya-lotus.webp');
      assert.strictEqual(fs.existsSync(diyaPath), true, 'sidebar-diya-lotus.webp must exist');
    });

    it('verifies all 15 reference category card images exist in public/religious/categories', () => {
      const expectedAssets = [
        'astrology-consultation.webp',
        'birth-ceremonies.webp',
        'daily-poojas.webp',
        'dosham-remedies.webp',
        'festival-poojas.webp',
        'homams-dosham-nivaran.webp',
        'education-career.webp',
        'homams-health.webp',
        'homams-prosperity.webp',
        'horoscope-services.webp',
        'house-ceremonies.webp',
        'marriage-ceremonies.webp',
        'muhurtham-fixing.webp',
        'special-occasion-poojas.webp',
        'temple-style-poojas.webp'
      ];

      for (const asset of expectedAssets) {
        const fullPath = path.join(publicDir, 'categories', asset);
        assert.strictEqual(fs.existsSync(fullPath), true, `Asset ${asset} must exist in public/religious/categories`);
      }
    });
  });

  describe('2. Component Contract & Code Verification', () => {
    it('verifies SacredServiceCategoriesSection exists and is client component', () => {
      assert.strictEqual(fs.existsSync(componentPath), true, 'SacredServiceCategoriesSection.jsx must exist');
      const content = fs.readFileSync(componentPath, 'utf8');
      assert.ok(content.includes("'use client'"), 'Must be client component');
      assert.ok(content.includes('export default function SacredServiceCategoriesSection'), 'Must export component');
    });

    it('verifies heading copy matches approved design reference', () => {
      const content = fs.readFileSync(componentPath, 'utf8');
      assert.ok(content.includes('Explore & Book'), 'Badge copy must match reference');
      assert.ok(content.includes('Sacred Service'), 'H2 text part 1 must match reference');
      assert.ok(content.includes('Categories'), 'H2 text part 2 must match reference');
      assert.ok(
        content.includes('Browse divine categories and find the exact ritual or spiritual service you need.'),
        'Subtitle must match reference'
      );
    });

    it('verifies left sidebar contains Browse Categories and All Services option', () => {
      const content = fs.readFileSync(componentPath, 'utf8');
      assert.ok(content.includes('Browse Categories'), 'Sidebar title must match reference');
      assert.ok(content.includes('All Services'), 'Sidebar must include All Services option');
      assert.ok(content.includes('sidebar-diya-lotus.webp'), 'Sidebar must include bottom diya illustration');
    });

    it('verifies 16th card "View All Categories" exists in right grid', () => {
      const content = fs.readFileSync(componentPath, 'utf8');
      assert.ok(content.includes('View All Categories'), 'Grid must include View All Categories card');
      assert.ok(content.includes('Explore more'), 'View all card must have explore action');
    });

    it('verifies responsive 4-column desktop and 2-column mobile grid styling', () => {
      const content = fs.readFileSync(componentPath, 'utf8');
      assert.ok(content.includes('grid-cols-2'), 'Must have 2 columns on mobile');
      assert.ok(content.includes('lg:grid-cols-4'), 'Must have 4 columns on large desktop');
    });

    it('verifies app/religious-services/page.jsx mounts SacredServiceCategoriesSection', () => {
      const pageContent = fs.readFileSync(pagePath, 'utf8');
      assert.ok(
        pageContent.includes("import SacredServiceCategoriesSection from '@/components/religious/SacredServiceCategoriesSection';"),
        'Page must import SacredServiceCategoriesSection'
      );
      assert.ok(
        pageContent.includes('<SacredServiceCategoriesSection'),
        'Page must render SacredServiceCategoriesSection'
      );
    });
  });

  describe('3. Pure Functional Logic Verification', () => {
    it('correctly resolves relative image URLs', () => {
      assert.strictEqual(resolveImage(''), '');
      assert.strictEqual(resolveImage('https://cdn.example.com/pooja.jpg'), 'https://cdn.example.com/pooja.jpg');
      assert.strictEqual(
        resolveImage('uploads/services/pooja.jpg'),
        'https://api.doorstephub.com/uploads/services/pooja.jpg'
      );
    });

    it('maps category names to accurate devotional fallbacks', () => {
      assert.strictEqual(
        getCategoryFallbackImage('Vedic Astrology Consultation', 'vedic-astrology'),
        '/religious/categories/astrology-consultation.webp'
      );
      assert.strictEqual(
        getCategoryFallbackImage('Daily Pooja Service', 'daily-pooja'),
        '/religious/categories/daily-poojas.webp'
      );
      assert.strictEqual(
        getCategoryFallbackImage('Ganesh Festival Utsav', 'festival-pooja'),
        '/religious/categories/festival-poojas.webp'
      );
      assert.strictEqual(
        getCategoryFallbackImage('Maha Ganapathi Homam', 'ganapathi-homam'),
        '/religious/categories/homams-dosham-nivaran.webp'
      );
      assert.strictEqual(
        getCategoryFallbackImage('Griha Pravesh House Ceremony', 'house-ceremonies'),
        '/religious/categories/house-ceremonies.webp'
      );
    });

    it('filters subcategories correctly by category key', () => {
      const mockAll = [
        { id: 1, name: 'Pooja 1', categorySlug: 'poojas' },
        { id: 2, name: 'Pooja 2', categorySlug: 'poojas' },
        { id: 3, name: 'Homam 1', categorySlug: 'homams' },
      ];
      const mockByCat = {
        poojas: [mockAll[0], mockAll[1]],
        homams: [mockAll[2]],
      };

      // 'all' shows everything
      const allResults = filterSubcategories(mockAll, mockByCat, 'all');
      assert.strictEqual(allResults.length, 3);

      // 'poojas' shows only poojas
      const poojaResults = filterSubcategories(mockAll, mockByCat, 'poojas');
      assert.strictEqual(poojaResults.length, 2);
      assert.strictEqual(poojaResults[0].name, 'Pooja 1');

      // 'homams' shows only homams
      const homamResults = filterSubcategories(mockAll, mockByCat, 'homams');
      assert.strictEqual(homamResults.length, 1);
      assert.strictEqual(homamResults[0].name, 'Homam 1');

      // non-existent category returns empty array safely
      const emptyResults = filterSubcategories(mockAll, mockByCat, 'unknown');
      assert.deepStrictEqual(emptyResults, []);
    });
  });
});
