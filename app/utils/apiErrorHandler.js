/**
 * API Error Handling Utilities
 * Centralized error handling with retry logic and user-friendly messages
 */

import { toast } from 'sonner';

/**
 * API Error Types
 */
export const API_ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT_ERROR',
    SERVER: 'SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
    [API_ERROR_TYPES.NETWORK]: 'Network error. Please check your internet connection.',
    [API_ERROR_TYPES.TIMEOUT]: 'Request timed out. Please try again.',
    [API_ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
    [API_ERROR_TYPES.UNAUTHORIZED]: 'Session expired. Please login again.',
    [API_ERROR_TYPES.VALIDATION]: 'Invalid data. Please check your inputs.',
    [API_ERROR_TYPES.NOT_FOUND]: 'Resource not found.',
    [API_ERROR_TYPES.UNKNOWN]: 'Something went wrong. Please try again.'
};

/**
 * Determine error type from response
 */
const getErrorType = (error, response) => {
    if (!navigator.onLine) {
        return API_ERROR_TYPES.NETWORK;
    }

    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
        return API_ERROR_TYPES.TIMEOUT;
    }

    if (response?.status === 401) {
        return API_ERROR_TYPES.UNAUTHORIZED;
    }

    if (response?.status === 404) {
        return API_ERROR_TYPES.NOT_FOUND;
    }

    if (response?.status === 400 || response?.status === 422) {
        return API_ERROR_TYPES.VALIDATION;
    }

    if (response?.status >= 500) {
        return API_ERROR_TYPES.SERVER;
    }

    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        return API_ERROR_TYPES.NETWORK;
    }

    return API_ERROR_TYPES.UNKNOWN;
};

/**
 * Exponential backoff delay calculation
 */
const getRetryDelay = (attempt) => {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
};

/**
 * Fetch with timeout
 */
const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};

/**
 * Enhanced fetch with retry logic and error handling
 */
export const apiFetch = async (url, options = {}, config = {}) => {
    const {
        maxRetries = 3,
        timeout = 30000,
        showToast = true,
        retryOn = [API_ERROR_TYPES.NETWORK, API_ERROR_TYPES.TIMEOUT],
        onError = null
    } = config;

    let lastError = null;
    let lastResponse = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, options, timeout);
            lastResponse = response;

            // Check if response is ok
            if (!response.ok) {
                const errorType = getErrorType(null, response);

                // Don't retry on auth errors or validation errors
                if (errorType === API_ERROR_TYPES.UNAUTHORIZED ||
                    errorType === API_ERROR_TYPES.VALIDATION) {
                    throw new Error(errorType);
                }

                // Retry on server errors
                if (attempt < maxRetries - 1 && retryOn.includes(errorType)) {
                    await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
                    continue;
                }

                throw new Error(errorType);
            }

            // Success
            return await response.json();

        } catch (error) {
            lastError = error;
            const errorType = getErrorType(error, lastResponse);

            // Don't retry on certain errors
            if (errorType === API_ERROR_TYPES.UNAUTHORIZED ||
                errorType === API_ERROR_TYPES.VALIDATION) {
                break;
            }

            // Retry if attempts remaining and error is retryable
            if (attempt < maxRetries - 1 && retryOn.includes(errorType)) {
                console.log(`Retry attempt ${attempt + 1} for ${url}`);
                await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
                continue;
            }

            break;
        }
    }

    // All retries failed
    const errorType = getErrorType(lastError, lastResponse);
    const errorMessage = ERROR_MESSAGES[errorType];

    // Show toast if enabled
    if (showToast) {
        toast.error(errorMessage);
    }

    // Call custom error handler if provided
    if (onError) {
        onError(errorType, lastError, lastResponse);
    }

    // Throw error with type
    const error = new Error(errorMessage);
    error.type = errorType;
    error.originalError = lastError;
    error.response = lastResponse;
    throw error;
};

/**
 * Check if user is online
 */
export const isOnline = () => {
    return navigator.onLine;
};

/**
 * Listen for online/offline events
 */
export const setupNetworkListener = (onOnline, onOffline) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
};

/**
 * Handle API errors globally
 */
export const handleApiError = (error, customMessage = null) => {
    const errorType = error?.type || API_ERROR_TYPES.UNKNOWN;
    const message = customMessage || ERROR_MESSAGES[errorType];

    console.error('API Error:', {
        type: errorType,
        message,
        originalError: error?.originalError,
        response: error?.response
    });

    toast.error(message);

    return {
        type: errorType,
        message,
        shouldRetry: [API_ERROR_TYPES.NETWORK, API_ERROR_TYPES.TIMEOUT].includes(errorType)
    };
};
