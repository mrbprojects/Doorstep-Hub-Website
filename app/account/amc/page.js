'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAmcPlans, fetchMyAmcPurchases, formatInr } from '@/lib/amcApi';

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function AccountAmcPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [myAmc, setMyAmc] = useState({ active: [], purchases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?._id || user?.id || null;
  const phone = String(user?.phone || user?.mobile || '')
    .replace(/\D/g, '')
    .slice(-10);

  useEffect(() => {
    // Wait until auth finishes so we don't refetch on every token/user settle step
    if (authLoading) return undefined;
    // Logged in but profile not ready yet — wait (avoids duplicate /my + /plans calls)
    if (isAuthenticated && !userId && !phone) return undefined;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchAmcPlans();
        let purchases = { active: [], purchases: [] };
        if (isAuthenticated && (userId || phone)) {
          purchases = await fetchMyAmcPurchases({ userId, phone, token });
        }
        if (!cancelled) {
          setPlans(list);
          setMyAmc(purchases);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load AMC plans');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, userId, phone, token]);

  const activeByPlanId = useMemo(() => {
    const map = new Map();
    (myAmc.active || []).forEach((p) => {
      if (p?.amcPlanId) map.set(String(p.amcPlanId), p);
    });
    return map;
  }, [myAmc]);

  const hasAnyActive = (myAmc.active || []).length > 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#037166]/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#037166]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">AMC Plans</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {hasAnyActive
                ? 'Your active AMC is highlighted below. Browse other plans anytime.'
                : 'Browse annual maintenance packages and enquire for activation.'}
            </p>
          </div>
        </div>
      </motion.div>

      {hasAnyActive ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          You already have an <span className="font-bold">active AMC</span>
          {(myAmc.active[0]?.planName && (
            <>
              : <span className="font-semibold">{myAmc.active[0].planName}</span>
            </>
          )) ||
            null}
          {myAmc.active[0]?.expireDate ? (
            <> · valid till {formatDate(myAmc.active[0].expireDate)}</>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
        </div>
      ) : error ? (
        <div className="bg-white border border-red-100 rounded-2xl p-6 text-red-600 text-sm">{error}</div>
      ) : plans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-500 text-sm">
          No AMC plans available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const mrp = Number(plan.mrp ?? 0);
            const offer = Number(plan.offerPrice ?? 0);
            const save = Math.max(0, mrp - offer);
            const purchase = activeByPlanId.get(String(plan._id));
            const isActive = !!purchase;

            return (
              <Link
                key={plan._id || plan.slug}
                href={`/amc/${plan.slug}`}
                className={`relative bg-white rounded-2xl overflow-hidden transition-all flex flex-col ${
                  isActive
                    ? 'border-2 border-emerald-500 shadow-md shadow-emerald-100/80 ring-1 ring-emerald-200'
                    : 'border border-gray-200 hover:border-[#037166]/30 hover:shadow-md'
                }`}
              >
                {isActive ? (
                  <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white z-10">
                    Active
                  </span>
                ) : null}

                {/* Banner Image */}
                <div className="w-full h-40 bg-gray-50 relative border-b border-gray-100 flex-shrink-0">
                  <img
                    src={plan.image ? (plan.image.startsWith('http') ? plan.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com'}/${plan.image}`) : 'https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg'}
                    alt={plan.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <p className="font-bold text-gray-900 text-base line-clamp-1">{plan.name}</p>
                  {plan.description ? (
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{plan.description}</p>
                  ) : null}

                  {isActive && purchase?.expireDate ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-800">
                      Valid till {formatDate(purchase.expireDate)}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-xl font-extrabold text-[#037166]">{formatInr(offer)}</span>
                    {mrp > offer ? (
                      <span className="text-sm text-gray-400 line-through pb-0.5">{formatInr(mrp)}</span>
                    ) : null}
                  </div>
                  {save > 0 ? (
                    <p className="text-xs font-medium text-emerald-700 mt-1">Save {formatInr(save)}</p>
                  ) : null}

                  <ul className="mt-4 space-y-1.5 flex-grow">
                    {(isActive && purchase?.entitlements?.length
                      ? purchase.entitlements
                      : plan.benefits || []
                    )
                      .slice(0, 4)
                      .map((b) => {
                        const title = b.title;
                        const unlimited = !!b.unlimited;
                        const remaining =
                          b.remainingQty != null ? b.remainingQty : b.quantityPerYear;
                        const total = b.totalQty != null ? b.totalQty : b.quantityPerYear;
                        return (
                          <li key={b._id || title} className="flex gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[#04a99d] shrink-0" />
                            <span>
                              {title}
                              {unlimited
                                ? ' (Unlimited)'
                                : isActive && remaining != null && total != null
                                  ? ` (${remaining}/${total} left)`
                                  : total
                                    ? ` (${total}/yr)`
                                    : ''}
                            </span>
                          </li>
                        );
                      })}
                  </ul>

                  <p
                    className={`mt-4 text-sm font-semibold ${
                      isActive ? 'text-emerald-700' : 'text-[#037166]'
                    }`}
                  >
                    {isActive ? 'View active plan →' : 'View details →'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
