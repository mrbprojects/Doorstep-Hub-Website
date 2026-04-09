const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BASE_URL = 'https://doorstephub.com';

export default async function sitemap() {
  const sitemapEntries = [
    // 1. Static Core Pages
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/faqs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },

    // 2. Main Service Landing Pages
    { url: `${BASE_URL}/appliances`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/pghostels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/spa-salon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/religious-services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/book-appointment`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

    // 3. Static Lists & Info
    { url: `${BASE_URL}/appliances/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/appliances/centers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/appliances/featured`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/appliances/recent`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/appliances/verified`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/appliances/explore`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/religious-services/all-services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/spa-salon/packages`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  try {
    // 4. Dynamic Appliance/Service Categories
    const catRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lattitude: 17.3850, longitude: 78.4867 }),
      cache: 'no-store'
    });
    const { success, data: categories } = await catRes.json();

    if (success && Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.slug && !cat.slug.match(/^[0-9a-fA-F]{24}$/)) {
          sitemapEntries.push({
            url: `${BASE_URL}/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7
          });

          // 5. Dynamic Subcategories
          try {
            const subRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: cat.slug }),
              cache: 'no-store'
            });
            const subData = await subRes.json();

            if (subData.success && Array.isArray(subData.data)) {
              for (const sub of subData.data) {
                if (sub.slug && !sub.slug.match(/^[0-9a-fA-F]{24}$/)) {
                  sitemapEntries.push({
                    url: `${BASE_URL}/${cat.slug}/${sub.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.6
                  });

                  // 6. Dynamic Services
                  try {
                    const svcRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/services_by_subcategory`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subcategoryId: sub._id, lattitude: 17.3850, longitude: 78.4867 }),
                      cache: 'no-store'
                    });
                    const svcData = await svcRes.json();
                    if (svcData.success && Array.isArray(svcData.dhubServices)) {
                      svcData.dhubServices.forEach(svc => {
                        if (svc.slug && !svc.slug.match(/^[0-9a-fA-F]{24}$/)) {
                          sitemapEntries.push({
                            url: `${BASE_URL}/${svc.slug}`,
                            lastModified: new Date(),
                            changeFrequency: 'monthly',
                            priority: 0.5
                          });
                        }
                      });
                    }
                  } catch (e) { /* skip */ }
                }
              }
            }
          } catch (e) { /* skip */ }
        }
      }
    }
  } catch (error) {
    console.error("Appliances sitemap generation failed:", error);
  }

  // 7. Dynamic PG Hostels
  try {
    const pgRes = await fetch(`${API_BASE_URL}/app/products/latest_pg_hostels`, { cache: 'no-store' });
    const pgData = await pgRes.json();
    if (pgData.success && Array.isArray(pgData.hostels)) {
      pgData.hostels.forEach(hostel => {
        const slug = hostel.slug || hostel._id;
        if (slug && !slug.match(/^[0-9a-fA-F]{24}$/)) {
          sitemapEntries.push({
            url: `${BASE_URL}/pghostels/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6
          });
        }
      });
    }
  } catch (e) { /* skip */ }

  // 8. Dynamic Spa & Salon Stores
  try {
    const spaRes = await fetch(`${API_BASE_URL}/app/products/all_spa_stores`, { cache: 'no-store' });
    const spaData = await spaRes.json();
    if (spaData.success && Array.isArray(spaData.stores)) {
      spaData.stores.forEach(store => {
        const slug = store.slug || store._id;
        if (slug && !slug.match(/^[0-9a-fA-F]{24}$/)) {
          sitemapEntries.push({
            url: `${BASE_URL}/spa-salon/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6
          });
        }
      });
    }
  } catch (e) { /* skip */ }

  // 9. Dynamic Religious Services
  try {
    const relRes = await fetch(`${API_BASE_URL}/app/professional-services-flow/public/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: '695250aa57bb211ca094e5fd' }), // Religious Service ID
      cache: 'no-store'
    });
    const relData = await relRes.json();
    if (relData.success && Array.isArray(relData.category)) {
      relData.category.forEach(cat => {
        const slug = cat.slug || cat._id;
        if (slug && !slug.match(/^[0-9a-fA-F]{24}$/)) {
          sitemapEntries.push({
            url: `${BASE_URL}/religious-services/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6
          });
        }
      });
    }
  } catch (e) { /* skip */ }

  // Deduplicate entries by URL
  const uniqueUrls = new Set();
  const filteredEntries = sitemapEntries.filter(entry => {
    if (uniqueUrls.has(entry.url)) return false;
    uniqueUrls.add(entry.url);
    return true;
  });

  return filteredEntries;
}
