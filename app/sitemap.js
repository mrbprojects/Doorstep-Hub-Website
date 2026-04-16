export const dynamic = 'force-dynamic';
export const revalidate = 3600;

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
  } catch (e) {}
  return entries;
}

async function getHostelEntries() {
  try {
    const pgData = await fetchAPI('/app/products/latest_pg_hostels', null, 'GET');
    if (pgData?.success && Array.isArray(pgData.hostels)) {
      return pgData.hostels
        .map(h => h.slug || h._id)
        .filter(isValidSlug)
        .map(s => ({ url: `${BASE_URL}/pghostels/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 }));
    }
  } catch (e) {}
  return [];
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
                // Fetch deep services for this subcategory
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
                // Fetch deep services
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
  const cityCoords = [
    { city: 'Hyderabad', lat: '17.3850', lng: '78.4867' },
    { city: 'Bangalore', lat: '12.9716', lng: '77.5946' },
    { city: 'Vizag', lat: '17.6868', lng: '83.2185' },
    { city: 'Chennai', lat: '13.0827', lng: '80.2707' },
    { city: 'Vijayawada', lat: '16.5062', lng: '80.6480' },
    { city: 'Mumbai', lat: '19.0760', lng: '72.8777' },
    { city: 'Pune', lat: '18.5204', lng: '73.8567' }
  ];

  try {
    const centerResults = await Promise.all(cityCoords.map(async (coord) => {
      try {
        const data = await fetchAPI('/app/applience-repairs-website/nearest_service_centers', { 
          lattitude: coord.lat, 
          longitude: coord.lng 
        });
        if (data?.success && Array.isArray(data.nearestServiceCenters)) {
          return data.nearestServiceCenters
            .map(s => s.slug || s._id)
            .filter(isValidSlug)
            .map(sl => ({ url: `${BASE_URL}/${sl}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 }));
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
    { url: `${BASE_URL}/appliances`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/pghostels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/spa-salon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/religious-services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/book-appointment`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Parallel fetch all dynamic sections
  const dynamicResults = await Promise.all([
    getApplianceEntries(),
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




