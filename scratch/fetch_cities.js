const fetchCities = async () => {
  try {
    const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
    const response = await fetch(`${API_BASE_URL}/app/cities/cities_list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (data.success && Array.isArray(data.cities)) {
      console.log('Cities found in system:');
      data.cities.forEach(city => {
        console.log(`- ${city.name} (Slug: ${city.slug || city.name.toLowerCase().replace(/\s+/g, '-')})`);
      });
    } else {
      console.log('Failed to fetch cities or no cities found.');
    }
  } catch (error) {
    console.error('Error fetching cities:', error);
  }
};

fetchCities();
