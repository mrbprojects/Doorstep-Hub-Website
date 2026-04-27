const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';

async function testSub() {
  try {
    const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'ac-repair' }),
    });
    const data = await res.json();
    console.log('Success:', data.success);
    if (data.data) {
        console.log('Subcategory Count:', data.data.length);
        data.data.forEach(sub => {
            console.log(`- ${sub.name} (slug: ${sub.slug})`);
        });
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testSub();
