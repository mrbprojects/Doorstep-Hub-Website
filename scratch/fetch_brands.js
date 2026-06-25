const fetchBrands = async () => {
  try {
    const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
    const response = await fetch(`${API_BASE_URL}/app/brands/all_brands`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (data.success && Array.isArray(data.brands)) {
      console.log('Brands found in system:');
      data.brands.forEach(brand => {
        console.log(`- ${brand.name} (Slug: ${brand.slug || brand.name.toLowerCase().trim().replace(/\s+/g, '-')})`);
      });
    } else {
      console.log('Failed to fetch brands or no brands found.');
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
};

fetchBrands();
