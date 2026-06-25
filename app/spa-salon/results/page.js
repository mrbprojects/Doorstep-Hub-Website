import { ResultsPage } from '@/components/spasalon/ResultsPage';

import { Suspense } from 'react';

export default function SpaSalonResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <ResultsPage />
        </Suspense>
    );
}
