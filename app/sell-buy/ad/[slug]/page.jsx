import AdDetailClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

// Helper to fetch ad details server-side for metadata
async function getListingDetails(slug) {
  try {
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
    const res = await fetch(`${API_BASE_URL}/sell-buy/listings/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const data = await getListingDetails(slug);
  const listing = data?.listing;

  const title = listing?.title || undefined;
  const description = listing?.description ? listing.description.substring(0, 150) : undefined;
    
  let keywords = '';
  if (listing?.categoryId?.name) keywords += `${listing.categoryId.name}`;
  if (listing?.subcategoryId?.name) keywords += keywords ? `, ${listing.subcategoryId.name}` : `${listing.subcategoryId.name}`;

  let rawImageUrl = listing?.coverImage || (listing?.images && listing.images.length > 0 ? listing.images[0] : null);
  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://devapis.doorstephub.com').replace(/\/+$/, '');
  let fullImageUrl = null;
  if (rawImageUrl) {
    if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
      fullImageUrl = rawImageUrl;
    } else {
      fullImageUrl = `${IMAGE_BASE}/${rawImageUrl.replace(/^\//, '')}`;
    }
  }

  const metadata = await getSEOMetadata(`/sell-buy/ad/${slug}`, {
    title,
    description,
    keywords: keywords || undefined,
    image: fullImageUrl || undefined,
  });
  
  if (fullImageUrl) {
    const imageObj = {
      url: fullImageUrl,
      secureUrl: fullImageUrl,
      width: 1200,
      height: 630,
      alt: title || 'Product Image',
    };
    metadata.openGraph = {
      ...(metadata.openGraph || {}),
      images: [imageObj],
    };
    metadata.twitter = {
      ...(metadata.twitter || {}),
      card: 'summary_large_image',
      images: [imageObj],
    };
  }
  
  return metadata;
}

export default async function SellBuyAdPage({ params }) {
  const { slug } = params;
  const data = await getListingDetails(slug);
  const listing = data?.listing;

  let jsonLd = null;

  if (listing) {
    let rawImageUrl = listing.coverImage || (listing.images && listing.images.length > 0 ? listing.images[0] : '');
    const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://devapis.doorstephub.com').replace(/\/+$/, '');
    if (rawImageUrl && !rawImageUrl.startsWith('http')) {
      rawImageUrl = `${IMAGE_BASE}/${rawImageUrl.replace(/^\//, '')}`;
    }

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: rawImageUrl || undefined,
      category: listing.categoryId?.name,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: listing.price,
        itemCondition: listing.condition === 'NEW' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        availability: listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Person',
          name: listing.sellerId?.name || 'Verified Seller'
        }
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AdDetailClient params={params} />
    </>
  );
}
