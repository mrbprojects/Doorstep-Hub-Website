'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { checkAmcEligibility } from '@/lib/amcApi';

/**
 * Checks whether the logged-in user's active AMC covers the given service.
 * @param {{ serviceId?: string, categoryId?: string, subcategoryId?: string, enabled?: boolean }} opts
 */
export function useAmcEligibility({
  serviceId,
  categoryId,
  subcategoryId,
  enabled = true,
} = {}) {
  const { user, token, isAuthenticated } = useAuth();
  const userId = user?._id || user?.id || null;
  const phone = String(user?.phone || user?.mobile || '')
    .replace(/\D/g, '')
    .slice(-10);

  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const sid = serviceId ? String(serviceId) : '';
    if (!enabled || !isAuthenticated || (!userId && !phone) || !sid) {
      setEligibility(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    (async () => {
      const result = await checkAmcEligibility({
        userId,
        phone: phone || undefined,
        serviceId: sid,
        categoryId: categoryId ? String(categoryId) : undefined,
        subcategoryId: subcategoryId ? String(subcategoryId) : undefined,
        token,
      });
      if (!cancelled) {
        const show =
          result?.amcApplicable || result?.limitExhausted ? result : null;
        setEligibility(show);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, isAuthenticated, userId, phone, serviceId, categoryId, subcategoryId, token]);

  return {
    loading,
    amcApplicable: !!eligibility?.amcApplicable,
    limitExhausted: !!eligibility?.limitExhausted,
    eligibility,
  };
}
