'use client';

import { ThankYouPage } from '@/components/services/ThankYouPage';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackBookingCompleted } from '@/lib/leadTracking';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState(null);

    useEffect(() => {
        const savedAddress = sessionStorage.getItem('selected_address');
        const sessionAddress = savedAddress ? JSON.parse(savedAddress) : null;

        // Check for CRM pending booking in sessionStorage
        const crmPendingRaw = sessionStorage.getItem('crm_pending_booking');
        const crmPending = crmPendingRaw ? JSON.parse(crmPendingRaw) : null;

        // Prioritize URL params for social/redirect cases, fallback to sessionStorage
        const rawOrderId = searchParams.get('orderId') || crmPending?.bookingId || '';
        const urlAddress = searchParams.get('address') || crmPending?.address || '';

        // Format Date if it exists
        const rawDate = searchParams.get('date') || crmPending?.date || sessionStorage.getItem('last_booking_date');
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
                if (i === 0 || segments[i] !== segments[i - 1]) {
                    uniqueSegments.push(segments[i]);
                }
            }

            // Also check for repeated patterns (e.g., "A, B, C, A, B, C")
            let finalSegments = uniqueSegments;
            for (let patternLength = 1; patternLength <= Math.floor(uniqueSegments.length / 2); patternLength++) {
                const midPoint = Math.floor(uniqueSegments.length / 2);
                let isRepeating = true;

                for (let i = 0; i < patternLength && (midPoint - patternLength + i) >= 0 && (midPoint + i) < uniqueSegments.length; i++) {
                    if (uniqueSegments[midPoint - patternLength + i] !== uniqueSegments[midPoint + i]) {
                        isRepeating = false;
                        break;
                    }
                }

                if (isRepeating && midPoint >= patternLength) {
                    finalSegments = [
                        ...uniqueSegments.slice(0, midPoint),
                        ...uniqueSegments.slice(midPoint + patternLength)
                    ];
                    break;
                }
            }

            cleanAddress = finalSegments.join(', ');
        }

        const displayAddress = cleanAddress || (sessionAddress ? `${sessionAddress.flat}, ${sessionAddress.area}, ${sessionAddress.cityName}` : '');
        const timeSlot = searchParams.get('time') || crmPending?.time || sessionStorage.getItem('last_booking_time') || '';
        const serviceName = crmPending?.subcategory || crmPending?.category || '';

        // If rawOrderId is a 24-char MongoDB ObjectId, format a clean customer ID:
        const isMongoId = /^[a-f\d]{24}$/i.test(rawOrderId);
        const initialDisplayId = isMongoId ? `DH-${rawOrderId.slice(-8).toUpperCase()}` : rawOrderId;

        setBookingDetails({
            orderId: initialDisplayId,
            rawOrderId: rawOrderId,
            date: formattedDate,
            time: timeSlot,
            address: displayAddress,
            serviceName: serviceName,
            referalCode: searchParams.get('referalCode') || '',
        });

        // Try to fetch verified server booking details if available
        if (rawOrderId) {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
            if (apiBase) {
                fetch(`${apiBase}/web/crm-booking/booking-details/${rawOrderId}`)
                    .then(res => res.json())
                    .then(json => {
                        if (json?.success && json?.data) {
                            const b = json.data;
                            setBookingDetails(prev => ({
                                ...prev,
                                orderId: b.orderId || prev.orderId,
                                date: b.date || prev.date,
                                time: b.time || prev.time,
                                address: b.address || prev.address,
                                serviceName: b.serviceName || prev.serviceName,
                                status: b.status || 'confirmed',
                                paymentStatus: b.paymentStatus || 'paid',
                            }));
                        }
                    })
                    .catch(() => {});
            }
        }

        if (rawOrderId) {
            trackBookingCompleted(rawOrderId, { vertical: 'services' });
        }

        // Clear booking session data after successful creation
        sessionStorage.removeItem('pg_booking_data');
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
