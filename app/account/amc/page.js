'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';
import { fetchAmcPlans, formatInr } from '@/lib/amcApi';

export default function AccountAmcPage() {
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
              Browse annual maintenance packages and enquire for activation.
            </p>
          </div>
        </div>
      </motion.div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const mrp = Number(plan.mrp ?? 0);
            const offer = Number(plan.offerPrice ?? 0);
            const save = Math.max(0, mrp - offer);
            return (
              <Link
                key={plan._id || plan.slug}
                href={`/amc/${plan.slug}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all"
              >
                <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                {plan.description ? (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{plan.description}</p>
                ) : null}
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-xl font-extrabold text-[#037166]">{formatInr(offer)}</span>
                  {mrp > offer ? (
                    <span className="text-sm text-gray-400 line-through pb-0.5">{formatInr(mrp)}</span>
                  ) : null}
                </div>
                {save > 0 ? (
                  <p className="text-xs font-medium text-emerald-700 mt-1">Save {formatInr(save)}</p>
                ) : null}
                <ul className="mt-4 space-y-1.5">
                  {(plan.benefits || []).slice(0, 4).map((b) => (
                    <li key={b._id || b.title} className="flex gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[#04a99d] shrink-0" />
                      <span>
                        {b.title}
                        {b.unlimited
                          ? ' (Unlimited)'
                          : b.quantityPerYear
                            ? ` (${b.quantityPerYear}/yr)`
                            : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-semibold text-[#037166]">View details →</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
