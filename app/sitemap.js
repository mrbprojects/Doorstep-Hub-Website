export const dynamic = 'force-dynamic';
export const revalidate = 3600;

import { buildApplianceRepairCityPublicPath, buildApplianceCategoryCityPublicPath, buildFlatBrandCityPublicPath, buildFlatBrandPublicPath, resolveBookNowNavigationPath } from '@/lib/applianceRepairSlugs';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
const BASE_URL = 'https://doorstephub.com';

async function fetchAPI(endpoint, body = null, method = 'POST') {
  try {
    const config = {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'DoorstepHub-SitemapGenerator/1.0'
      },
    };
    if (body) config.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return res.ok ? await res.json() : null;
  } catch (e) {
    return null;
  }
}

const isValidSlug = (s) => s && s.length > 2 && !s.match(/^[0-9a-fA-F]{24}$/);

async function getApplianceHierarchicalEntries() {
  const entries = [];
  try {
    const [citiesData, categoriesData, brandsData, authData] = await Promise.all([
      fetchAPI('/app/cities/cities_list', null, 'GET'),
      fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' }),
      fetchAPI('/app/brands/all_brands', null, 'GET'),
      fetchAPI('/app/authorized-services/all_authorized_services', null, 'GET')
    ]);

    const cities = (citiesData?.success && Array.isArray(citiesData.cities)) ? citiesData.cities : [];
    const categories = (categoriesData?.success && Array.isArray(categoriesData.data)) ? categoriesData.data : [];
    const brands = (brandsData?.success && Array.isArray(brandsData.brands)) ? brandsData.brands : [];
    const authServices = (authData?.success && Array.isArray(authData.services)) ? authData.services : [];

    // Create mappings for precision
    const categoryMap = {}; // Name -> Slug
    categories.forEach(cat => {
      if (cat.name && cat.slug) categoryMap[cat.name.toLowerCase()] = cat.slug;
    });

    const brandMap = {}; // Name -> Slug
    brands.forEach(brand => {
      if (brand.name) {
        brandMap[brand.name.toLowerCase()] = brand.slug || brand.name.toLowerCase().trim().replace(/\s+/g, '-');
      }
    });

    cities.forEach(city => {
      const citySlug = (city.slug || city.name || '').toLowerCase().replace(/\s+/g, '-');
      if (!citySlug) return;

      // City Level — nested (existing) + flat SEO slugs (new)
      entries.push({ url: `${BASE_URL}/appliances/repair-service/${citySlug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
      entries.push({ url: `${BASE_URL}${buildApplianceRepairCityPublicPath(citySlug)}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 });

      // Precision Hierarchical: City + Category + Brand
      // Only generate combinations that exist in authorized services
      authServices.forEach(auth => {
        const catName = String(auth.categoryName || '').toLowerCase();
        const brandName = String(auth.brandName || '').toLowerCase();
        const catSlug = categoryMap[catName];
        const brandSlug = brandMap[brandName];

        if (catSlug && brandSlug) {
          // City + Category Level (nested + flat SEO slug)
          entries.push({ url: `${BASE_URL}/appliances/repair-service/${citySlug}/${catSlug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          const categoryPublicPath = buildApplianceCategoryCityPublicPath(catSlug, citySlug);
          if (categoryPublicPath) {
            entries.push({ url: `${BASE_URL}${categoryPublicPath}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 });
          }
          
          // City + Category + Brand Level (nested + flat SEO slug)
          entries.push({ url: `${BASE_URL}/${citySlug}/${catSlug}/${brandSlug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 });
          const brandPublicPath = buildFlatBrandCityPublicPath(citySlug, brandSlug);
          if (brandPublicPath) {
            entries.push({ url: `${BASE_URL}${brandPublicPath}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 });
          }
          const brandOnlyPath = buildFlatBrandPublicPath(brandSlug);
          if (brandOnlyPath) {
            entries.push({ url: `${BASE_URL}${brandOnlyPath}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 });
          }
        }
      });
    });
  } catch (e) {
    console.error('Sitemap Hierarchical Error:', e);
  }
  return entries;
}


async function getApplianceEntries() {

  const entries = [];
  try {
    const data = await fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' });
    if (data?.success && Array.isArray(data.data)) {
      const results = await Promise.all(data.data.map(async (cat) => {
        const catEntries = [];
        if (isValidSlug(cat.slug)) {
          catEntries.push({ url: `${BASE_URL}/${cat.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          const subData = await fetchAPI('/app/applience-repairs-website/getsubcategorysbycategoryid', { slug: cat.slug });
          if (subData?.success && Array.isArray(subData.data)) {
            const subResults = await Promise.all(subData.data.map(async (sub) => {
              const subEntries = [];
              if (isValidSlug(sub.slug)) {
                subEntries.push({ url: `${BASE_URL}/${sub.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
                
                // Fetch individual services for this subcategory
                const svcData = await fetchAPI('/app/applience-repairs-website/services_by_subcategory', { 
                  subcategoryId: sub._id, lattitude: '17.3850', longitude: '78.4867' 
                });
                if (svcData?.success && Array.isArray(svcData.dhubServices)) {
                  svcData.dhubServices.forEach(svc => {
                    if (isValidSlug(svc.slug)) subEntries.push({ url: `${BASE_URL}/${svc.slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 });
                  });
                }
              }
              return subEntries;
            }));
            catEntries.push(...subResults.flat());
          }
        }
        return catEntries;
      }));
      entries.push(...results.flat());
    }
    // Authorized services (e.g. samsung-ac-repair-service-center)
    const authData = await fetchAPI('/app/authorized-services/all_authorized_services', null, 'GET');
    if (authData?.success && Array.isArray(authData.services)) {
      authData.services.forEach(svc => {
        if (isValidSlug(svc.slug)) {
          entries.push({ url: `${BASE_URL}/${svc.slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 });
        }
      });
    }
  } catch (e) {}
  return entries;
}


async function getApplianceBookingEntries() {
  const entries = [];
  try {
    const [catData, authData] = await Promise.all([
      fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' }),
      fetchAPI('/app/authorized-services/all_authorized_services', null, 'GET')
    ]);

    // Regular services
    if (catData?.success && Array.isArray(catData.data)) {
      await Promise.all(catData.data.map(async (cat) => {
        const subData = await fetchAPI('/app/applience-repairs-website/getsubcategorysbycategoryid', { slug: cat.slug });
        if (subData?.success && Array.isArray(subData.data)) {
          await Promise.all(subData.data.map(async (sub) => {
            const svcData = await fetchAPI('/app/applience-repairs-website/services_by_subcategory', { 
              subcategoryId: sub._id, lattitude: '17.3850', longitude: '78.4867' 
            });
            if (svcData?.success && Array.isArray(svcData.dhubServices)) {
              svcData.dhubServices.forEach(svc => {
                if (isValidSlug(svc.slug)) {
                  entries.push({ url: `${BASE_URL}${resolveBookNowNavigationPath(svc.slug, 'hyderabad')}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 });
                }
              });
            }
          }));
        }
      }));
    }

    // Authorized services (e.g. samsung-ac-repair-service-center)
    if (authData?.success && Array.isArray(authData.services)) {
      authData.services.forEach(svc => {
        if (isValidSlug(svc.slug)) {
          entries.push({ url: `${BASE_URL}${resolveBookNowNavigationPath(svc.slug, 'hyderabad')}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 });
        }
      });
    }
  } catch (e) {}
  return entries;
}


async function getHostelEntries() {

  const entries = [];
  try {
    const [catData, pgListData] = await Promise.all([
      fetchAPI('/app/professional-services-flow/public/categories', { serviceId: '69524fb157bb211ca094e5ee' }),
      fetchAPI('/app/products/latest_pg_hostels', null, 'GET')
    ]);

    if (catData?.success && Array.isArray(catData.category)) {
      const results = await Promise.all(catData.category.map(async (cat) => {
        const catEntries = [];
        const slug = cat.slug || cat._id;
        if (isValidSlug(slug)) {
          catEntries.push({ url: `${BASE_URL}/pghostels/${slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          const subData = await fetchAPI('/app/professional-services-flow/public/subcategories', { categorySlug: slug, serviceId: '69524fb157bb211ca094e5ee' });
          if (subData?.success && Array.isArray(subData.data)) {
            subData.data.forEach(sub => {
              const ss = sub.slug || sub._id;
              if (isValidSlug(ss)) catEntries.push({ url: `${BASE_URL}/pghostels/${ss}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
            });
          }
        }
        return catEntries;
      }));
      entries.push(...results.flat());
    }

    if (pgListData?.success && Array.isArray(pgListData.hostels)) {
      pgListData.hostels.forEach(h => {
        const sl = h.slug || h._id;
        if (isValidSlug(sl)) entries.push({ url: `${BASE_URL}/pghostels/${sl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
      });
    }
  } catch (e) {}
  return entries;
}

async function getSpaEntries() {
  const entries = [];
  try {
    const [catData, storesData] = await Promise.all([
      fetchAPI('/app/professional-services-flow/public/categories', { serviceId: '69524f4a57bb211ca094e5e6' }),
      fetchAPI('/app/products/all_spa_stores', null, 'GET')
    ]);

    if (catData?.success && Array.isArray(catData.category)) {
      const results = await Promise.all(catData.category.map(async (cat) => {
        const catEntries = [];
        const slug = cat.slug || cat._id;
        if (isValidSlug(slug)) {
          catEntries.push({ url: `${BASE_URL}/spa-salon/${slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          const subData = await fetchAPI('/app/professional-services-flow/public/subcategories', { categorySlug: slug });
          if (subData?.success && Array.isArray(subData.data)) {
            const subResults = await Promise.all(subData.data.map(async (sub) => {
              const subEntries = [];
              const ss = sub.slug || sub._id;
              if (isValidSlug(ss)) {
                subEntries.push({ url: `${BASE_URL}/spa-salon/${ss}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
                const svcData = await fetchAPI('/app/professional-services-flow/public/services', { subcategorySlug: ss });
                if (svcData?.success && Array.isArray(svcData.data)) {
                  svcData.data.forEach(svc => {
                    const svcs = svc.slug || svc._id;
                    if (isValidSlug(svcs)) subEntries.push({ url: `${BASE_URL}/spa-salon/${svcs}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 });
                  });
                }
              }
              return subEntries;
            }));
            catEntries.push(...subResults.flat());
          }
        }
        return catEntries;
      }));
      entries.push(...results.flat());
    }
    if (storesData?.success && Array.isArray(storesData.stores)) {
      storesData.stores.forEach(s => {
        const sl = s.slug || s._id;
        if (isValidSlug(sl)) entries.push({ url: `${BASE_URL}/spa-salon/${sl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
      });
    }
  } catch (e) {}
  return entries;
}

async function getReligiousEntries() {
  const entries = [];
  try {
    const data = await fetchAPI('/app/professional-services-flow/public/categories', { serviceId: '695250aa57bb211ca094e5fd' });
    if (data?.success && Array.isArray(data.category)) {
      const results = await Promise.all(data.category.map(async (cat) => {
        const catEntries = [];
        const slug = cat.slug || cat._id;
        if (isValidSlug(slug)) {
          catEntries.push({ url: `${BASE_URL}/religious-services/${slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          const subData = await fetchAPI('/app/professional-services-flow/public/subcategories', { categorySlug: slug });
          if (subData?.success && Array.isArray(subData.data)) {
            const subResults = await Promise.all(subData.data.map(async (sub) => {
              const subEntries = [];
              const ss = sub.slug || sub._id;
              if (isValidSlug(ss)) {
                subEntries.push({ url: `${BASE_URL}/religious-services/${ss}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
                const svcData = await fetchAPI('/app/professional-services-flow/public/services', { subcategorySlug: ss });
                if (svcData?.success && Array.isArray(svcData.data)) {
                  svcData.data.forEach(svc => {
                    const svcs = svc.slug || svc._id;
                    if (isValidSlug(svcs)) subEntries.push({ url: `${BASE_URL}/religious-services/${svcs}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 });
                  });
                }
              }
              return subEntries;
            }));
            catEntries.push(...subResults.flat());
          }
        }
        return catEntries;
      }));
      entries.push(...results.flat());
    }
  } catch (e) {}
  return entries;
}

async function getCenterEntries() {
  try {
    const citiesData = await fetchAPI('/app/cities/cities_list', null, 'GET');
    const cities = (citiesData?.success && Array.isArray(citiesData.cities)) ? citiesData.cities : [];
    
    const centerResults = await Promise.all(cities.map(async (city) => {
      try {
        const data = await fetchAPI('/app/applience-repairs-website/get_service_center', { 
          lattitude: city.latitude || '17.3850', 
          longitude: city.longitude || '78.4867',
          page: 1,
          limit: 100
        });
        if (data?.success && Array.isArray(data.nearByServiceCenters)) {
          return data.nearByServiceCenters
            .map(s => s.slug || s._id)
            .filter(isValidSlug)
            .map(sl => ({ url: `${BASE_URL}/service-list/${sl}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 }));
        }
      } catch (e) {}
      return [];
    }));
    return centerResults.flat();
  } catch (e) {}
  return [];
}

export default async function sitemap() {
  const staticEntries = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/faqs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/deletion-requests`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/appliances`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/pghostels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/spa-salon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/religious-services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/book-appointment`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/appliance-repairs/services-centers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  const dynamicResults = await Promise.all([
    getApplianceEntries(),
    getApplianceHierarchicalEntries(),
    getApplianceBookingEntries(),
    getHostelEntries(),
    getSpaEntries(),
    getReligiousEntries(),
    getCenterEntries()
  ]);



  const allEntries = [...staticEntries, ...dynamicResults.flat()];
  const uniqueUrls = new Set();
  
  return allEntries.filter(entry => {
    if (!entry.url || uniqueUrls.has(entry.url)) return false;
    uniqueUrls.add(entry.url);
    return true;
  });
}




