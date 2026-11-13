import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getQrCodePath } from '../app/lib/qrCode.js';

describe('QR Code Vector Generation Test Suite', () => {
  it('generates a valid QR SVG path for standard customer app URL', () => {
    const url = 'https://doorstephub.com/app?type=customer';
    const result = getQrCodePath(url);

    assert.strictEqual(result.success, true, 'QR generation must succeed');
    assert.ok(result.total > 20, 'QR module dimension must be greater than 20');
    assert.ok(result.pathD.length > 100, 'QR path data must contain drawing commands');
    assert.ok(result.pathD.includes('M'), 'Path must contain SVG Move commands');
    assert.ok(result.pathD.includes('h1v1h-1z'), 'Path must contain module block commands');
  });

  it('generates a valid QR SVG path for partner app URL', () => {
    const url = 'https://doorstephub.com/app?type=partner';
    const result = getQrCodePath(url);

    assert.strictEqual(result.success, true, 'QR generation must succeed');
    assert.ok(result.total > 20, 'QR module dimension must be greater than 20');
    assert.ok(result.pathD.length > 100, 'QR path data must be populated');
  });

  it('handles empty or fallback URL gracefully', () => {
    const result = getQrCodePath('');
    assert.strictEqual(result.success, true);
    assert.ok(result.pathD.length > 50);
  });

  it('respects custom quietZone parameter', () => {
    const resultDefault = getQrCodePath('https://doorstephub.com', 2);
    const resultPadded = getQrCodePath('https://doorstephub.com', 4);

    assert.strictEqual(resultPadded.total - resultDefault.total, 4, 'Difference in total dimension should reflect 2 extra modules on each side');
  });
});
