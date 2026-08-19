import AboutClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await getSEOMetadata('/sell-buy/about');
}

export default function SellBuyAboutPage() {
  return <AboutClient />;
}

