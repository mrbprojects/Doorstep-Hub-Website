'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';

function PaymentResultInner() {
  const params = useSearchParams();
  const status = String(params.get('status') || '').toLowerCase();
  const txnid = params.get('txnid') || '';
  const slug = params.get('slug') || '';
  const success = status === 'success';

  const [planName, setPlanName] = useState('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('amc_pending_payment');
      if (raw) {
        const parsed = JSON.parse(raw);
        setPlanName(parsed?.planName || '');
        sessionStorage.removeItem('amc_pending_payment');
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#eef8f6] via-white to-[#f8fafc]">
      <div className="max-w-md w-full rounded-3xl border border-[#cfe8e3] bg-white p-8 text-center shadow-sm">
        {success ? (
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
        ) : (
          <XCircle className="w-14 h-14 text-red-500 mx-auto" />
        )}
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {success ? 'AMC activated' : 'Payment failed'}
        </h1>
        <p className="mt-2 text-slate-600 text-sm">
          {success
            ? `${planName || 'Your AMC plan'} is now active. You can use included benefits on matching services.`
            : 'Your payment could not be completed. You can try activating again.'}
        </p>
        {txnid ? (
          <p className="mt-3 text-xs text-slate-400">Txn: {txnid}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          {success ? (
            <Link
              href="/account/amc"
              className="rounded-xl bg-[#037166] px-4 py-3 text-sm font-semibold text-white"
            >
              View in my account
            </Link>
          ) : (
            <Link
              href={slug ? `/amc/${slug}` : '/amc'}
              className="rounded-xl bg-[#037166] px-4 py-3 text-sm font-semibold text-white"
            >
              Try again
            </Link>
          )}
          <Link href="/amc" className="text-sm font-medium text-[#037166] underline">
            Browse Book AMC Services
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AmcPaymentResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-[#037166]">
          Loading…
        </main>
      }
    >
      <PaymentResultInner />
    </Suspense>
  );
}
