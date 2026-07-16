'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Info,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAmcPlanBySlug,
  fetchMyAmcPurchases,
  formatInr,
  initiateAmcPayment,
} from '@/lib/amcApi';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  city: '',
  message: '',
};

const fieldClass =
  'w-full rounded-lg border border-[#d7e8e4] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#037166] focus:ring-2 focus:ring-[#037166]/15';

export default function AmcPlanDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activePurchase, setActivePurchase] = useState(null);

  const userId = user?._id || user?.id || null;
  const phone = String(user?.phone || user?.mobile || '')
    .replace(/\D/g, '')
    .slice(-10);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const found = await fetchAmcPlanBySlug(slug);
        if (!cancelled) {
          if (found) setPlan(found);
          else setError('AMC plan not found');
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load plan');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (authLoading) return undefined;
    if (isAuthenticated && !userId && !phone) return undefined;

    let cancelled = false;
    (async () => {
      if (!isAuthenticated || !plan?._id || (!userId && !phone)) {
        if (!cancelled) setActivePurchase(null);
        return;
      }
      const mine = await fetchMyAmcPurchases({ userId, phone, token });
      const match = (mine.active || []).find(
        (p) => String(p.amcPlanId) === String(plan._id)
      );
      if (!cancelled) setActivePurchase(match || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, plan?._id, userId, phone, token]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || user.fullName || '',
      phone:
        prev.phone ||
        String(user.phone || user.mobile || '')
          .replace(/\D/g, '')
          .slice(-10) ||
        '',
      email: prev.email || user.email || '',
      city:
        prev.city ||
        user.city ||
        user.cityName ||
        user.address?.cityName ||
        user.address?.city ||
        '',
    }));
  }, [user]);

  const save = useMemo(() => {
    if (!plan) return 0;
    const mrp = Number(plan.mrp ?? plan.price ?? 0);
    const offer = Number(plan.offerPrice || 0);
    return (
      Number(plan.youSave || plan.savingsAmount || 0) || Math.max(0, mrp - offer)
    );
  }, [plan]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
  };

  const onActivate = async (e) => {
    e.preventDefault();
    setSubmitMsg({ type: '', text: '' });
    const name = form.name.trim();
    const phoneDigits = String(form.phone || '').replace(/\D/g, '').slice(-10);
    if (!name || phoneDigits.length !== 10) {
      setSubmitMsg({
        type: 'error',
        text: !name
          ? 'Name is required.'
          : 'Enter a valid 10-digit phone number for the person using this AMC.',
      });
      return;
    }
    if (!acceptedTerms) {
      setSubmitMsg({
        type: 'error',
        text: 'Please accept the Terms & Conditions to continue.',
      });
      return;
    }
    setSubmitting(true);
    try {
      const json = await initiateAmcPayment(
        {
          planId: plan?._id,
          slug: plan?.slug,
          name,
          phone: phoneDigits,
          email: form.email.trim(),
          city: form.city.trim(),
          message: form.message.trim(),
          userId: user?._id || user?.id || undefined,
        },
        token
      );
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'amc_pending_payment',
          JSON.stringify({
            txnid: json.txnid,
            purchaseId: json.purchaseId,
            slug: plan?.slug,
            planName: plan?.name,
          })
        );
        window.location.href =
          json.paymentUrl || `https://pay.easebuzz.in/pay/${json.access_key}`;
      }
    } catch (err) {
      setSubmitMsg({
        type: 'error',
        text: err?.message || 'Could not start payment.',
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[#f3faf8]">
        <div className="flex items-center gap-3 text-[#037166]">
          <span className="h-5 w-5 rounded-full border-2 border-[#037166]/30 border-t-[#037166] animate-spin" />
          <span className="text-sm font-medium tracking-wide">Loading plan</span>
        </div>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 bg-[#f3faf8]">
        <p className="text-red-600 text-center max-w-md">{error || 'Plan not found'}</p>
        <Link href="/amc" className="text-[#037166] font-semibold underline underline-offset-4">
          Back to AMC plans
        </Link>
      </main>
    );
  }

  const mrp = Number(plan.mrp ?? plan.price ?? 0);
  const offer = Number(plan.offerPrice || 0);

  return (
    <main className="min-h-screen bg-[#f3faf8] text-slate-900">
      <div className="relative overflow-hidden border-b border-[#d7e8e4]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(4,169,157,0.18),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(3,113,102,0.12),transparent_40%),linear-gradient(180deg,#e8f6f3_0%,#f3faf8_70%)]" />
        <div className="absolute inset-0 opacity-[0.35] bg-[linear-gradient(to_right,rgba(3,113,102,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(3,113,102,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 md:pt-12 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/amc"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#025951]/80 hover:text-[#037166] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All AMC plans
            </Link>

            <p className="mt-8 text-[11px] font-bold tracking-[0.22em] uppercase text-[#037166]">
              DoorstepHub AMC
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_240px] lg:grid-cols-[1fr_320px] gap-6 items-center">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0f2f2b] leading-[1.05]">
                    {plan.name}
                  </h1>
                  {activePurchase ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      Active
                    </span>
                  ) : null}
                </div>
                {plan.description ? (
                  <p className="text-base md:text-lg text-[#3d5f59] leading-relaxed max-w-xl">
                    {plan.description}
                  </p>
                ) : null}
                {activePurchase?.expireDate ? (
                  <p className="text-sm font-semibold text-emerald-700">
                    Your plan is active · valid till{' '}
                    {new Date(activePurchase.expireDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-end gap-6 pt-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5f8f89]">
                      Activation price
                    </p>
                    <div className="mt-1 flex items-end gap-3">
                      <span className="text-3xl md:text-4xl font-bold text-[#037166] tracking-tight">
                        {formatInr(offer)}
                      </span>
                      {mrp > offer ? (
                        <span className="pb-1.5 text-lg text-[#8aa8a3] line-through">
                          {formatInr(mrp)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {save > 0 ? (
                    <div className="pb-0.5">
                      <p className="text-sm font-semibold text-[#0f7a4d]">
                        You save {formatInr(save)}
                      </p>
                    </div>
                  ) : null}
                  <div className="pb-1 text-sm text-[#5f8f89] flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Valid {plan.validityDays || 365} days</span>
                  </div>
                </div>
              </div>

              {/* Showcase Image */}
              <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden relative border border-[#cfe8e3] bg-white shadow-sm flex-shrink-0">
                <img
                  src={plan.image ? (plan.image.startsWith('http') ? plan.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com'}/${plan.image}`) : 'https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg'}
                  alt={plan.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:items-start">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-[#0f2f2b]">What’s included</h2>
              <span className="h-px flex-1 bg-[#d7e8e4]" />
              <span className="text-xs font-medium text-[#5f8f89]">
                {(plan.benefits || []).length} benefits
              </span>
            </div>

            <ol className="space-y-0 divide-y divide-[#d7e8e4] border-y border-[#d7e8e4]">
              {(plan.benefits || []).map((b, index) => {
                const benefitTc = String(b.termsAndConditions || '').trim();
                const qtyLabel = b.unlimited
                  ? 'Unlimited'
                  : `${b.quantityPerYear || b.quantity || 0} included / year`;

                return (
                  <motion.li
                    key={b._id || b.key || b.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + index * 0.04, duration: 0.35 }}
                    className="py-5"
                  >
                    <div className="flex gap-4">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#037166]/10 text-[#037166]">
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-[17px] font-semibold text-[#0f2f2b]">{b.title}</p>
                          <span className="text-xs font-semibold tracking-wide uppercase text-[#037166]">
                            {qtyLabel}
                          </span>
                        </div>
                        {b.notes || b.description ? (
                          <p className="mt-1.5 text-sm text-[#4d6f69] leading-relaxed">
                            {b.notes || b.description}
                          </p>
                        ) : null}
                        {benefitTc ? (
                          <div className="mt-3 flex gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50 px-3.5 py-3">
                            <Info
                              className="w-4 h-4 shrink-0 text-amber-600 mt-0.5"
                              aria-hidden
                            />
                            <p className="text-[13px] leading-relaxed text-amber-950 whitespace-pre-line">
                              <span className="font-semibold">Terms &amp; conditions — </span>
                              {benefitTc}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>

            {plan.notes ? (
              <div className="mt-8 flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Plan note
                  </p>
                  <p className="mt-1 text-sm text-amber-950 whitespace-pre-line leading-relaxed">
                    {plan.notes}
                  </p>
                </div>
              </div>
            ) : null}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="lg:sticky lg:top-24"
          >
            <div className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-[#cfe8e3] bg-white shadow-[0_20px_50px_-36px_rgba(3,113,102,0.55)]">
              {activePurchase ? (
                <>
                  <div className="shrink-0 bg-gradient-to-br from-emerald-600 to-emerald-800 px-5 py-3.5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      Your plan
                    </p>
                    <p className="mt-0.5 text-lg font-bold">Active</p>
                  </div>
                  <div className="space-y-3 px-5 py-5">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      You already availed this AMC
                      {activePurchase.expireDate
                        ? ` · valid till ${new Date(activePurchase.expireDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : ''}
                      .
                    </p>
                    <ul className="space-y-2">
                      {(activePurchase.entitlements || []).map((e) => (
                        <li
                          key={e.title}
                          className="flex items-start justify-between gap-3 text-sm text-slate-700"
                        >
                          <span className="font-medium">{e.title}</span>
                          <span className="shrink-0 text-xs font-semibold text-emerald-700">
                            {e.unlimited
                              ? 'Unlimited'
                              : `${e.remainingQty ?? 0}/${e.totalQty ?? 0} left`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/account/amc"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      Go to my AMC
                    </Link>
                  </div>
                </>
              ) : (
                <>
              <div className="shrink-0 bg-gradient-to-br from-[#037166] to-[#025951] px-5 py-3.5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      Book Now
                    </p>
                    <p className="mt-0.5 text-sm text-white/85 truncate max-w-[220px]">
                      {plan.name}
                    </p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{formatInr(offer)}</p>
                </div>
              </div>

              <form
                onSubmit={onActivate}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
                  {isAuthenticated ? (
                    <p className="text-[11px] leading-snug text-[#025951] bg-[#e8f6f3] border border-[#b7d4ce] rounded-md px-2.5 py-2">
                      Details are filled from your login. You can edit them if this AMC is for someone else.
                    </p>
                  ) : (
                    <p className="text-[11px] leading-snug text-[#7a5a12] bg-[#fff8e8] border border-[#f0e0b8] rounded-md px-2.5 py-2">
                      Log in to save this AMC to your account. You can still enter details for the person using the plan.
                    </p>
                  )}

                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3d5f59]">
                    Customer details for this AMC
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[11px] font-semibold text-[#3d5f59]">
                        Full name *
                      </span>
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        className={fieldClass}
                        autoComplete="name"
                        placeholder="Who will use this AMC?"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[11px] font-semibold text-[#3d5f59]">
                        Phone *
                      </span>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        className={fieldClass}
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold text-[#3d5f59]">
                        Email
                      </span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        className={fieldClass}
                        autoComplete="email"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold text-[#3d5f59]">
                        City
                      </span>
                      <input
                        name="city"
                        value={form.city}
                        onChange={onChange}
                        className={fieldClass}
                        autoComplete="address-level2"
                      />
                    </label>
                  </div>

                  {plan.notes ? (
                    <p className="text-[11px] text-[#5f8f89] leading-snug">
                      <span className="font-semibold text-[#3d5f59]">Note: </span>
                      {plan.notes}
                    </p>
                  ) : null}

                  <label className="flex items-start gap-2 cursor-pointer select-none pt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-[#b7d4ce] text-[#037166] focus:ring-[#037166]"
                    />
                    <span className="text-[12px] leading-snug text-[#3d5f59]">
                      I agree to the Terms &amp; Conditions for this AMC plan.
                    </span>
                  </label>

                  {submitMsg.text ? (
                    <p
                      className={`text-xs ${
                        submitMsg.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {submitMsg.text}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 border-t border-[#e8f1ef] bg-white px-5 py-3">
                  <button
                    type="submit"
                    disabled={submitting || !acceptedTerms}
                    className="w-full rounded-lg bg-[#037166] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#025951] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? 'Redirecting…'
                      : `Book Now · ${formatInr(offer)}`}
                  </button>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#7a9a94]">
                    <Lock className="w-3 h-3" />
                    Secure payment via Easebuzz
                  </p>
                </div>
              </form>
                </>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
