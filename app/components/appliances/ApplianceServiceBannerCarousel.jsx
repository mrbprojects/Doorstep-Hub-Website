'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

export function ApplianceServiceBannerCarousel({
  banners = [],
  cityLabel = '',
  onActiveBannerChange,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: banners.length > 1,
    align: 'start',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    onActiveBannerChange?.(banners[index] ?? null, index);
  }, [emblaApi, banners, onActiveBannerChange]);

  useEffect(() => {
    if (!emblaApi) return undefined;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!banners.length) {
      onActiveBannerChange?.(null, 0);
      return;
    }
    onActiveBannerChange?.(banners[0], 0);
  }, [banners, onActiveBannerChange]);

  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return undefined;
    const timer = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(timer);
  }, [emblaApi, banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative h-full w-full">
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {banners.map((banner, idx) => (
            <div key={banner.id || idx} className="relative h-full min-w-0 shrink-0 grow-0 basis-full overflow-hidden">
              {/* Soft ambient backdrop matching the banner palette so sides blend seamlessly */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <Image
                  src={banner.imageUrl}
                  alt=""
                  aria-hidden="true"
                  fill
                  unoptimized
                  className="object-cover blur-2xl opacity-35 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-[#f0fbf9]/30 to-white/70" />
              </div>

              {/* Main crisp banner image: fitted and centered with zero distortion */}
              <div className="relative z-10 flex h-full w-full items-center justify-center p-2 sm:p-3">
                <div className="relative h-full w-full max-w-[1240px]">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || `Appliance Repair Services in ${cityLabel}`}
                    fill
                    unoptimized
                    priority={idx === 0}
                    sizes="(max-width: 1300px) 100vw, 1300px"
                    className="object-contain object-center rounded-xl sm:rounded-2xl transition-transform duration-500 hover:scale-[1.01]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#037166]/15 shadow-sm sm:bottom-3.5">
          {banners.map((banner, index) => (
            <button
              key={`dot-${banner.id || index}`}
              type="button"
              aria-label={`Go to banner ${index + 1}`}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`rounded-full transition-all duration-300 ${
                index === selectedIndex ? 'w-6 h-2 bg-[#037166] shadow-xs' : 'w-2 h-2 bg-[#037166]/30 hover:bg-[#037166]/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
