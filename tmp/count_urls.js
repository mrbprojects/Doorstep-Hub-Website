async function countUrls() {
  const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
  
  try {
    // 1. All Main Services
    const srvRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/all-services`);
    const srvData = await srvRes.json();
    console.log("Main Services:", srvData.data?.length || 0);

    // 2. All Categories
    const catRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lattitude: 17.3850, longitude: 78.4867 }) // Hyderabad
    });
    const catData = await catRes.json();
    console.log("Categories:", catData.data?.length || 0);

    if (catData.data) {
        let subCount = 0;
        for (const cat of catData.data.slice(0, 5)) { // Sample first 5
            const subRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: cat.slug })
            });
            const subData = await subRes.json();
            subCount += (subData.data?.length || 0);
        }
        console.log("Subcategories (sample total for first 5 cats):", subCount);
    }

  } catch (e) {
    console.error(e);
  }
}
countUrls();
