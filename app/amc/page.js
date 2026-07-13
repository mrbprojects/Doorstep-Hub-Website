'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { fetchAmcPlans, formatInr } from '@/lib/amcApi';

export default function AmcPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchAmcPlans();
        if (!cancelled) setPlans(list);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load AMC plans');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
            return (
              <motion.article
                key={plan._id || plan.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="relative rounded-3xl border border-[#cfe8e3] bg-white/90 p-6 md:p-8 shadow-[0_20px_60px_-40px_rgba(3,113,102,0.45)]"
              >
                {plan.badge ? (
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
                  {(plan.benefits || []).slice(0, 6).map((b) => (
                    <li key={b._id || b.key || b.title} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#04a99d]" />
                      <span>
                        <span className="font-medium">{b.title}</span>
                        {b.unlimited
                          ? ' — Unlimited'
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
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#037166] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#025951]"
                >
                  View details & enquire
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
