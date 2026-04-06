
/**
 * Checks if a string is a valid MongoDB ObjectId (24 hex characters)
 * @param {string} id - The string to check
 * @returns {boolean}
 */
export function isObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Normalizes a slug or ID for API request bodies.
 * If it's an ObjectId, it returns it as the ID field.
 * Otherwise, it returns it as the Slug field.
 * 
 * @param {string} value - The ID or Slug from the URL
 * @param {string} idKey - The key for the ID field (e.g., 'serviceId')
 * @param {string} slugKey - The key for the Slug field (e.g., 'serviceSlug')
 * @returns {Object} Object with either idKey or slugKey set
 */
export function resolveParam(value, idKey, slugKey) {
    if (!value || value === 'null') return {};
    if (isObjectId(value)) {
        return { [idKey]: value };
    }
    return { [slugKey]: value };
}

/**
 * Special case for Provider Detail API which supports multiple slug keys
 */
export function resolveProviderParam(value) {
    if (!value || value === 'null') return {};
    if (isObjectId(value)) {
        return { providerId: value };
    }
    // Backend supports 'providerSlug' or 'slug'
    return { providerSlug: value };
}
