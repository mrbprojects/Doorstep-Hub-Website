'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';
import { toast } from 'sonner';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/cart/get', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success && data.data) {
                setCartItems(data.data.items || []);
                setCartTotal(data.data.totalAmount || 0);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    }, [token, isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId, storeId, quantity = 1) => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            openAuthModal(); // Trigger the auth modal
            return false;
        }
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/cart/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, storeId, quantity })
            });
            const data = await response.json();
            if (data.success) {
                await fetchCart();
                return true;
            }
            return false;
        } catch (error) {
            toast.error('Failed to add to cart');
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/cart/remove', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });
            const data = await response.json();
            if (data.success) {
                await fetchCart();
            }
        } catch (error) {
            toast.error('Failed to remove from cart');
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/cart/clear', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCartItems([]);
                setCartTotal(0);
            }
        } catch (error) {
            toast.error('Failed to clear cart');
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cartTotal,
            loading,
            fetchCart,
            addToCart,
            removeFromCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
