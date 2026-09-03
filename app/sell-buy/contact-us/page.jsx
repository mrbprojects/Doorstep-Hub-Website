import ContactClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await getSEOMetadata('/sell-buy/contact-us');
}

export default function SellBuyContactPage() {
  return <ContactClient />;
}

