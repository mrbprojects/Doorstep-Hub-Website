import { getSEOMetadata, slugToTitle, getCityAsset, getApplianceCategoryAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const citySlug = params?.citySlug || '';
  const categorySlug = params?.categorySlug || '';
  const cityAsset = getCityAsset(citySlug);
  const categoryAsset = getApplianceCategoryAsset(categorySlug);
  const cityName = cityAsset?.name || slugToTitle(citySlug);
  const categoryName = categoryAsset?.categoryName || slugToTitle(categorySlug.replace(/-services$/i, ''));
  const publicCategorySlug = categorySlug.replace(/-services$/i, '');

  return getSEOMetadata(`/${publicCategorySlug}-service-center-${citySlug}`, {
    title: `${categoryName} Repair Service Center in ${cityName} | Doorstep Hub`,
    description: `Explore ${categoryName} repair services in ${cityName}. Select a preferred brand and book doorstep service with trained technicians.`,
    image: categoryAsset?.image || cityAsset?.image,
  });
}

export default function SelectServiceCategoryLayout({ children }) {
  return children;
}
