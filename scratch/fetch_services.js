const fetchServices = async () => {
  try {
    const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
    // First get categories
    const catRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lattitude: '17.3850', longitude: '78.4867' })
    });
    const catData = await catRes.json();
    
    if (catData.success && Array.isArray(catData.data)) {
      const cat = catData.data[0]; // Just check first category (AC probably)
      console.log(`Checking category: ${cat.name}`);
      
      const subRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: cat.slug })
      });
      const subData = await subRes.json();
      
      if (subData.success && Array.isArray(subData.data)) {
        const sub = subData.data[0];
        console.log(`Checking subcategory: ${sub.name}`);
        
        const svcRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/services_by_subcategory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subcategoryId: sub._id, lattitude: '17.3850', longitude: '78.4867' })
        });
        const svcData = await svcRes.json();
        
        if (svcData.success && Array.isArray(svcData.dhubServices)) {
          console.log('Services found:');
          svcData.dhubServices.slice(0, 10).forEach(svc => {
            console.log(`- ${svc.serviceName} (Slug: ${svc.slug})`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching services:', error);
  }
};

fetchServices();
