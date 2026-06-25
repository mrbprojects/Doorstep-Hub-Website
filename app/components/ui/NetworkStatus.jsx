'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial check
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
        }

        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Back online', {
                icon: <Wifi className="w-4 h-4" />,
                duration: 3000
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.error('You are offline', {
                icon: <WifiOff className="w-4 h-4" />,
                duration: Infinity, // Keep until back online
                id: 'offline-toast' // Unique ID to dismiss/update
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return null; // This component manages Toast state, no visual DOM needed itself
}
