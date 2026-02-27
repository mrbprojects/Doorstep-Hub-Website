'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Search, MapPin, WifiOff, AlertCircle } from 'lucide-react';

const icons = {
    search: Search,
    location: MapPin,
    offline: WifiOff,
    error: AlertCircle,
    default: AlertCircle
};

export function EmptyState({
    icon = 'default',
    title = 'No items found',
    description = 'Try adjusting your search or filters to find what you are looking for.',
    actionLabel,
    onAction,
    className = ''
}) {
    const Icon = icons[icon] || icons.default;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 px-4 ${className}`}
        >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title}
            </h3>

            <p className="text-gray-500 max-w-md mx-auto mb-8">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-[#037166] hover:bg-[#025951] text-white rounded-full px-8"
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
}
