import { getSEOMetadata, slugToTitle, getCityAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const citySlug = params?.citySlug || '';
  const cityAsset = getCityAsset(citySlug);
  const cityName = cityAsset?.name || slugToTitle(citySlug);

  return getSEOMetadata(`/appliances-repair-service-center-${citySlug}`, {
    title: `Appliance Repair Service Center in ${cityName} | Doorstep Hub`,
    description: `Find trusted appliance repair and service options in ${cityName}. Choose your appliance, brand, and service with Doorstep Hub.`,
    image: cityAsset?.image,
  });
}

export default function SelectServiceCityLayout({ children }) {
  return children;
}
