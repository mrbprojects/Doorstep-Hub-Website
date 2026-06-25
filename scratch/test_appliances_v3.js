const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';

async function testAppliances() {
  try {
    const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lattitude: 17.3850, longitude: 78.4867 }),
    });
    const data = await res.json();
    console.log('Success:', data.success);
    if (data.data) {
        console.log('Category Count:', data.data.length);
        data.data.forEach(cat => {
            console.log(`- ${cat.name} (slug: ${cat.slug})`);
        });
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testAppliances();
