'use client';

import { PaymentFailurePage } from '@/components/services/PaymentFailurePage';
import { Suspense } from 'react';

function PaymentFailureContent() {
    return <PaymentFailurePage />;
}

export default function PaymentFailureRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <PaymentFailureContent />
        </Suspense>
    );
}
