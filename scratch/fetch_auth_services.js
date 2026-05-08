const fetchAuthServices = async () => {
  try {
    const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
    const response = await fetch(`${API_BASE_URL}/app/authorized-services/all_authorized_services`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (data.success && Array.isArray(data.services)) {
      console.log('Authorized Services found:');
      data.services.slice(0, 10).forEach(svc => {
        console.log(`- ${svc.serviceName} (Slug: ${svc.slug})`);
        console.log(`  Category: ${svc.categoryName}, Brand: ${svc.brandName}`);
      });
    } else {
      console.log('Failed to fetch auth services or no services found.');
    }
  } catch (error) {
    console.error('Error fetching auth services:', error);
  }
};

fetchAuthServices();
