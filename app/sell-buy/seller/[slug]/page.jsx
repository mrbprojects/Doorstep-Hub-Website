import SellerProfileClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

// Helper to fetch seller profile server-side for metadata
async function getSellerProfile(slug) {
  try {
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
    const res = await fetch(`${API_BASE_URL}/sell-buy/seller/${slug}`, { next: { revalidate: 60 } });
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
  const title = sellerName ? `Seller Profile: ${sellerName}` : undefined;
  const description = sellerName ? `View ${sellerName}'s profile on Doorstep Hub.` : undefined;

  let rawImageUrl = profile?.avatar || profile?.userId?.profilePic || null;
  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://devapis.doorstephub.com').replace(/\/+$/, '');
  let fullImageUrl = null;
  if (rawImageUrl) {
    if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
      fullImageUrl = rawImageUrl;
    } else {
      fullImageUrl = `${IMAGE_BASE}/${rawImageUrl.replace(/^\//, '')}`;
    }
  }

  const metadata = await getSEOMetadata(`/sell-buy/seller/${slug}`, {
    title,
    description,
    image: fullImageUrl || undefined,
  });
  
  if (fullImageUrl) {
    const imageObj = {
      url: fullImageUrl,
      secureUrl: fullImageUrl,
      width: 600,
      height: 600,
      alt: title || 'Seller Avatar',
    };
    metadata.openGraph = {
      ...(metadata.openGraph || {}),
      images: [imageObj],
    };
    metadata.twitter = {
      ...(metadata.twitter || {}),
      card: 'summary',
      images: [imageObj],
    };
  }
  
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
