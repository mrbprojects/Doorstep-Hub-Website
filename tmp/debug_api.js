async function testFetch() {
    const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi';
    const SERVICES_ENDPOINT = '/app/applience-repairs-website/all-services';

    try {
        const response = await fetch(`${API_BASE_URL}${SERVICES_ENDPOINT}`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            console.log("Sample keys:", Object.keys(data.data[0]));
            data.data.forEach((s, i) => {
                if (i < 5) console.log(`Item ${i}:`, s);
            });
        }
    } catch (e) {
        console.error(e);
    }
}
testFetch();
