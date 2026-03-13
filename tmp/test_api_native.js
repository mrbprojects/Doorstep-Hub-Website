async function testFetch() {
    const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
    const SERVICES_ENDPOINT = '/app/applience-repairs-website/all-services';

    try {
        const response = await fetch(`${API_BASE_URL}${SERVICES_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        // Print only a sample to avoid huge output, but enough to see structure
        console.log("Success:", data.success);
        if (data.data && data.data.length > 0) {
            console.log("Sample Service:", JSON.stringify(data.data[0], null, 2));
            console.log("Total Services:", data.data.length);
            
            // Look for categories/subcategories if they exist nested
            const hasCategories = data.data.some(s => s.categories || s.subCategories);
            console.log("Has nested categories/subcategories:", hasCategories);
        }
    } catch (e) {
        console.error(e);
    }
}

testFetch();
