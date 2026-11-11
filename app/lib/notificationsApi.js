import { API_BASE_URL } from '@/config/env';

const READ_IDS_KEY = 'dhub_read_notification_ids';

/**
 * Helper to get read IDs from storage
 */
export function getReadNotificationIds() {
    if (typeof window === 'undefined') return new Set();
    try {
        const stored = localStorage.getItem(READ_IDS_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

/**
 * Mark a single notification as read
 */
export function markNotificationAsRead(id) {
    if (typeof window === 'undefined' || !id) return;
    try {
        const readSet = getReadNotificationIds();
        readSet.add(String(id));
        localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(readSet)));
    } catch {}
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(ids = []) {
    if (typeof window === 'undefined') return;
    try {
        const readSet = getReadNotificationIds();
        ids.forEach(id => readSet.add(String(id)));
        localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(readSet)));
    } catch {}
}

/**
 * Fetch dynamic notifications:
 * 1. Attempts API endpoint /app/notifications if supported.
 * 2. Augments with dynamic notifications based on user context (welcome, wallet topups, bookings, active offers).
 */
export async function fetchNotifications({ token, category = 'all', page = 1, limit = 10 } = {}) {
    let apiNotifications = [];

    if (token) {
        try {
            let res = await fetch(`${API_BASE_URL}/app/notification/get-notifications?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok && res.status === 404) {
                res = await fetch(`${API_BASE_URL}/app/notifications?page=${page}&limit=${limit}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.notifications)) {
                    apiNotifications = data.notifications;
                }
            }
        } catch {
            // Silently fall back to synthesized notifications
        }
    }

    // Default dynamic notifications tailored to Doorstep Hub services
    const now = Date.now();
    const defaultFeed = [
        {
            id: 'notif-welcome',
            category: 'system',
            title: 'Welcome to Doorstep Hub!',
            message: 'Book verified home appliance repair, religious poojas, salon, and PG accommodations with doorstep service guarantee.',
            timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
            actionUrl: '/service-list/category/appliance-repair-services',
            actionText: 'Explore Services'
        },
        {
            id: 'notif-offer-appliance',
            category: 'offers',
            title: 'Exclusive Offer: ₹99 Doorstep Inspection',
            message: 'Book verified appliance repairs today with our transparent inspection fee of just ₹99.',
            timestamp: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
            actionUrl: '/appliances',
            actionText: 'Book Repair'
        },
        {
            id: 'notif-wallet-safety',
            category: 'wallet',
            title: 'Instant Refund & Wallet Top-up',
            message: 'Top-up your wallet seamlessly via UPI, Cards, or Netbanking for 1-click doorstep checkout.',
            timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
            actionUrl: '/account/wallet',
            actionText: 'View Wallet'
        },
        {
            id: 'notif-booking-support',
            category: 'bookings',
            title: '24/7 Verified Service Partners',
            message: 'All Doorstep Hub professionals and technicians are background-checked and carry official ID.',
            timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
            actionUrl: '/service-partner',
            actionText: 'Learn More'
        }
    ];

    const readSet = getReadNotificationIds();

    const merged = [...apiNotifications, ...defaultFeed].map(n => ({
        ...n,
        isRead: readSet.has(String(n.id)) || Boolean(n.read)
    }));

    // Filter by category
    const filtered = category === 'all'
        ? merged
        : merged.filter(n => n.category?.toLowerCase() === category.toLowerCase());

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
        notifications: paginated,
        total: filtered.length,
        unreadCount: merged.filter(n => !n.isRead).length,
        page,
        totalPages: Math.ceil(filtered.length / limit) || 1
    };
}
