'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Shield, Sparkles } from 'lucide-react';

function getLimitLabel(eligibility) {
  if (!eligibility) return null;
  if (eligibility.unlimited) return 'Unlimited visits for this service';

  const remaining = Number(eligibility.remaining ?? 0);
  const total = Number(eligibility.total ?? 0);

  if (total > 0) {
    return `${remaining} of ${total} visit${total === 1 ? '' : 's'} remaining for this service`;
  }
  if (eligibility.remaining != null) {
    return `${remaining} visit${remaining === 1 ? '' : 's'} remaining for this service`;
  }
  return null;
}

/**
 * Big app-style banner shown when the selected service is covered by the user's AMC.
 * Also shows when coverage exists but the service visit limit is exhausted.
 */
export function AmcCoverageBanner({
  eligibility,
  loading = false,
  className = '',
  compact = false,
  showLoading = false,
}) {
  if (loading && showLoading) {
    return (
      <div
        className={`animate-pulse rounded-2xl border border-emerald-100 bg-emerald-50/80 ${
          compact ? 'h-14' : 'h-36'
        } ${className}`}
        aria-hidden
      />
    );
  }

  if (loading) return null;
  if (!eligibility?.amcApplicable && !eligibility?.limitExhausted) return null;

  const planName = eligibility.planName || 'your AMC plan';
  const benefit = eligibility.benefitTitle || 'this service';
  const limitLabel = getLimitLabel(eligibility);
  const exhausted = !!eligibility.limitExhausted;

  if (exhausted) {
    if (compact) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 ${className}`}
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-950">AMC limit used for this service</p>
            <p className="mt-0.5 text-xs text-amber-900 leading-snug">
              Covered under <span className="font-semibold">{planName}</span>
              {benefit ? <> · {benefit}</> : null}
              {eligibility.total != null ? <> · {eligibility.total}/year used</> : null}
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={`relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white shadow-[0_18px_40px_-24px_rgba(217,119,6,0.65)] ${className}`}
      >
        <div className="relative p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
                AMC limit reached
              </p>
              <h3 className="mt-1 text-lg sm:text-xl font-bold leading-tight tracking-tight">
                This service is under AMC, but visits are used up
              </h3>
              <p className="mt-1.5 text-sm text-amber-50/95 leading-relaxed">
                <span className="font-semibold text-white">{benefit}</span> is part of your{' '}
                <span className="font-semibold text-white">{planName}</span> plan
                {eligibility.total != null ? (
                  <>
                    {' '}
                    ({eligibility.total} visit{Number(eligibility.total) === 1 ? '' : 's'}/year — all used).
                  </>
                ) : (
                  '.'
                )}{' '}
                You can still book this service at normal rates.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/account/amc"
              className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-50 transition-colors"
            >
              View my AMC
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 ${className}`}
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Shield className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-emerald-900">AMC available for this service</p>
          <p className="mt-0.5 text-xs text-emerald-800 leading-snug">
            Covered under <span className="font-semibold">{planName}</span>
            {benefit ? <> · {benefit}</> : null}
            {limitLabel ? <> · {limitLabel}</> : null}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-700">
            Optional — choose AMC cover for ₹0 or pay normally
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-600 via-[#037166] to-[#025951] text-white shadow-[0_18px_40px_-24px_rgba(3,113,102,0.7)] ${className}`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
              <Sparkles className="h-3 w-3" />
              AMC Active
            </p>
            <h3 className="mt-1 text-lg sm:text-xl font-bold leading-tight tracking-tight">
              You have this service under AMC
            </h3>
            <p className="mt-1.5 text-sm text-emerald-50/95 leading-relaxed">
              Good news — <span className="font-semibold text-white">{benefit}</span> is covered by your{' '}
              <span className="font-semibold text-white">{planName}</span> plan.
              {limitLabel ? (
                <>
                  {' '}
                  <span className="font-semibold text-white">{limitLabel}</span>.
                </>
              ) : null}{' '}
              You can choose AMC cover or pay the normal booking fee.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {limitLabel ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[12px] font-bold ring-1 ring-white/25">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {eligibility.unlimited
                ? 'Unlimited'
                : `${eligibility.remaining ?? 0}/${eligibility.total ?? '—'} left`}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/20">
            Optional: use AMC for ₹0 covered fee*
          </span>
          <Link
            href="/account/amc"
            className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#037166] hover:bg-emerald-50 transition-colors"
          >
            View my AMC
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-white/70">*Spare parts may be extra as per plan terms.</p>
      </div>
    </motion.div>
  );
}
