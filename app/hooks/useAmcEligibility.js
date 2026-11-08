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

  const sid = serviceId ? String(serviceId) : '';
  const canCheck = Boolean(enabled && isAuthenticated && (userId || phone) && sid);

  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  const [prevCanCheck, setPrevCanCheck] = useState(canCheck);
  if (prevCanCheck !== canCheck) {
    setPrevCanCheck(canCheck);
    if (!canCheck) {
      setEligibility(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (!canCheck) {
      return undefined;
    }

    (async () => {
      try {
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
        }
      } catch {
        if (!cancelled) setEligibility(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCheck, userId, phone, sid, categoryId, subcategoryId, token]);

  return {
    loading,
    amcApplicable: !!eligibility?.amcApplicable,
    limitExhausted: !!eligibility?.limitExhausted,
    eligibility,
  };
}
