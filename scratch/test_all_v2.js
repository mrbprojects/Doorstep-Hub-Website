const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';

async function testAllServices() {
  try {
    const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/all-services`);
    const data = await res.json();
    console.log('Success:', data.success);
    if (data.data && data.data.length > 0) {
        console.log('First Item keys:', Object.keys(data.data[0]));
        console.log('First Item example:', JSON.stringify(data.data[0]).substring(0, 500));
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testAllServices();
