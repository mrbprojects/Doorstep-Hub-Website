import { getSEOMetadata, slugToTitle, getCityAsset, getApplianceCategoryAsset, getBrandAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const citySlug = params?.citySlug || '';
  const categorySlug = params?.categorySlug || '';
  const brandSlug = params?.brandSlug || '';
  const cityAsset = getCityAsset(citySlug);
  const categoryAsset = getApplianceCategoryAsset(categorySlug);
  const brandAsset = getBrandAsset(brandSlug);
  const cityName = cityAsset?.name || slugToTitle(citySlug);
  const categoryName = categoryAsset?.categoryName || slugToTitle(categorySlug.replace(/-services$/i, ''));
  const brandName = brandAsset?.name || slugToTitle(brandSlug);

  return getSEOMetadata(`/appliances/select-service/${citySlug}/${categorySlug}/${brandSlug}`, {
    title: `${brandName} ${categoryName} Service Center in ${cityName} | Doorstep Hub`,
    description: `Book ${brandName} ${categoryName} repair and service in ${cityName}. Get skilled doorstep support, genuine spare parts, and transparent pricing.`,
    image: brandAsset?.image || categoryAsset?.image || cityAsset?.image,
  });
}

export default function SelectServiceBrandLayout({ children }) {
  return children;
}
