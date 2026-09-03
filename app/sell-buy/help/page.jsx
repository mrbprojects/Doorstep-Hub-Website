import HelpClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await getSEOMetadata('/sell-buy/help');
}

export default function SellBuyHelpPage() {
  return <HelpClient />;
}

