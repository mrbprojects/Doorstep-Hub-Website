'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { RateLimiter, getDeviceFingerprint } from '@/utils/security';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Token expiry configuration (24 hours)
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const TOKEN_REFRESH_THRESHOLD = 2 * 60 * 60 * 1000; // Refresh if less than 2 hours remaining

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tokenExpiry, setTokenExpiry] = useState(null);
    const sessionCheckInterval = useRef(null);

    // OTP brute force protection
    const [otpAttempts, setOtpAttempts] = useState(0);
    const [isOtpLocked, setIsOtpLocked] = useState(false);
    const [lockoutEndTime, setLockoutEndTime] = useState(null);
    const otpRateLimiter = useRef(new RateLimiter(3, 15 * 60 * 1000)); // 3 attempts, 15 min window

    // Check if token is expired
    const isTokenExpired = useCallback(() => {
        if (!tokenExpiry) return false;
        return Date.now() >= tokenExpiry;
    }, [tokenExpiry]);

    // Check if token needs refresh (less than 2 hours remaining)
    const shouldRefreshToken = useCallback(() => {
        if (!tokenExpiry) return false;
        return Date.now() >= (tokenExpiry - TOKEN_REFRESH_THRESHOLD);
    }, [tokenExpiry]);

    // Save token with expiry timestamp
    const saveToken = useCallback((authToken) => {
        const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;
        setToken(authToken);
        setTokenExpiry(expiryTime);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('token_expiry', expiryTime.toString());
    }, []);

    // Clear token and expiry
    const clearToken = useCallback(() => {
        setToken(null);
        setTokenExpiry(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
    }, []);

    // Validate and restore token from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const savedExpiry = localStorage.getItem('token_expiry');

        if (savedToken && savedExpiry) {
            const expiryTime = parseInt(savedExpiry);

            // Check if token is expired
            if (Date.now() >= expiryTime) {
                console.warn('Token expired, clearing session');
                clearToken();
                toast.error('Session expired. Please login again.');
                setLoading(false);
                return;
            }

            // Token is valid, restore session
            setToken(savedToken);
            setTokenExpiry(expiryTime);
            fetchProfile(savedToken);

            // Check if token needs refresh
            if (Date.now() >= (expiryTime - TOKEN_REFRESH_THRESHOLD)) {
                console.log('Token expiring soon, consider refreshing');
                // Note: Implement token refresh API call here if backend supports it
            }
        } else {
            setLoading(false);
        }
    }, [clearToken]);

    // Session monitoring - check token expiry every minute
    useEffect(() => {
        if (!token || !tokenExpiry) return;

        sessionCheckInterval.current = setInterval(() => {
            if (isTokenExpired()) {
                console.warn('Token expired during session');
                logout();
                toast.error('Your session has expired. Please login again.');
            } else if (shouldRefreshToken()) {
                console.log('Token expiring soon');
                // Show warning to user
                const remainingTime = Math.floor((tokenExpiry - Date.now()) / (60 * 1000));
                if (remainingTime <= 30 && remainingTime > 0) {
                    toast.warning(`Your session will expire in ${remainingTime} minutes`);
                }
            }
        }, 60000); // Check every minute

        return () => {
            if (sessionCheckInterval.current) {
                clearInterval(sessionCheckInterval.current);
            }
        };
    }, [token, tokenExpiry, isTokenExpired, shouldRefreshToken]);

    const fetchProfile = async (authToken) => {
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/user/profile', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
                console.warn('401 Unauthorized - Token invalid');
                logout();
                toast.error('Session invalid. Please login again.');
                return;
            }

            const data = await response.json();
            if (data.success) {
                setUser(data.data);
            }
            // Note: do NOT logout on non-success profile responses — that would
            // kick users out on temporary server errors. Only 401 (above) triggers logout.
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Don't logout on network errors, only on auth errors
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const loginWithWhatsApp = async (mobile) => {
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/auth/sendWhatsAppOtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, fcmtoken: '1234' })
            });
            return await response.json();
        } catch (error) {
            toast.error('Failed to send OTP');
            throw error;
        }
    };

    const verifyOtp = async (mobile, otp) => {
        // Check if OTP verification is locked
        if (isOtpLocked) {
            const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / 1000 / 60);
            toast.error(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
            return { success: false, error: 'LOCKED' };
        }

        // Check rate limit
        const rateLimitKey = `otp-${mobile}`;
        if (!otpRateLimiter.current.isAllowed(rateLimitKey)) {
            const remainingMs = otpRateLimiter.current.getRemainingTime(rateLimitKey);
            const remainingMin = Math.ceil(remainingMs / 1000 / 60);

            setIsOtpLocked(true);
            setLockoutEndTime(Date.now() + remainingMs);

            // Auto-unlock after timeout
            setTimeout(() => {
                setIsOtpLocked(false);
                setOtpAttempts(0);
                setLockoutEndTime(null);
                otpRateLimiter.current.reset(rateLimitKey);
            }, remainingMs);

            toast.error(`Too many failed attempts. Try again in ${remainingMin} minutes.`);
            return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
        }

        try {
            // Get device fingerprint for security
            const deviceId = await getDeviceFingerprint();

            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/auth/verifywhatsappOTP', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile,
                    otp,
                    fcmtoken: '1234',
                    deviceId // Send device fingerprint
                })
            });

            const data = await response.json();

            if ((data.success || data.status === 'success') && data.token) {
                // Success - reset attempts
                setOtpAttempts(0);
                otpRateLimiter.current.reset(rateLimitKey);

                saveToken(data.token);
                await fetchProfile(data.token);
                toast.success('Login successful!');
            } else {
                // Failed attempt - record it
                otpRateLimiter.current.recordAttempt(rateLimitKey);
                setOtpAttempts(prev => prev + 1);

                const attemptsLeft = 3 - (otpAttempts + 1);
                if (attemptsLeft > 0) {
                    toast.error(`Invalid OTP. ${attemptsLeft} attempts remaining.`);
                } else {
                    toast.error('Invalid OTP. Account locked for 15 minutes.');
                }
            }

            return data;
        } catch (error) {
            // Record failed attempt even on error
            otpRateLimiter.current.recordAttempt(rateLimitKey);
            setOtpAttempts(prev => prev + 1);

            toast.error('Verification failed');
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            const { signInWithGoogle } = await import('@/config/firebase');
            const { user, idToken } = await signInWithGoogle();

            console.log('🔥 Firebase Google Sign-In successful, calling backend API...');

            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/auth/loginWithGoogle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, fcmtoken: '1234' })
            });

            const data = await response.json();
            console.log('📡 Backend API response:', data);

            if (data.success && data.token) {
                saveToken(data.token);
                await fetchProfile(data.token);
                toast.success('Login successful!');
                return data;
            } else {
                toast.error(data.message || 'Google Sign-in failed');
                return data;
            }
        } catch (error) {
            console.error('❌ Google Sign-in error:', error);
            toast.error('Google Sign-in failed');
            throw error;
        }
    };

    const loginWithApple = async () => {
        try {
            const { signInWithApple } = await import('@/config/firebase');
            const { user, idToken } = await signInWithApple();

            console.log('🍎 Firebase Apple Sign-In successful, calling backend API...');

            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/auth/loginWithApple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, fcmtoken: '1234' })
            });

            const data = await response.json();
            console.log('📡 Backend API response:', data);

            if (data.success && data.token) {
                saveToken(data.token);
                await fetchProfile(data.token);
                toast.success('Login successful!');
                return data;
            } else {
                toast.error(data.message || 'Apple Sign-in failed');
                return data;
            }
        } catch (error) {
            console.error('❌ Apple Sign-in error:', error);
            toast.error('Apple Sign-in failed');
            throw error;
        }
    };

    const updateProfile = async (formData) => {
        try {
            // Check token expiry before making request
            if (isTokenExpired()) {
                logout();
                toast.error('Session expired. Please login again.');
                throw new Error('Token expired');
            }

            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
                logout();
                toast.error('Session expired. Please login again.');
                throw new Error('Unauthorized');
            }

            const data = await response.json();
            if (data.success) {
                setUser(data.data);
                toast.success('Profile updated successfully!');
            }
            return data;
        } catch (error) {
            toast.error('Failed to update profile');
            throw error;
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        clearToken();
        if (sessionCheckInterval.current) {
            clearInterval(sessionCheckInterval.current);
        }
        toast.message('Logged out successfully');
    }, [clearToken]);

    // Global API error handler for 401 responses
    const handleApiError = useCallback((error, response) => {
        if (response?.status === 401 || error?.message?.includes('401')) {
            logout();
            toast.error('Session expired. Please login again.');
            return true; // Handled
        }
        return false; // Not handled
    }, [logout]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated: !!token && !isTokenExpired(),
            tokenExpiry,
            isTokenExpired,
            loginWithWhatsApp,
            verifyOtp,
            loginWithGoogle,
            loginWithApple,
            updateProfile,
            logout,
            handleApiError, // Expose for use in other contexts
            otpAttempts, // Expose OTP attempt count
            isOtpLocked, // Expose OTP lock status
            lockoutEndTime // Expose lockout end time
        }}>
            {children}
        </AuthContext.Provider>
    );
};
