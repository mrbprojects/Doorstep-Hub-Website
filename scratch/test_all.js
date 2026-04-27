const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';

async function testAllServices() {
  try {
    const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/all-services`);
    const data = await res.json();
    console.log('All Services success:', data.success);
    if (data.data) {
        console.log('Categories count:', data.data.length);
        if (data.data.length > 0) {
            console.log('First Category:', data.data[0].name, 'Slug:', data.data[0].slug);
            console.log('Subcategories in first category:', data.data[0].subcategories?.length);
        }
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testAllServices();
