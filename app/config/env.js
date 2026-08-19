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

export const GOOGLE_MAPS_SCRIPT_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;

export const DEFAULT_PLACEHOLDER_IMAGE = `${IMAGE_BASE_URL}/uploads/thumbn_ph_image/default_image.jpg`;

/**
 * Universal Image URL resolver
 * @param {string} path - Image path, relative URL or full URL
 * @param {string} fallback - Optional fallback image URL
 * @returns {string} - Full image URL
 */
export function getImageUrl(path, fallback = DEFAULT_PLACEHOLDER_IMAGE) {
  if (!path) return fallback;
  if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path.replace(/([^:]\/)\/+/g, '$1');
  }
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${IMAGE_BASE_URL}/${cleanPath}`;
}

export default {
  API_BASE_URL,
  IMAGE_BASE_URL,
  SITE_URL,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_SCRIPT_URL,
  DEFAULT_PLACEHOLDER_IMAGE,
  getImageUrl,
};
