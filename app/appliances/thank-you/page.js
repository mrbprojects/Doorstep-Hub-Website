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

        // Prioritize URL params for social/redirect cases, fallback to sessionStorage
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
            // Split by comma to get all segments
            const segments = urlAddress.split(',').map(s => s.trim()).filter(s => s);

            // Remove consecutive duplicate segments
            const uniqueSegments = [];
            for (let i = 0; i < segments.length; i++) {
                // Check if this segment is the same as the previous one
                if (i === 0 || segments[i] !== segments[i - 1]) {
                    uniqueSegments.push(segments[i]);
                }
            }

            // Also check for repeated patterns (e.g., "A, B, C, A, B, C")
            // Find the longest repeating pattern from the middle
            let finalSegments = uniqueSegments;
            for (let patternLength = 1; patternLength <= Math.floor(uniqueSegments.length / 2); patternLength++) {
                const midPoint = Math.floor(uniqueSegments.length / 2);
                let isRepeating = true;

                // Check if segments repeat around the middle
                for (let i = 0; i < patternLength && (midPoint - patternLength + i) >= 0 && (midPoint + i) < uniqueSegments.length; i++) {
                    if (uniqueSegments[midPoint - patternLength + i] !== uniqueSegments[midPoint + i]) {
                        isRepeating = false;
                        break;
                    }
                }

                if (isRepeating && midPoint >= patternLength) {
                    // Remove the repeated pattern
                    finalSegments = [
                        ...uniqueSegments.slice(0, midPoint),
                        ...uniqueSegments.slice(midPoint + patternLength)
                    ];
                    break;
                }
            }

            cleanAddress = finalSegments.join(', ');
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
