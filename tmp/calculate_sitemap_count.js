const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';

async function countEverything() {
  const urls = new Set();
  
  // 1. Static Core Routes (16 as defined in sitemap.js)
  const staticCount = 16;
  for(let i=0; i<staticCount; i++) urls.add(`static-${i}`);

  try {
    // 2. Categories
    const catRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lattitude: 17.3850, longitude: 78.4867 })
    });
    const { data: categories } = await catRes.json();

    if (categories) {
      for (const cat of categories) {
        if (cat.slug) {
          urls.add(cat.slug);

          // 3. Subcategories
          const subRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: cat.slug })
          });
          const { data: subcategories } = await subRes.json();
          
          if (subcategories) {
            for (const sub of subcategories) {
              if (sub.slug) {
                urls.add(`${cat.slug}/${sub.slug}`);

                // 4. Services & Centers
                const svcRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/services_by_subcategory`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    subcategoryId: sub._id, 
                    lattitude: 17.3850, 
                    longitude: 78.4867 
                  })
                });
                const { dhubServices, nearByServiceCenters } = await svcRes.json();
                
                if (dhubServices) dhubServices.forEach(s => urls.add(s.slug || s._id));
                if (nearByServiceCenters) nearByServiceCenters.forEach(c => urls.add(c.slug || c._id));
              }
            }
          }
        }
      }
    }

    // 5. PG Hostels
    const pgRes = await fetch(`${API_BASE_URL}/app/professional-services-flow/public/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: '69524fb157bb211ca094e5ee' })
    });
    const pgData = await pgRes.json();
    if (pgData.category) pgData.category.forEach(c => urls.add(`pg-${c._id}`));

    // 6. Spa Salon
    const spaRes = await fetch(`${API_BASE_URL}/app/professional-services-flow/public/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: '69524fb157bb211ca094e5ec' })
    });
    const spaData = await spaRes.json();
    if (spaData.category) spaData.category.forEach(c => urls.add(`spa-${c._id}`));

  } catch (e) {
    console.error(e);
  }

  console.log("Total Unique URLs in Sitemap:", urls.size);
}

countEverything();
