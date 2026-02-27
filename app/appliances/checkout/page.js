'use client';

import { ServiceCartCheckoutPage } from '@/components/appliances/ServiceCartCheckoutPage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaymentFailureModal } from '@/components/ui/PaymentFailureModal';
import { useServiceCart } from '@/context/ServiceCartContext';

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const { clearCart } = useServiceCart();

    useEffect(() => {
        const savedAddress = sessionStorage.getItem('selected_address');
        if (savedAddress) {
            setSelectedAddress(JSON.parse(savedAddress));
        }
    }, []);

    useEffect(() => {
        const status = searchParams.get('status');
        if (status === 'success') {
            // Retrieve pending booking details
            const pendingBooking = sessionStorage.getItem('pending_booking');
            let bookingDetails = {};
            if (pendingBooking) {
                try {
                    bookingDetails = JSON.parse(pendingBooking);
                } catch (e) { console.error(e); }
                sessionStorage.removeItem('pending_booking');
            }

            // Clear Cart only on successful payment
            clearCart();

            // Construct redirect URL
            const orderId = bookingDetails.orderId || searchParams.get('txnid') || 'ORDER-ID-MISSING';
            const date = bookingDetails.bookedDate || '';
            const time = bookingDetails.bookedTime || '';

            // Format address string (exclude recipient name - that's a person, not address data)
            let addressStr = '';
            if (bookingDetails.address) {
                const addr = bookingDetails.address;
                const parts = [addr.flat, addr.area, addr.cityName].filter(Boolean);
                addressStr = parts.join(', ');
            }

            const params = new URLSearchParams();
            if (orderId) params.set('orderId', orderId);
            if (date) params.set('date', date);
            if (time) params.set('time', time);
            if (addressStr) params.set('address', addressStr);

            router.push(`/appliances/thank-you?${params.toString()}`);

        } else if (status === 'failure') {
            setShowFailureModal(true);
            // Cart remains intact for retry
        }
    }, [searchParams, router, clearCart]);

    const handleRetry = () => {
        setShowFailureModal(false);
        router.push('/appliances/cart');
    };

    return (
        <>
            <ServiceCartCheckoutPage
                selectedAddress={selectedAddress}
                onBack={() => router.push('/appliances/address')}
                onSuccess={(data) => {
                    router.push(`/appliances/thank-you?orderId=${data?.bookingId || data?.orderId || ''}&date=${data?.bookedDate || ''}&time=${data?.bookedTime || ''}`);
                }}
            />
            <PaymentFailureModal
                isOpen={showFailureModal}
                onRetry={handleRetry}
                onChangeMethod={handleRetry}
                onClose={() => setShowFailureModal(false)}
            />
        </>
    );
}

import { Suspense } from 'react';

export default function CheckoutRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
