import SellBuyHomePageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const metadata = await getSEOMetadata('/sell-buy');
  
  return metadata;
}

export default function SellBuyHomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Doorstep Hub Sell & Buy',
    url: 'https://doorstephub.com/sell-buy',
    description: 'Buy and sell used items locally on Doorstep Hub.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://doorstephub.com/sell-buy/search?query={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SellBuyHomePageClient />
    </>
  );
}

