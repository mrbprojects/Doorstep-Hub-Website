/**
 * Form Validation Utilities
 * Comprehensive validation functions for user inputs
 */

/**
 * Validate Indian mobile number
 * Format: 10 digits starting with 6-9
 */
export const validatePhone = (phone) => {
    if (!phone) {
        return { isValid: false, error: 'Phone number is required' };
    }

    // Remove spaces, dashes, and country code
    const cleaned = phone.replace(/[\s\-\+]/g, '');

    // Remove country code if present
    const number = cleaned.startsWith('91') ? cleaned.slice(2) : cleaned;

    // Check format: 10 digits starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(number)) {
        return {
            isValid: false,
            error: 'Please enter a valid 10-digit mobile number'
        };
    }

    return { isValid: true, value: number };
};

/**
 * Validate email address
 * RFC 5322 compliant
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    // Trim whitespace
    const trimmed = email.trim();

    // RFC 5322 Email Regex (simplified but robust)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmed)) {
        return {
            isValid: false,
            error: 'Please enter a valid email address'
        };
    }

    // Additional checks
    if (trimmed.length > 254) {
        return {
            isValid: false,
            error: 'Email address is too long'
        };
    }

    return { isValid: true, value: trimmed };
};

/**
 * Validate date (no past dates allowed)
 */
export const validateDate = (date, allowToday = true) => {
    if (!date) {
        return { isValid: false, error: 'Date is required' };
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if valid date
    if (isNaN(selectedDate.getTime())) {
        return {
            isValid: false,
            error: 'Please enter a valid date'
        };
    }

    // Check if past date
    if (allowToday) {
        if (selectedDate < today) {
            return {
                isValid: false,
                error: 'Please select today or a future date'
            };
        }
    } else {
        if (selectedDate <= today) {
            return {
                isValid: false,
                error: 'Please select a future date'
            };
        }
    }

    // Check if too far in future (1 year max)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (selectedDate > oneYearFromNow) {
        return {
            isValid: false,
            error: 'Date cannot be more than 1 year in the future'
        };
    }

    return { isValid: true, value: date };
};

/**
 * Validate address fields
 */
export const validateAddress = (address) => {
    if (!address) {
        return { isValid: false, error: 'Address is required' };
    }

    // Trim whitespace
    const trimmed = address.trim();

    // Check if empty after trim
    if (!trimmed) {
        return {
            isValid: false,
            error: 'Address cannot be empty'
        };
    }

    // Check minimum length
    if (trimmed.length < 5) {
        return {
            isValid: false,
            error: 'Address is too short (minimum 5 characters)'
        };
    }

    // Check maximum length
    if (trimmed.length > 200) {
        return {
            isValid: false,
            error: 'Address is too long (maximum 200 characters)'
        };
    }

    return { isValid: true, value: trimmed };
};

/**
 * Validate name
 */
export const validateName = (name) => {
    if (!name) {
        return { isValid: false, error: 'Name is required' };
    }

    const trimmed = name.trim();

    if (!trimmed) {
        return {
            isValid: false,
            error: 'Name cannot be empty'
        };
    }

    if (trimmed.length < 2) {
        return {
            isValid: false,
            error: 'Name is too short (minimum 2 characters)'
        };
    }

    if (trimmed.length > 50) {
        return {
            isValid: false,
            error: 'Name is too long (maximum 50 characters)'
        };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
        return {
            isValid: false,
            error: 'Name can only contain letters, spaces, hyphens, and apostrophes'
        };
    }

    return { isValid: true, value: trimmed };
};

/**
 * Validate PIN code (Indian)
 */
export const validatePinCode = (pinCode) => {
    if (!pinCode) {
        return { isValid: false, error: 'PIN code is required' };
    }

    const cleaned = pinCode.toString().replace(/\s/g, '');
    const pinRegex = /^[1-9][0-9]{5}$/;

    if (!pinRegex.test(cleaned)) {
        return {
            isValid: false,
            error: 'Please enter a valid 6-digit PIN code'
        };
    }

    return { isValid: true, value: cleaned };
};

/**
 * Validate OTP
 */
export const validateOTP = (otp) => {
    if (!otp) {
        return { isValid: false, error: 'OTP is required' };
    }

    const cleaned = otp.toString().replace(/\s/g, '');
    const otpRegex = /^\d{4,6}$/;

    if (!otpRegex.test(cleaned)) {
        return {
            isValid: false,
            error: 'Please enter a valid OTP'
        };
    }

    return { isValid: true, value: cleaned };
};

/**
 * Batch validation for multiple fields
 */
export const validateForm = (fields) => {
    const errors = {};
    let isValid = true;

    Object.keys(fields).forEach(key => {
        const { value, validator } = fields[key];
        const result = validator(value);

        if (!result.isValid) {
            errors[key] = result.error;
            isValid = false;
        }
    });

    return { isValid, errors };
};
