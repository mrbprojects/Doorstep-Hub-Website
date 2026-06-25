'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { applyLeadToken } from '@/lib/leadTracking';

function LeadResumeHandlerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get('leadToken');
    if (!token) return undefined;

    let cancelled = false;

    (async () => {
      await applyLeadToken(token);
      if (cancelled) return;

      const params = new URLSearchParams(searchParams.toString());
      params.delete('leadToken');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, pathname, router]);

  return null;
}

export function LeadResumeHandler() {
  return (
    <Suspense fallback={null}>
      <LeadResumeHandlerInner />
    </Suspense>
  );
}
