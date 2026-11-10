/**
 * Centralized Environment & API Configuration
 * All API base URLs, Image URLs, Site URLs, and Map Keys are loaded exclusively from .env
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi'
).replace(/\/+$/, '');

export const IMAGE_BASE_URL = (
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com'
).replace(/\/+$/, '');

export const SITE_URL = (
  process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://doorstephub.com'
).replace(/\/+$/, '');

export const GOOGLE_MAPS_API_KEY = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || ''
).trim();

export const GOOGLE_MAPS_SCRIPT_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;

export const DEFAULT_PLACEHOLDER_IMAGE = `${IMAGE_BASE_URL}/uploads/thumbn_ph_image/default_image.jpg`;

/**
 * Universal Image URL resolver
 * @param {string} path - Image path, relative URL or full URL
 * @param {string} fallback - Optional fallback image URL
 * @returns {string} - Full image URL
 */
export function getImageUrl(path, fallback = DEFAULT_PLACEHOLDER_IMAGE) {
  if (!path) return fallback;

  let cleanUrl = String(path).trim();
  if (!cleanUrl) return fallback;

  // Replace any stale or dead devapis.doorstephub.com URLs with live production IMAGE_BASE_URL
  if (cleanUrl.includes('devapis.doorstephub.com')) {
    cleanUrl = cleanUrl.replace(/https?:\/\/devapis\.doorstephub\.com/g, IMAGE_BASE_URL);
  }

  // Safe asset recovery mapping: Map historical database reference to verified live uploaded asset
  if (cleanUrl.includes('uploads/ondemandsubcategory/Laptop_Repair.webp')) {
    cleanUrl = cleanUrl.replace('Laptop_Repair.webp', '1751895490326-laptop.jpg');
  }

  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    try {
      const parsed = new URL(cleanUrl);
      parsed.pathname = encodeURI(decodeURI(parsed.pathname));
      return parsed.toString();
    } catch {
      return cleanUrl.replace(/([^:]\/)\/+/g, '$1');
    }
  }

  const cleanPath = cleanUrl.replace(/^\/+/, '');
  const encodedPath = encodeURI(decodeURI(cleanPath));
  return `${IMAGE_BASE_URL}/${encodedPath}`;
}

const envConfig = {
  API_BASE_URL,
  IMAGE_BASE_URL,
  SITE_URL,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_SCRIPT_URL,
  DEFAULT_PLACEHOLDER_IMAGE,
  getImageUrl,
};

export default envConfig;
