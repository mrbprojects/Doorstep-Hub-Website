'use client';

/**
 * Soft shade + small Coming Soon chip over Spa / PG landing UIs.
 * Content stays visible underneath; clicks are blocked.
 */
export function ComingSoonPageOverlay({
  label = 'Coming Soon',
  children,
}) {
  return (
    <div className="relative min-h-[70vh]">
      <div className="pointer-events-none select-none opacity-[0.52]">{children}</div>
      <div
        className="absolute inset-0 z-[60] bg-white/25 backdrop-blur-[1.5px]"
        role="status"
        aria-label={label}
      >
        <div className="sticky top-[42vh] flex justify-center px-4">
          <span className="rounded-full bg-slate-900/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg ring-1 ring-white/25">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
