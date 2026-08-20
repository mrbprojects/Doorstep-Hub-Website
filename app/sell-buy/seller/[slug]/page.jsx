import SellerProfileClient from './page-client';
import { getSEOMetadata, getSocialPreviewImage } from '@/lib/seo';
import { API_BASE_URL } from '@/config/env';

// Helper to fetch seller profile server-side for metadata
async function getSellerProfile(slug) {
  try {
    const idMatch = String(slug).match(/([0-9a-fA-F]{24})$/);
    const queryId = idMatch ? idMatch[1] : slug;
    const res = await fetch(`${API_BASE_URL}/sell-buy/sellers/${queryId}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const data = await getSellerProfile(slug);
  const profile = data?.profile;

  const sellerName = profile?.displayName || profile?.userId?.name || undefined;
  const title = sellerName ? `${sellerName} - Verified Seller | Doorstep Hub Marketplace` : undefined;
  const description = sellerName ? `Explore verified listings and direct contact with ${sellerName} on Doorstep Hub.` : undefined;

  const imageObj = getSocialPreviewImage(profile || profile?.userId);

  const metadata = await getSEOMetadata(`/sell-buy/seller/${slug}`, {
    title,
    description,
    image: imageObj,
  });

  return metadata;
}

export default async function SellBuySellerPage({ params }) {
  const { slug } = params;
  const data = await getSellerProfile(slug);
  const profile = data?.profile;

  let jsonLd = null;

  if (profile) {
    const sellerName = profile?.displayName || profile?.userId?.name || 'Verified Seller';
    let rawImageUrl = profile?.avatar || profile?.userId?.profilePic || '';
    const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://devapis.doorstephub.com').replace(/\/+$/, '');
    if (rawImageUrl && !rawImageUrl.startsWith('http')) {
      rawImageUrl = `${IMAGE_BASE}/${rawImageUrl.replace(/^\//, '')}`;
    }

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: sellerName,
      description: `Seller profile for ${sellerName} on Doorstep Hub.`,
      image: rawImageUrl || undefined,
      mainEntity: {
        '@type': 'Person',
        name: sellerName,
        image: rawImageUrl || undefined,
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WriteAction',
          userInteractionCount: profile.totalAdsPosted || 0
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
      <SellerProfileClient params={params} />
    </>
  );
}
