const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
const BASE_URL = 'https://doorstephub.com';

export default async function sitemap() {
  // 1. Static Core Routes
  const sitemapEntries = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/terms-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/faqs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/appliances`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/spa-salon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/pghostels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/religious-services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/book-appointment`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/service-partner`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/partner`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/appliances/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/appliances/centers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/appliances/featured`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/appliances/recent`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/appliances/verified`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/appliances/explore`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    // 2. Appliances, Repairs & Root Slug Routes (Categories & Services)
    // We fetch from Hyderabad (default) to get a comprehensive list
    const catRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lattitude: 17.3850, longitude: 78.4867 }),
      cache: 'no-store'
    });
    const { success, data: categories } = await catRes.json();

    if (success && Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.slug) {
          sitemapEntries.push({
            url: `${BASE_URL}/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7
          });

          // Fetch Subcategories for this Category
          try {
            const subRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: cat.slug }),
              cache: 'no-store'
            });
            const { success: subSuccess, data: subcategories } = await subRes.json();
            
            if (subSuccess && Array.isArray(subcategories)) {
              for (const sub of subcategories) {
                if (sub.slug) {
                  // Subcategory URL
                  sitemapEntries.push({
                    url: `${BASE_URL}/${cat.slug}/${sub.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.6
                  });

                  // Individual Services & Centers in this Subcategory
                  try {
                    const svcRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/services_by_subcategory`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        subcategoryId: sub._id, 
                        lattitude: 17.3850, 
                        longitude: 78.4867 
                      }),
                      cache: 'no-store'
                    });
                    const { success: svcSuccess, dhubServices, nearByServiceCenters } = await svcRes.json();
                    
                    if (svcSuccess) {
                      if (Array.isArray(dhubServices)) {
                        dhubServices.forEach(svc => {
                          const svcSlug = svc.slug || svc._id;
                          if (svcSlug) {
                            sitemapEntries.push({
                              url: `${BASE_URL}/${svcSlug}`,
                              lastModified: new Date(),
                              changeFrequency: 'monthly',
                              priority: 0.5
                            });
                          }
                        });
                      }
                      
                      if (Array.isArray(nearByServiceCenters)) {
                        nearByServiceCenters.forEach(center => {
                          const centerSlug = center.slug || center._id;
                          if (centerSlug) {
                            sitemapEntries.push({
                              url: `${BASE_URL}/${centerSlug}`,
                              lastModified: new Date(),
                              changeFrequency: 'monthly',
                              priority: 0.5
                            });
                          }
                        });
                      }
                    }
                  } catch (e) { console.error(`Failed to fetch services for subcat ${sub.slug}`); }
                }
              }
            }
          } catch (e) { console.error(`Failed to fetch subcategories for cat ${cat.slug}`); }
        }
      }
    }

    // 3. PG Hostels Dynamic Routes
    const pgSrvId = '69524fb157bb211ca094e5ee';
    const pgCatRes = await fetch(`${API_BASE_URL}/app/professional-services-flow/public/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: pgSrvId }),
      cache: 'no-store'
    });
    const pgCatData = await pgCatRes.json();
    if (pgCatData.success && Array.isArray(pgCatData.category)) {
      pgCatData.category.forEach(cat => {
        sitemapEntries.push({
          url: `${BASE_URL}/pghostels/listings/${cat._id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6
        });
      });
    }

    // 4. Spa Salon Dynamic Routes
    const spaSrvId = '69524fb157bb211ca094e5ec'; // Inferred ID
    const spaCatRes = await fetch(`${API_BASE_URL}/app/professional-services-flow/public/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: spaSrvId }),
      cache: 'no-store'
    });
    const spaCatData = await spaCatRes.json();
    if (spaCatData.success && Array.isArray(spaCatData.category)) {
      spaCatData.category.forEach(cat => {
        sitemapEntries.push({
          url: `${BASE_URL}/spa-salon/category/${cat._id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6
        });
      });
    }

  } catch (error) {
    console.error("Dynamic sitemap generation failed:", error);
  }

  // Deduplicate entries by URL
  const uniqueUrls = new Set();
  const filteredEntries = sitemapEntries.filter(entry => {
    if (uniqueUrls.has(entry.url)) return false;
    uniqueUrls.add(entry.url);
    return true;
  });

  return filteredEntries;
}
