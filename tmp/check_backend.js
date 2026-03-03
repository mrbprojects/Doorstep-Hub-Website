async function testApi() {
    const slug = 'ssv-washing-machine-repair-services-hyderabad';
    const url = `https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/service_center_services/${slug}`;

    console.log(`Testing API with slug: ${slug}`);
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('Status Code:', response.status);
        console.log('API Response Success:', data.success);

        if (data.success) {
            console.log('✅ SUCCESS: Backend is now accepting slugs!');
            if (data.nearByServiceCenters && data.nearByServiceCenters.length > 0) {
                console.log('Store Name:', data.nearByServiceCenters[0].business_name);
            } else if (data.data) {
                console.log('Store Name (from data):', data.data.business_name || data.data.storeName);
            }
        } else {
            console.log('❌ FAILED: Backend still returns false for slugs.');
            console.log('Message:', data.message || 'No message provided');
        }
    } catch (error) {
        console.error('❌ ERROR during fetch:', error.message);
    }
}

testApi();
