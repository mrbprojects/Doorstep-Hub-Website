'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Shield, Sparkles } from 'lucide-react';
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

export default function AmcPlansPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [myActive, setMyActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?._id || user?.id || null;
  const phone = String(user?.phone || user?.mobile || '')
    .replace(/\D/g, '')
    .slice(-10);

  useEffect(() => {
    if (authLoading) return undefined;
    if (isAuthenticated && !userId && !phone) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const list = await fetchAmcPlans();
        let active = [];
        if (isAuthenticated && (userId || phone)) {
          const mine = await fetchMyAmcPurchases({ userId, phone, token });
          active = mine.active || [];
        }
        if (!cancelled) {
          setPlans(list);
          setMyActive(active);
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
    myActive.forEach((p) => {
      if (p?.amcPlanId) map.set(String(p.amcPlanId), p);
    });
    return map;
  }, [myActive]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#eef8f6] via-white to-[#f8fafc]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(4,169,157,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(3,113,102,0.12),transparent_35%)]" />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-10 md:pt-24 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#037166] mb-3">
              <Shield className="w-4 h-4" />
              DoorstepHub AMC
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Annual Maintenance that actually covers your home services
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Choose an AMC pack, then use included benefits only on the matching on-demand services when you book.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        {loading && (
          <div className="py-20 text-center text-[#037166] font-medium">Loading AMC plans…</div>
        )}
        {!loading && error && (
          <div className="py-16 text-center text-red-600 max-w-xl mx-auto">{error}</div>
        )}
        {!loading && !error && plans.length === 0 && (
          <div className="py-16 text-center text-slate-500">No AMC plans available yet.</div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, idx) => {
            const mrp = Number(plan.mrp ?? plan.price ?? 0);
            const offer = Number(plan.offerPrice || 0);
            const save =
              Number(plan.youSave || plan.savingsAmount || 0) ||
              Math.max(0, mrp - offer);
            const purchase = activeByPlanId.get(String(plan._id));
            const isActive = !!purchase;

            return (
              <motion.article
                key={plan._id || plan.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className={`relative rounded-3xl bg-white/90 p-6 md:p-8 shadow-[0_20px_60px_-40px_rgba(3,113,102,0.45)] ${
                  isActive
                    ? 'border-2 border-emerald-500 ring-1 ring-emerald-200'
                    : 'border border-[#cfe8e3]'
                }`}
              >
                {isActive ? (
                  <span className="absolute top-5 right-5 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Active
                  </span>
                ) : plan.badge ? (
                  <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-[#037166] px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                    {plan.badge}
                  </span>
                ) : null}

                <h2 className="text-2xl font-bold text-slate-900 pr-24">{plan.name}</h2>
                {plan.tagline || plan.description ? (
                  <p className="mt-2 text-slate-600 line-clamp-2">
                    {plan.tagline || plan.description}
                  </p>
                ) : null}

                {isActive && purchase?.expireDate ? (
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    Valid till {formatDate(purchase.expireDate)}
                  </p>
                ) : null}

                <div className="mt-5 flex items-end gap-3">
                  <span className="text-3xl font-bold text-[#037166]">{formatInr(offer)}</span>
                  {mrp > offer ? (
                    <span className="pb-1 text-slate-400 line-through">{formatInr(mrp)}</span>
                  ) : null}
                </div>
                {save > 0 ? (
                  <p className="mt-1 text-sm font-medium text-emerald-700">You save {formatInr(save)}</p>
                ) : null}
                <p className="mt-1 text-sm text-slate-500">
                  Validity: {plan.validityDays || 365} days
                </p>

                <ul className="mt-6 space-y-2.5">
                  {(isActive && purchase?.entitlements?.length
                    ? purchase.entitlements
                    : plan.benefits || []
                  )
                    .slice(0, 6)
                    .map((b) => (
                      <li key={b._id || b.key || b.title} className="flex gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#04a99d]" />
                        <span>
                          <span className="font-medium">{b.title}</span>
                          {b.unlimited
                            ? ' — Unlimited'
                            : isActive && b.remainingQty != null && b.totalQty != null
                              ? ` — ${b.remainingQty}/${b.totalQty} left`
                              : b.quantityPerYear || b.quantity
                                ? ` — ${b.quantityPerYear || b.quantity} included`
                                : ''}
                        </span>
                      </li>
                    ))}
                </ul>

                {plan.notes ? (
                  <p className="mt-4 text-xs text-slate-500">{plan.notes}</p>
                ) : null}

                <Link
                  href={`/amc/${plan.slug}`}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                    isActive
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#037166] hover:bg-[#025951]'
                  }`}
                >
                  {isActive ? 'View active plan' : 'View details & enquire'}
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
