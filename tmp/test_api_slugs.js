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
        console.log("Success:", data.success);
        if (data.data && data.data.length > 0) {
            data.data.forEach(s => {
                console.log(`Service: ${s.serviceName}, Slug: ${s.slug}, ID: ${s._id}`);
                // If there are sub-paths, let's see them
            });
        }
    } catch (e) {
        console.error(e);
    }
}

testFetch();
