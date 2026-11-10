import test from 'node:test';
import assert from 'node:assert/strict';

import { getImageUrl } from '../app/config/env.js';
import { imageLoader } from '../app/lib/api.js';

test('Image Aliasing Regression Suite', async (t) => {
  await t.test('1. Specific verified aliasing: Laptop_Repair.webp recovers to 1751895490326-laptop.jpg', () => {
    const input = 'uploads/ondemandsubcategory/Laptop_Repair.webp';
    const resolvedEnv = getImageUrl(input);
    const resolvedLoader = imageLoader({ src: input });

    assert.equal(
      resolvedEnv,
      'https://api.doorstephub.com/uploads/ondemandsubcategory/1751895490326-laptop.jpg',
      'getImageUrl must recover verified Laptop_Repair.webp to 1751895490326-laptop.jpg'
    );
    assert.equal(
      resolvedLoader,
      'https://api.doorstephub.com/uploads/ondemandsubcategory/1751895490326-laptop.jpg',
      'imageLoader must recover verified Laptop_Repair.webp to 1751895490326-laptop.jpg'
    );
  });

  await t.test('2. Strict isolation: Non-aliased subcategories remain untouched', () => {
    const acInput = 'uploads/ondemandsubcategory/Split_AC.webp';
    const desktopInput = 'uploads/ondemandsubcategory/Desktop_Repair.webp';

    assert.equal(getImageUrl(acInput), 'https://api.doorstephub.com/uploads/ondemandsubcategory/Split_AC.webp');
    assert.equal(getImageUrl(desktopInput), 'https://api.doorstephub.com/uploads/ondemandsubcategory/Desktop_Repair.webp');
  });

  await t.test('3. No accidental collision: Service items with "Laptop" are NOT mutated by subcategory rule', () => {
    const serviceInput = 'uploads/ondemandservice/Laptop_Power_Charging_Issues.webp';

    assert.equal(
      getImageUrl(serviceInput),
      'https://api.doorstephub.com/uploads/ondemandservice/Laptop_Power_Charging_Issues.webp',
      'Service items must not be affected by subcategory rules'
    );
    assert.equal(
      imageLoader({ src: serviceInput }),
      'https://api.doorstephub.com/uploads/ondemandservice/Laptop_Power_Charging_Issues.webp'
    );
  });

  await t.test('4. URL normalization & edge case resilience', () => {
    assert.equal(getImageUrl(''), 'https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg');
    assert.equal(getImageUrl(null), 'https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg');
    assert.equal(getImageUrl('data:image/png;base64,123'), 'data:image/png;base64,123');
    assert.equal(getImageUrl('blob:http://localhost/123'), 'blob:http://localhost/123');
  });
});
