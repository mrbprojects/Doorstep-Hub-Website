const queryApi = async () => {
  try {
    const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
    
    // Fetch categories
    const catRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const catData = await catRes.json();
    
    if (catData.success && Array.isArray(catData.data)) {
      for (const cat of catData.data) {
        const brandRes = await fetch(`${API_BASE_URL}/app/brands/all_brands?categoryId=${cat._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const brandData = await brandRes.json();
        const brandCount = brandData.success && Array.isArray(brandData.brands) ? brandData.brands.length : 0;
        console.log(`- Category: ${cat.name} (Slug: ${cat.slug}) | Brands Count: ${brandCount}`);
      }
    }
  } catch (error) {
    console.error('Error querying api:', error);
  }
};

queryApi();
