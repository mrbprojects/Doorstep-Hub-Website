import CategoryClient from './page-client';
import { getSEOMetadata, slugToTitle, getSocialPreviewImage } from '@/lib/seo';
import { API_BASE_URL } from '@/config/env';

// Helper to fetch category data server-side
async function getCategoryData(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/sell-buy/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.find(c => c.slug === slug || c._id === slug) || null;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
  const slug = resolvedParams?.slug || '';
  const category = await getCategoryData(slug);
  const categoryName = category?.name || slugToTitle(slug);

  const title = `Buy & Sell Used ${categoryName} | Doorstep Hub Marketplace`;
  const description = `Find verified pre-owned ${categoryName} at best prices. Browse local listings with inspection guarantee and direct buyer-seller chat on Doorstep Hub.`;
  const imageObj = getSocialPreviewImage(category);

  const metadata = await getSEOMetadata(`/sell-buy/${slug}`, {
    title,
    description,
    image: imageObj,
  });

  return metadata;
}

export default async function SellBuyCategoryPage({ params }) {
  const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
  const slug = resolvedParams?.slug || '';
  
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
