'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

// Approved reference festivals with authentic Indian calendar dates
const FESTIVALS = [
  {
    id: 'shivarathri',
    name: 'Maha Shivaratri',
    image: '/religious/festival-shivarathri.webp',
    dateText: '26 Feb, 2025',
    targetDate: new Date('2025-02-26T00:00:00+05:30'),
  },
  {
    id: 'ugadi',
    name: 'Ugadi',
    image: '/religious/festival-ugadi.webp',
    dateText: '30 Mar, 2025',
    targetDate: new Date('2025-03-30T00:00:00+05:30'),
  },
  {
    id: 'rama-navami',
    name: 'Sri Rama Navami',
    image: '/religious/festival-rama-navami.webp',
    dateText: '06 Apr, 2025',
    targetDate: new Date('2025-04-06T00:00:00+05:30'),
  },
  {
    id: 'akshaya-tritiya',
    name: 'Akshaya Tritiya',
    image: '/religious/festival-akshaya-tritiya.webp',
    dateText: '30 Apr, 2025',
    targetDate: new Date('2025-04-30T00:00:00+05:30'),
  },
];

export default function UpcomingFestivalsSection({
  onViewAllFestivals,
  onFestivalClick,
}) {
  const mounted = useMounted();
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, minutes: 36 });

  // Identify next upcoming festival
  const nextFestival = useMemo(() => {
    const now = new Date();
    const upcoming = FESTIVALS.find((f) => f.targetDate.getTime() > now.getTime());
    return upcoming || FESTIVALS[0];
  }, []);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      let diff = nextFestival.targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        // If passed, use next annual cycle
        diff = Math.abs(diff) % (365 * 24 * 60 * 60 * 1000);
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft({ days, hours, minutes });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);

    return () => clearInterval(timer);
  }, [nextFestival]);

  return (
    <section aria-label="Upcoming Festivals & Special Poojas" className="w-full py-8 sm:py-12 bg-white">
      <div className="container max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Purple Banner Container */}
        <div className="rounded-[28px] sm:rounded-[32px] overflow-hidden bg-gradient-to-r from-[#4A083B] via-[#5C0A49] to-[#3B062F] border border-[#E8B34E]/30 p-5 sm:p-6 lg:p-8 shadow-xl text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* 1. Left Description & Action */}
            <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3 shadow-inner">
                <Calendar className="w-5 h-5 text-[#FFD59E]" />
              </div>

              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white leading-tight mb-2">
                Upcoming Festivals & Special Poojas
              </h2>

              <p className="text-xs sm:text-sm text-[#FFD5E5] leading-relaxed mb-4 font-normal">
                Book exclusive poojas and rituals for upcoming auspicious occasions
              </p>

              <button
                type="button"
                onClick={onViewAllFestivals}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#FFF5EC] text-[#5C0A49] text-xs sm:text-sm font-bold transition-all duration-200 shadow-md cursor-pointer"
              >
                <span>View All Festivals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Center 4 Festival Cards */}
            <div className="w-full flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
              {FESTIVALS.map((fest) => (
                <div
                  key={fest.id}
                  onClick={() => onFestivalClick && onFestivalClick(fest)}
                  className="group flex flex-col items-center justify-between p-3 rounded-2xl bg-[#FFFDF9] border border-[#F0E4D4] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer text-center min-h-[145px]"
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2">
                    <Image
                      src={fest.image}
                      alt={fest.name}
                      fill
                      className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-xs sm:text-[13px] text-[#30252C] group-hover:text-[#E96B18] transition-colors line-clamp-1 leading-tight">
                      {fest.name}
                    </h3>
                    <p className="text-[11px] text-[#685D68] mt-0.5 font-medium">
                      {fest.dateText}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Right Next Festival Countdown Box */}
            <div className="w-full lg:w-[220px] xl:w-[240px] shrink-0 bg-black/25 backdrop-blur-xs rounded-2xl border border-white/15 p-4 text-center flex flex-col items-center justify-center">
              <span className="text-[#FFD59E] text-[11px] font-bold uppercase tracking-wider">
                Next Festival
              </span>

              <h3 className="font-serif font-bold text-base sm:text-lg text-white mt-0.5 line-clamp-1">
                {nextFestival.name}
              </h3>

              <span className="text-white/70 text-xs mt-0.5 mb-2.5">Starts in</span>

              {/* Countdown Digits */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {/* Days */}
                <div className="flex flex-col items-center">
                  <div className="w-10 sm:w-11 h-9 rounded-lg bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white font-mono font-bold text-base sm:text-lg flex items-center justify-center shadow-md">
                    {mounted ? String(timeLeft.days).padStart(2, '0') : '12'}
                  </div>
                  <span className="text-[9px] text-[#FFD59E] uppercase font-semibold mt-1">Days</span>
                </div>

                <span className="text-white font-bold text-sm -mt-3.5">:</span>

                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="w-10 sm:w-11 h-9 rounded-lg bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white font-mono font-bold text-base sm:text-lg flex items-center justify-center shadow-md">
                    {mounted ? String(timeLeft.hours).padStart(2, '0') : '08'}
                  </div>
                  <span className="text-[9px] text-[#FFD59E] uppercase font-semibold mt-1">Hours</span>
                </div>

                <span className="text-white font-bold text-sm -mt-3.5">:</span>

                {/* Mins */}
                <div className="flex flex-col items-center">
                  <div className="w-10 sm:w-11 h-9 rounded-lg bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white font-mono font-bold text-base sm:text-lg flex items-center justify-center shadow-md">
                    {mounted ? String(timeLeft.minutes).padStart(2, '0') : '36'}
                  </div>
                  <span className="text-[9px] text-[#FFD59E] uppercase font-semibold mt-1">Mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
