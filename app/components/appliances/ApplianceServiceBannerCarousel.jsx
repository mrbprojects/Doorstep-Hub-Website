'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
    onSelect();
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
    const timer = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(timer);
  }, [emblaApi, banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative h-full w-full">
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {banners.map((banner) => (
            <div key={banner.id} className="h-full min-w-0 shrink-0 grow-0 basis-full">
              <img
                src={banner.imageUrl}
                alt={banner.title || `Appliance Repair Services in ${cityLabel}`}
                className="h-full w-full bg-[#071018] object-contain object-center"
              />
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
          {banners.map((banner, index) => (
            <button
              key={`dot-${banner.id}`}
              type="button"
              aria-label={`Go to banner ${index + 1}`}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === selectedIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
