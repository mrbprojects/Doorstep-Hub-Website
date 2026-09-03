import CategoriesClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const metadata = await getSEOMetadata('/sell-buy/categories');
  
  return metadata;
}

export default function SellBuyCategoriesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Categories | Doorstep Hub Sell & Buy',
    description: 'Browse all categories on Doorstep Hub to buy and sell used items.',
    url: 'https://doorstephub.com/sell-buy/categories'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoriesClient />
    </>
  );
}

