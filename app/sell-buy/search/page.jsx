import SearchResultsClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const metadata = await getSEOMetadata('/sell-buy/search');
  return metadata;
}

export default async function SellBuySearchPage({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams?.query || resolvedSearchParams?.search || '';
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: query ? `Search Results for "${query}"` : 'Search Results',
    description: `Browse verified used items for "${query}" on Doorstep Hub.`,
    url: `https://doorstephub.com/sell-buy/search?query=${query}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SearchResultsClient />
    </>
  );
}

