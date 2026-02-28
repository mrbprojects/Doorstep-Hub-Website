'use client';

import { ThankYouPage } from '@/components/appliances/ThankYouPage';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState(null);

    useEffect(() => {
        const savedAddress = sessionStorage.getItem('selected_address');
        const sessionAddress = savedAddress ? JSON.parse(savedAddress) : null;

        const urlAddress = searchParams.get('address');

        // Format Date if it exists
        const rawDate = searchParams.get('date') || sessionStorage.getItem('last_booking_date');
        let formattedDate = rawDate || 'Confirmed';

        if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const [year, month, day] = rawDate.split('-');
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            formattedDate = `${day} ${months[parseInt(month) - 1]} ${year}`;
        }

        // Clean up duplicated address parts from URL
        let cleanAddress = urlAddress;
        if (urlAddress) {
            const segments = urlAddress.split(',').map(s => s.trim()).filter(s => s);
            const seen = new Set();
            const uniqueSegments = [];

            for (const seg of segments) {
                const normalized = seg.toLowerCase();
                // Skip segments already seen
                if (seen.has(normalized)) continue;
                // Skip trailing "City - State - PIN" style suffix (e.g. "Hyderabad - Telangana - 500082")
                if (/^.+\s-\s.+\s-\s\d+$/.test(seg)) continue;
                seen.add(normalized);
                uniqueSegments.push(seg);
            }

            cleanAddress = uniqueSegments.join(', ');
        }

        // Use URL address if available (already cleaned), otherwise build from sessionStorage
        const displayAddress = cleanAddress
            ? cleanAddress
            : sessionAddress
                ? [sessionAddress.flat, sessionAddress.area, sessionAddress.cityName].filter(Boolean).join(', ')
                : '';

        setBookingDetails({
            orderId: searchParams.get('orderId') || '',
            date: formattedDate,
            time: searchParams.get('time') || sessionStorage.getItem('last_booking_time') || '',
            address: displayAddress,
            referalCode: searchParams.get('referalCode') || ''
        });
    }, [searchParams]);

    return <ThankYouPage bookingDetails={bookingDetails} />;
}

import { Suspense } from 'react';

export default function ThankYouRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <ThankYouContent />
        </Suspense>
    );
}
