const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';

async function testCities() {
  try {
    const res = await fetch(`${API_BASE_URL}/web/website-management/cities`);
    const data = await res.json();
    console.log('Cities Data:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

testCities();
