import TermsClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await getSEOMetadata('/sell-buy/terms');
}

export default function SellBuyTermsPage() {
  return <TermsClient />;
}

