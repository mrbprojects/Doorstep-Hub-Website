'use client';

import { Button } from '@/components/ui/button';

function pretty(value) {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function MyProfilePage({ profile, loading, error, onRefresh }) {
  const rows = [
    ['Name', profile?.name || profile?.fullName],
    ['Email', profile?.email],
    ['Phone', profile?.phone || profile?.mobile],
    ['Service', profile?.serviceName || profile?.service?.name],
    ['Category', profile?.categoryName || profile?.category?.name],
    ['Subcategory', profile?.subcategoryName || profile?.subcategory?.name],
    ['Country', profile?.countryName || profile?.country?.name],
    ['State', profile?.stateName || profile?.state?.name],
    ['City', profile?.cityName || profile?.city?.name],
    ['Zone', profile?.zoneName || profile?.zone?.name],
    ['Address', profile?.address],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white">My Profile</h3>
        <Button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="h-9 bg-[#04a99d] text-white hover:bg-[#037166]"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/20 bg-white/10 p-3">
            <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
            <p className="mt-1 break-words text-sm text-white">{pretty(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
