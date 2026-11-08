'use client';

import { useEffect } from 'react';

import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkStatus() {
    useEffect(() => {
        const handleOnline = () => {
            toast.success('Back online', {
                icon: <Wifi className="w-4 h-4" />,
                duration: 3000
            });
        };

        const handleOffline = () => {
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
