'use client';

import { ThankYouPage } from '@/components/appliances/ThankYouPage';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackBookingCompleted } from '@/lib/leadTracking';

function getInitialBookingDetails(searchParams) {
    if (typeof window === 'undefined') return null;
    try {
        const savedAddress = sessionStorage.getItem('selected_address');
        const sessionAddress = savedAddress ? JSON.parse(savedAddress) : null;

        const crmPendingRaw = sessionStorage.getItem('crm_pending_booking');
        const crmPending = crmPendingRaw ? JSON.parse(crmPendingRaw) : null;

        const rawOrderId = searchParams.get('orderId') || crmPending?.bookingId || '';
        const urlAddress = searchParams.get('address') || crmPending?.address || '';

        const rawDate = searchParams.get('date') || crmPending?.date || sessionStorage.getItem('last_booking_date');
        let formattedDate = rawDate || 'Confirmed';

        if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const [year, month, day] = rawDate.split('-');
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            formattedDate = `${day} ${months[parseInt(month) - 1]} ${year}`;
        }

        let cleanAddress = urlAddress;
        if (urlAddress) {
            const segments = urlAddress.split(',').map(s => s.trim()).filter(Boolean);
            const seen = new Set();
            const uniqueSegments = [];

            for (const seg of segments) {
                const normalized = seg.toLowerCase();
                if (seen.has(normalized)) continue;
                if (/^.+\s-\s.+\s-\s\d+$/.test(seg)) continue;
                seen.add(normalized);
                uniqueSegments.push(seg);
            }

            cleanAddress = uniqueSegments.join(', ');
        }

        const displayAddress = cleanAddress
            ? cleanAddress
            : sessionAddress
                ? [sessionAddress.flat, sessionAddress.area, sessionAddress.cityName].filter(Boolean).join(', ')
                : '';

        const timeSlot = searchParams.get('time') || crmPending?.time || sessionStorage.getItem('last_booking_time') || '';
        const serviceName = crmPending?.subcategory || crmPending?.category || '';

        const isMongoId = /^[a-f\d]{24}$/i.test(rawOrderId);
        const initialDisplayId = isMongoId ? `DH-${rawOrderId.slice(-8).toUpperCase()}` : rawOrderId;

        return {
            orderId: initialDisplayId,
            rawOrderId: rawOrderId,
            date: formattedDate,
            time: timeSlot,
            address: displayAddress,
            serviceName: serviceName,
            referalCode: searchParams.get('referalCode') || ''
        };
    } catch {
        return null;
    }
}

function ThankYouContent() {
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState(() => getInitialBookingDetails(searchParams));

    useEffect(() => {
        const rawOrderId = searchParams.get('orderId') || bookingDetails?.rawOrderId;
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
                                orderId: b.orderId || prev?.orderId,
                                date: b.date || prev?.date,
                                time: b.time || prev?.time,
                                address: b.address || prev?.address,
                                serviceName: b.serviceName || prev?.serviceName,
                                status: b.status || 'confirmed',
                                paymentStatus: b.paymentStatus || 'paid',
                            }));
                        }
                    })
                    .catch(() => {});
            }
            trackBookingCompleted(rawOrderId, { vertical: 'appliances' });
        }
    }, [searchParams, bookingDetails?.rawOrderId]);

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
