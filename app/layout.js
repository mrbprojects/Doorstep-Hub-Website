import './globals.css';
import { Ubuntu } from 'next/font/google';
import Script from 'next/script';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { CartProvider } from './context/CartContext';
import { ServiceCartProvider } from './context/ServiceCartContext';
import { ClientProviders } from './components/providers/ClientProviders';
import ErrorBoundary from './components/ErrorBoundary';


const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
});

export const metadata = {
  title: 'DoorstepHub',
  description: 'DoorstepHub - Your All-in-One Service Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${ubuntu.variable} font-ubuntu bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden`}>
        <ErrorBoundary>
          <LocationProvider>
            <AuthProvider>
              <AuthModalProvider>
                <CartProvider>
                  <ServiceCartProvider>
                    <ClientProviders>
                      <Script
                        id="google-maps-script"
                        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async&v=weekly`}
                        strategy="beforeInteractive"
                      />
                      {children}
                    </ClientProviders>
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
