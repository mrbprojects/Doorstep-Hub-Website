'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';

// Known top-level section prefixes (not service detail slugs)
const KNOWN_SECTIONS = ['/appliances', '/services', '/book-appointment', '/appliance-repair-services',
    '/religious-services', '/spa-salon', '/pg-hostels', '/account', '/cart', '/address'];

export function FloatingActionButtons() {
    const pathname = usePathname();
    const isBookingPage = pathname === '/book-appointment';

    // Services to hide icons for: SPA, PG Hostels, Religious Services, and General Services (Professional Services)
    const hideForServices = [
        '/spa-salon',
        '/pg-hostels',
        '/pghostels',
        '/salon-at-home-services',
        '/pg-hostel',
        '/religious-services',
        '/religious',
        '/services',
        '/professional-services'
    ];

    // Check if the current path should hide the floating buttons
    const shouldHide = hideForServices.some(path => pathname.startsWith(path));

    // Hide global Book Now pill on service detail pages (dynamic [slug] routes at root)
    // These pages have their own sticky Book Now bar
    const isServiceDetailPage = pathname.split('/').length === 2
        && !KNOWN_SECTIONS.some(s => pathname.startsWith(s))
        && pathname !== '/';

    // If we should hide for specific services, return null
    if (shouldHide) return null;

    return (
        <>
            {/* WhatsApp — small fixed icon, bottom-right corner, always visible */}
            <a
                href="https://api.whatsapp.com/send/?phone=918886688666&text=Hi&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-24 right-4 sm:right-6 z-[60]"
                aria-label="Chat on WhatsApp"
            >
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-shadow cursor-pointer"
                >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                </motion.div>
            </a>

            {/* Bottom-right: Book Appointment (desktop) + Book Now pill (mobile) */}
            <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-4">

                {/* Book Appointment Button - Desktop only, hidden on booking page */}
                {!isBookingPage && (
                    <Link href="/book-appointment" className="hidden sm:block">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#037166] text-white px-6 py-3 rounded-full font-semibold shadow-[0_4px_14px_rgba(3,113,102,0.4)] hover:bg-[#025951] transition-all flex items-center justify-center whitespace-nowrap"
                        >
                            Book Appointment
                        </motion.button>
                    </Link>
                )}

                {/* Book Now — Mobile only compact pill, hidden on booking page and service detail pages */}
                {!isBookingPage && !isServiceDetailPage && (
                    <Link href="/book-appointment" className="block sm:hidden">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#037166] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-[0_4px_14px_rgba(3,113,102,0.4)] hover:bg-[#025951] transition-all whitespace-nowrap"
                        >
                            Book Now
                        </motion.button>
                    </Link>
                )}

            </div>
        </>
    );
}

