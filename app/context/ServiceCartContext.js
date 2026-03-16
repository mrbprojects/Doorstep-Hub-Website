'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';
import { toast } from 'sonner';

const ServiceCartContext = createContext();

export const useServiceCart = () => useContext(ServiceCartContext);

export const ServiceCartProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [cartItems, setCartItems] = useState([]);
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cartError, setCartError] = useState(false);
    const pathname = usePathname();
    const [currentServiceFlow, setCurrentServiceFlow] = useState(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/service-cart/get', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log("🛒 fetchCart Response:", data);
            if (data.success) {
                setCartItems(data.cart?.items || []);
                setCartData(data.cart || null);
                setCartError(false);
            } else {
                setCartError(true);
            }
        } catch (error) {
            console.error('Error fetching service cart:', error);
            setCartError(true);
        } finally {
            setLoading(false);
        }
    }, [token, isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);


    const addToCart = async (providerId, itemId, itemType = 'service', quantity = 1, parentServiceId = null, providerType = 'regular', suppressToast = false) => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            openAuthModal(); // Trigger the auth modal
            return false;
        }
        try {
            const body = {
                providerId,
                itemId,
                itemType, // 'service', 'addon', 'professional_service', 'professional_addon'
                providerType, // 'regular' or 'professional'
                quantity
            };

            // Add parentServiceId for addons
            if ((itemType === 'addon' || itemType === 'professional_addon') && parentServiceId) {
                body.parentServiceId = parentServiceId;
            }

            console.log('🛒 Service Cart API Request:', body);

            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/service-cart/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            console.log('🛒 Service Cart API Response:', data);

            if (data.success) {
                await fetchCart();
                return true;
            } else {
                toast.error(data.message || 'Failed to add to cart');
                return false;
            }
        } catch (error) {
            console.error('Error adding to service cart:', error);
            toast.error('Failed to add to cart');
            return false;
        }
    };

    const removeFromCart = async (itemId, itemType = 'service') => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/service-cart/remove', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    itemId,
                    itemType
                })
            });
            const data = await response.json();
            if (data.success) {
                await fetchCart();
            }
        } catch (error) {
            console.error('Error removing from service cart:', error);
            toast.error('Failed to remove from cart');
        }
    };

    const clearCart = useCallback(async (suppressToast = false) => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/service-cart/clear', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setCartItems([]);
                setCartData(null);
            }
        } catch (error) {
            console.error('Error clearing service cart:', error);
            if (!suppressToast) toast.error('Failed to clear cart');
        }
    }, [token, isAuthenticated]);

    // Handle service category changes to clear the cart
    useEffect(() => {
        const serviceCategories = ['spa-salon', 'appliances', 'services', 'religious-services', 'pghostels', 'pg-hostel', 'religious'];
        const segments = pathname.split('/').filter(Boolean);
        const match = serviceCategories.find(cat => segments.includes(cat));

        if (match) {
            if (currentServiceFlow && currentServiceFlow !== match) {
                // If we've shifted from one service category to another, clear the cart
                console.log(`🛒 Service Flow Change: ${currentServiceFlow} -> ${match}. Clearing cart...`);
                if (cartItems.length > 0) {
                    clearCart(true); // true to suppress "Failed to clear cart" toast if unauthorized
                }
            }
            setCurrentServiceFlow(match);
        }
    }, [pathname, currentServiceFlow, cartItems.length, clearCart]);

    return (
        <ServiceCartContext.Provider value={{
            cartItems,
            cartData,
            loading,
            cartError,
            fetchCart,
            addToCart,
            removeFromCart,
            clearCart
        }}>
            {children}
        </ServiceCartContext.Provider>
    );
};
