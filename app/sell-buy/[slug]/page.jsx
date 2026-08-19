import CategoryClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const metadata = await getSEOMetadata(`/sell-buy/${params.slug}`);
  return metadata;
}

export default function SellBuyCategoryPage({ params }) {
  const slug = params.slug;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Category - ${slug}`,
    description: `Browse verified used items in ${slug} on Doorstep Hub.`,
    url: `https://doorstephub.com/sell-buy/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryClient slug={slug} />
    </>
  );
}

