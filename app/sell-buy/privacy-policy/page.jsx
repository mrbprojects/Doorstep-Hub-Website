import PrivacyClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await getSEOMetadata('/sell-buy/privacy-policy');
}

export default function SellBuyPrivacyPage() {
  return <PrivacyClient />;
}

