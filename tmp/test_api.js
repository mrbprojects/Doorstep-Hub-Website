const fetch = require('node-fetch');

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
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testFetch();
