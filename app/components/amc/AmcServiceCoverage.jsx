'use client';

import { useAmcEligibility } from '@/hooks/useAmcEligibility';
import { AmcCoverageBanner } from '@/components/amc/AmcCoverageBanner';

/**
 * Checks AMC coverage for a selected service and shows the coverage banner when applicable.
 */
export function AmcServiceCoverage({
  serviceId,
  categoryId,
  subcategoryId,
  compact = false,
  className = '',
  enabled = true,
}) {
  const { loading, eligibility } = useAmcEligibility({
    serviceId,
    categoryId,
    subcategoryId,
    enabled: enabled && Boolean(serviceId),
  });

  return (
    <AmcCoverageBanner
      eligibility={eligibility}
      loading={loading}
      compact={compact}
      className={className}
    />
  );
}
