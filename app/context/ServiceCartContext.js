'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';
import { useLocationContext } from './LocationContext';
import { toast } from 'sonner';
import { isObjectId } from '@/utils/slugHelper';

const ServiceCartContext = createContext();

export const useServiceCart = () => useContext(ServiceCartContext);

export const ServiceCartProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [cartItems, setCartItems] = useState([]);
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cartError, setCartError] = useState(false);
    const { location } = useLocationContext();
    const pathname = usePathname();
    const [currentServiceFlow, setCurrentServiceFlow] = useState(null);

    // Refs to hold latest values without triggering re-renders in the effect
    const cartItemsRef = React.useRef(cartItems);
    const clearCartRef = React.useRef(null);
    // lastLocation as a ref (not state) so writing to it never triggers a re-render
    const lastLocationRef = React.useRef(null);

    // Extract primitives so the effect dep array gets stable values, not a new object
    const locationLat = location?.lat;
    const locationLng = location?.lng;

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/get`, {
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
            let providerKey = providerId;

            // Ensure professional flows send provider ObjectId (backend rejects slugs here)
            if (providerType === 'professional' && providerId && !isObjectId(providerId)) {
                try {
                    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ providerSlug: providerId })
                    });
                    const data = await resp.json();
                    const store = data?.storeData?.[0];
                    const resolvedId = store?._id || store?.providerId;
                    if (resolvedId) providerKey = resolvedId;
                } catch (e) {
                    console.warn('Could not resolve provider slug to id; using provided value', e);
                }
            }

            const body = {
                providerId: providerKey,
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

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/add`, {
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

    const removeFromCart = async (productId) => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/cart/remove`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId
                })
            });
            const data = await response.json();
            if (data.success) {
                await fetchCart();
            } else {
                toast.error(data.message || 'Failed to remove from cart');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove from cart');
        }
    };

    const clearCart = useCallback(async (suppressToast = false) => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/clear`, {
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

    // Keep refs up to date so the effect below can access latest values without listing them as deps
    useEffect(() => {
        cartItemsRef.current = cartItems;
    }, [cartItems]);

    useEffect(() => {
        clearCartRef.current = clearCart;
    }, [clearCart]);

    // Handle service category OR location changes to clear the cart
    // NOTE: cartItems/clearCart via refs, lastLocation via ref — nothing here causes a loop.
    // Deps are all primitives or stable state; no new objects created.
    useEffect(() => {
        const serviceCategories = ['spa-salon', 'appliances', 'services', 'religious-services', 'pghostels', 'pg-hostel', 'religious'];
        const segments = pathname.split('/').filter(Boolean);
        const isPaymentErrorPage = segments.includes('payment-failed');
        const match = serviceCategories.find(cat => segments.includes(cat));

        // 1. Check for Service Flow Change
        // Ignore "services" as a flow change if we are on a payment failure page, 
        // as that route is used for general error handling.
        const isFlowChanged = match && 
                             currentServiceFlow && 
                             currentServiceFlow !== match && 
                             !isPaymentErrorPage;

        // 2. Check for Location Change (compare against ref — no setState involved)
        const hasLocationChanged = locationLat != null && lastLocationRef.current != null && (
            locationLat !== lastLocationRef.current.lat ||
            locationLng !== lastLocationRef.current.lng
        );

        if (isFlowChanged || hasLocationChanged) {
            console.log(`🛒 Context Change Detected! Flow: ${currentServiceFlow}->${match}, Location changed: ${hasLocationChanged}. Clearing cart...`);
            if (cartItemsRef.current.length > 0 && clearCartRef.current) {
                clearCartRef.current(true);
            }
        }

        // Update tracking: write to ref (no state update = no re-render)
        // Only update flow if it's a valid service category and NOT a payment error page
        if (match && !isPaymentErrorPage) setCurrentServiceFlow(match);
        if (locationLat != null) {
            lastLocationRef.current = { lat: locationLat, lng: locationLng };
        }

    }, [pathname, locationLat, locationLng, currentServiceFlow]);
    // ↑ lastLocation removed — it's now a ref, so no need in deps

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

