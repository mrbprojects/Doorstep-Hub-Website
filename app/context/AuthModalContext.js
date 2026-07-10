'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModalProvider = ({ children }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuthModal = useCallback(() => {
        setIsAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
    }, []);

    return (
        <AuthModalContext.Provider value={{
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal
        }}>
            {children}
        </AuthModalContext.Provider>
    );
};
