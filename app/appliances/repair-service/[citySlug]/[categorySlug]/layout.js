import { getSEOMetadata, slugToTitle, getCityAsset, getApplianceCategoryAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
  const citySlug = resolvedParams?.citySlug || '';
  const categorySlug = resolvedParams?.categorySlug || '';
  const cityAsset = getCityAsset(citySlug);
  const categoryAsset = getApplianceCategoryAsset(categorySlug);
  const cityName = cityAsset?.name || slugToTitle(citySlug);
  const categoryName = categoryAsset?.categoryName || slugToTitle(categorySlug.replace(/-services$/i, ''));
  const publicCategorySlug = categorySlug.replace(/-services$/i, '');

  return getSEOMetadata(`/${publicCategorySlug}-service-center-${citySlug}`, {
    title: `${categoryName} Repair Service Center in ${cityName} | Doorstep Hub`,
    description: `Book professional ${categoryName} repair and service in ${cityName}. Expert technicians, genuine spare parts, transparent pricing, and doorstep support from Doorstep Hub.`,
    image: categoryAsset?.image || cityAsset?.image,
  });
}

export default function ApplianceRepairCategoryLayout({ children }) {
  return children;
}
