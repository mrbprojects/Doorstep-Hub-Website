'use client';

import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';

// Resolves backend relative image URLs to absolute CDN URLs
function resolveImage(src) {
  if (!src) return '';
  if (typeof src !== 'string') return '';
  if (src.startsWith('http')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com';
  return `${baseUrl}/${src.replace(/^\//, '')}`;
}

export default function AstrologyConsultationSection({
  services = [],
  loading = false,
  onOpenService,
  onViewAll,
}) {
  // Filter for astrology & consultation providers or take the top verified experts
  const matchedConsultants = services.filter((s) => {
    const text = `${s.business_name || ''} ${s.serviceName || ''} ${s.bio || ''} ${s.description || ''}`.toLowerCase();
    return (
      text.includes('astrology') ||
      text.includes('consultation') ||
      text.includes('jyotish') ||
      text.includes('kundali') ||
      text.includes('horoscope') ||
      text.includes('uma maheswara') ||
      text.includes('sailesh') ||
      text.includes('vedic')
    );
  });

  const consultationProviders =
    matchedConsultants.length >= 3
      ? matchedConsultants.slice(0, 3)
      : services.slice(0, 3);

  return (
    <section aria-label="Astrology & Religious Consultation" className="w-full py-8 sm:py-12 bg-white">
      <div className="container max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Outer Card Container */}
        <div className="rounded-[28px] sm:rounded-[32px] overflow-hidden border border-[#EAD8C3] bg-gradient-to-r from-[#FFF5EC] via-[#FFF9F3] to-[#FFFDF9] p-5 sm:p-7 lg:p-9 shadow-[0_10px_30px_rgba(101,11,80,0.04)]">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[#E96B18] text-base sm:text-lg">🪷</span>
                <h2 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#4C124D] tracking-tight">
                  Astrology & Religious Consultation
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#685D68] max-w-xl">
                Expert guidance for your spiritual, career and life decisions
              </p>
            </div>

            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#650B50] hover:bg-[#440A40] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#650B50]"
            >
              <span>View All Consultants</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Left Illustration + Right 3 Provider Cards */}
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            {/* Left Devotional Astrology Artwork */}
            <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 flex items-center justify-center">
              <div className="relative w-48 h-40 sm:w-56 sm:h-48 lg:w-64 lg:h-52">
                <Image
                  src="/religious/astrology-consultation-art.webp"
                  alt="Vedic Astrology Mandala and Sacred Manuscript"
                  fill
                  className="object-contain drop-shadow-sm select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Right Provider Cards Grid */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {loading && consultationProviders.length === 0 && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`consult-skel-${i}`}
                      className="h-28 rounded-2xl bg-white/70 border border-[#EFE5D8] animate-pulse p-4"
                    />
                  ))}
                </>
              )}

              {!loading && consultationProviders.length === 0 && (
                <div className="col-span-full py-8 text-center bg-white/80 rounded-2xl border border-[#EFE5D8]">
                  <p className="text-sm font-semibold text-[#4C124D]">
                    Verified consultants will be listed here shortly.
                  </p>
                </div>
              )}

              {consultationProviders.map((provider, idx) => {
                const businessName =
                  provider.business_name ||
                  provider.serviceName ||
                  `${provider.firstName || ''} ${provider.lastName || ''}`.trim() ||
                  (idx === 0
                    ? 'Satya Sailesh Pooja Services'
                    : idx === 1
                    ? 'Sree Uma Maheswara Astrology & Allied'
                    : 'Sri Lalitha Pooja Services');

                const description =
                  provider.description ||
                  provider.bio?.replace(/<[^>]+>/g, '') ||
                  (idx === 0
                    ? 'Divine spiritual services with traditional poojas.'
                    : idx === 1
                    ? 'Trusted Vedic astrology and pooja services.'
                    : 'Expert religious guidance and rituals.');

                const startingPrice =
                  provider.startingAt ||
                  provider.serviceBookingCost ||
                  provider.BasePrice ||
                  (idx === 1 ? 999 : 499);

                const logoSrc = resolveImage(provider.image || provider.logo || provider.profileImage);

                return (
                  <article
                    key={provider._id || idx}
                    onClick={() => onOpenService && onOpenService(provider)}
                    className="group flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EFE5D8] hover:border-[#E8B34E] hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E8B34E]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenService && onOpenService(provider);
                      }
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D4] border border-[#F0E4D4] shrink-0 relative flex items-center justify-center">
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={businessName}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#E96B18]">🕉️</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm sm:text-[15px] text-[#30252C] group-hover:text-[#E96B18] transition-colors line-clamp-1 leading-snug">
                        {businessName}
                      </h3>
                      <p className="text-xs text-[#685D68] line-clamp-2 mt-0.5 leading-tight">
                        {description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs font-bold text-[#E96B18]">
                          Starting at ₹{startingPrice.toLocaleString('en-IN')}
                        </span>
                        {provider.avgRating && (
                          <span className="inline-flex items-center text-[11px] font-semibold text-[#685D68]">
                            <Star className="w-3 h-3 text-[#E8B34E] fill-[#E8B34E] mr-0.5" />
                            {provider.avgRating}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
