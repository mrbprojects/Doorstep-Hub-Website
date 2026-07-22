import './globals.css';
import { Ubuntu } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { CartProvider } from './context/CartContext';
import { ServiceCartProvider } from './context/ServiceCartContext';
import { GlobalSettingsProvider } from './context/GlobalSettingsContext';
import { ClientProviders } from './components/providers/ClientProviders';
import ErrorBoundary from './components/ErrorBoundary';
import { DynamicSEO } from './components/ui/DynamicSEO';
import dynamic from 'next/dynamic';

// const InitialLocationModal = dynamic(() => import('./components/location/InitialLocationModal').then(m => m.InitialLocationModal), { ssr: false });
const FloatingActionButtons = dynamic(() => import('./components/ui/FloatingActionButtons').then(m => m.FloatingActionButtons), { ssr: false });

const ubuntu = Ubuntu({
  subsets: ['latin'],
  // 300 was unused — dropping it removes one woff2 from the critical chain.
  // next/font preloads the first weight automatically; having fewer weights
  // means fewer files to fetch before text can render.
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
  preload: true,
});

export const metadata = {
  metadataBase: new URL('https://doorstephub.com'),
  title: {
    default: 'Doorstep Hub | One-Stop Home & Lifestyle Services in India',
    template: '%s | Doorstep Hub'
  },
  description: 'Doorstep Hub Delivers Professional Appliance Repair, Spa & Saloon, PG & Hostel Booking Sytem Lifestyle and Religious services across India.',
  authors: [{ name: 'D-Hub' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Doorstep Hub | One-Stop Home & Lifestyle Services in India',
    description: 'Doorstep Hub Delivers Professional Appliance Repair, Spa & Saloon, PG & Hostel Booking Sytem Lifestyle and Religious services across India.',
    url: 'https://doorstephub.com',
    siteName: 'Doorstep Hub',
    images: [
      {
        url: 'https://api.doorstephub.com/uploads/Doorstep-Hub-AMC-Service.png',
        width: 1200,
        height: 630,
        alt: 'Doorstep Hub Services',
      },
    ],
    type: 'website',
  },
  other: {
    copyright: 'https://doorstephub.com/',
    contact: '+91 8886688666',
    'X-UA-Compatible': 'ie=edge',
  },
  icons: {
    icon: '/d-hub-logo.png',
    shortcut: '/d-hub-logo.png',
    apple: '/d-hub-logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          ── Resource hints ───────────────────────────────────────────────────────
          These fire at HTML parse time, before the browser sees any CSS or JS,
          so connections are established in parallel with the main document.
        */}

        {/* Doorstep Hub API — preconnect so data-fetch RTTs are already resolved */}
        <link rel="preconnect" href="https://api.doorstephub.com" />
        <link rel="dns-prefetch" href="https://api.doorstephub.com" />

        {/* Google Maps JS — preconnect cuts TLS handshake out of the main thread */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />

        {/* Google Tag Manager — establish connection early so it loads faster */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Unsplash / Dicebear (image CDNs used in cards) */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />

        {/*
          Define the Maps callback function BEFORE the Maps script loads.
          This is tiny (<50 bytes), synchronous, and required so the Maps
          SDK can call it when ready — replaces the 100ms polling interval.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__onGoogleMapsLoaded=function(){window.dispatchEvent(new Event('google-maps-loaded'));};`,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${ubuntu.variable} font-ubuntu min-h-screen overflow-x-hidden`}>
        {/* Google Tag Manager (noscript) */}
        <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P35XQW2B" height="0" width="0" style="display:none;visibility:hidden"></iframe>` }} />
        {/* End Google Tag Manager (noscript) */}

        {/*
          GTM — afterInteractive means it loads AFTER the page is interactive.
          Previously it was a blocking inline script in <head> which stalled TBT.
        */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P35XQW2B');`,
          }}
        />

        {/*
          Google Maps — afterInteractive (was beforeInteractive, which blocked ALL rendering).
          callback=__onGoogleMapsLoaded fires a window event so LocationContext
          can react without polling every 100ms on the main thread.
        */}
        <Script
          id="google-maps-script"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=__onGoogleMapsLoaded&v=weekly`}
          strategy="afterInteractive"
        />

        <ErrorBoundary>
          <DynamicSEO />
          <LocationProvider>
            <AuthProvider>
              <AuthModalProvider>
                <CartProvider>
                  <ServiceCartProvider>
                    <GlobalSettingsProvider>
                      <ClientProviders>
                        <Suspense fallback={<div className="min-h-screen" />}>
                          {children}
                        </Suspense>
                        {/* <InitialLocationModal /> */}
                        <FloatingActionButtons />
                      </ClientProviders>
                    </GlobalSettingsProvider>
                  </ServiceCartProvider>
                </CartProvider>
              </AuthModalProvider>
            </AuthProvider>
          </LocationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
