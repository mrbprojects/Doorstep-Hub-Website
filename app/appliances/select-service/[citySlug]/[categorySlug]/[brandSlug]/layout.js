import { getSEOMetadata, slugToTitle, getCityAsset, getApplianceCategoryAsset, getBrandAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
  const citySlug = resolvedParams?.citySlug || '';
  const categorySlug = resolvedParams?.categorySlug || '';
  const brandSlug = resolvedParams?.brandSlug || '';
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
