const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
const BASE_URL = 'https://doorstephub.com';

async function fetchAPI(endpoint, body = null, method = 'POST') {
  try {
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    };
    if (body) config.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default async function sitemap() {
  const sitemapEntries = [
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

  const isValidSlug = (s) => s && s.length > 2 && !s.match(/^[0-9a-fA-F]{24}$/);

  // --- VERTICAL: APPLIANCES ---
  try {
    const catData = await fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' });
    if (catData?.success && Array.isArray(catData.data)) {
      const catResults = await Promise.all(catData.data.map(async (cat) => {
        const entries = [];
        if (isValidSlug(cat.slug)) {
          entries.push({ url: `${BASE_URL}/${cat.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          
          const subData = await fetchAPI('/app/applience-repairs-website/getsubcategorysbycategoryid', { slug: cat.slug });
          if (subData?.success && Array.isArray(subData.data)) {
            const subEntries = await Promise.all(subData.data.map(async (sub) => {
              const subItems = [];
              if (isValidSlug(sub.slug)) {
                // Both root and nested for maximum compatibility
                subItems.push({ url: `${BASE_URL}/${sub.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
                subItems.push({ url: `${BASE_URL}/${cat.slug}/${sub.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
                
                // Services
                const svcData = await fetchAPI('/app/applience-repairs-website/services_by_subcategory', { 
                  subcategoryId: sub._id, lattitude: '17.3850', longitude: '78.4867' 
                });
                if (svcData?.success && Array.isArray(svcData.dhubServices)) {
                  svcData.dhubServices.forEach(svc => {
                    if (isValidSlug(svc.slug)) {
                      subItems.push({ url: `${BASE_URL}/${svc.slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 });
                    }
                  });
                }
              }
              return subItems;
            }));
            entries.push(...subEntries.flat());
          }
        }
        return entries;
      }));
      sitemapEntries.push(...catResults.flat());
    }
  } catch (e) {}

  // --- VERTICAL: PG HOSTELS ---
  try {
    const pgData = await fetchAPI('/app/products/latest_pg_hostels', null, 'GET');
    if (pgData?.success && Array.isArray(pgData.hostels)) {
      pgData.hostels.forEach(h => {
        const s = h.slug || h._id;
        if (isValidSlug(s)) sitemapEntries.push({ url: `${BASE_URL}/pghostels/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
      });
    }
  } catch (e) {}

  // --- VERTICAL: SPA & SALON ---
  try {
    const spaCatData = await fetchAPI('/app/professional-services-flow/public/categories', { serviceId: '69524f4a57bb211ca094e5e6' });
    if (spaCatData?.success && Array.isArray(spaCatData.category)) {
      const spaResults = await Promise.all(spaCatData.category.map(async (cat) => {
        const entries = [];
        const catSlug = cat.slug || cat._id;
        if (isValidSlug(catSlug)) {
          entries.push({ url: `${BASE_URL}/spa-salon/${catSlug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          const spaSubData = await fetchAPI('/app/professional-services-flow/public/subcategories', { categorySlug: catSlug });
          if (spaSubData?.success && Array.isArray(spaSubData.data)) {
            spaSubData.data.forEach(sub => {
              const subSlug = sub.slug || sub._id;
              if (isValidSlug(subSlug)) entries.push({ url: `${BASE_URL}/spa-salon/${subSlug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
            });
          }
        }
        return entries;
      }));
      sitemapEntries.push(...spaResults.flat());
    }
    const spaStoresData = await fetchAPI('/app/products/all_spa_stores', null, 'GET');
    if (spaStoresData?.success && Array.isArray(spaStoresData.stores)) {
      spaStoresData.stores.forEach(s => {
        const sl = s.slug || s._id;
        if (isValidSlug(sl)) sitemapEntries.push({ url: `${BASE_URL}/spa-salon/${sl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
      });
    }
  } catch (e) {}

  // --- VERTICAL: RELIGIOUS SERVICES ---
  try {
    const relCatData = await fetchAPI('/app/professional-services-flow/public/categories', { serviceId: '695250aa57bb211ca094e5fd' });
    if (relCatData?.success && Array.isArray(relCatData.category)) {
      const relResults = await Promise.all(relCatData.category.map(async (cat) => {
        const entries = [];
        const catSlug = cat.slug || cat._id;
        if (isValidSlug(catSlug)) {
          entries.push({ url: `${BASE_URL}/religious-services/${catSlug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          const relSubData = await fetchAPI('/app/professional-services-flow/public/subcategories', { categorySlug: catSlug });
          if (relSubData?.success && Array.isArray(relSubData.data)) {
            relSubData.data.forEach(sub => {
              const subSlug = sub.slug || sub._id;
              if (isValidSlug(subSlug)) entries.push({ url: `${BASE_URL}/religious-services/${subSlug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
            });
          }
        }
        return entries;
      }));
      sitemapEntries.push(...relResults.flat());
    }
  } catch (e) {}

  // --- VERTICAL: SERVICE CENTERS ---
  try {
    const storesData = await fetchAPI('/app/applience-repairs-website/nearest_service_centers', { lattitude: '17.3850', longitude: '78.4867' });
    if (storesData?.success && Array.isArray(storesData.nearestServiceCenters)) {
      storesData.nearestServiceCenters.forEach(s => {
        const sl = s.slug || s._id;
        if (isValidSlug(sl)) sitemapEntries.push({ url: `${BASE_URL}/appliances/store/${sl}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 });
      });
    }
  } catch (e) {}

  const uniqueUrls = new Set();
  return sitemapEntries.filter(entry => {
    if (!entry.url || uniqueUrls.has(entry.url)) return false;
    uniqueUrls.add(entry.url);
    return true;
  });
}



