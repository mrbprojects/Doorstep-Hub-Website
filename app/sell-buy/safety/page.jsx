import SafetyClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await getSEOMetadata('/sell-buy/safety');
}

export default function SellBuySafetyPage() {
  return <SafetyClient />;
}

