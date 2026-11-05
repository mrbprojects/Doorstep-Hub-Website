import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

// Helper to simulate the exact logic in app/(landing)/page.jsx
async function evaluateHomeScreenSetting(apiBaseUrl) {
    let showHomeScreen = true;
    let redirectedTo = null;

    try {
        const response = await fetch(`${apiBaseUrl}/app/applience-repairs-website/get-website-screen-settings`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(1000) // 1s for fast tests
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.success && data.data && typeof data.data.homescreen === 'boolean') {
                showHomeScreen = data.data.homescreen;
            }
        }
    } catch (error) {
        // Network or API failure: keep approved homepage active
        showHomeScreen = true;
    }

    if (!showHomeScreen) {
        redirectedTo = '/appliance-repair-services';
    }

    return {
        showHomeScreen,
        redirectedTo,
        renderedRoute: redirectedTo ? redirectedTo : '/'
    };
}

describe('Homepage Admin Control Scenarios (Task 1)', () => {
    it('1. API returns homescreen: true — homepage renders at /', async () => {
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Website screen settings retrieved successfully',
                data: { homescreen: true }
            }));
        });

        await new Promise(resolve => server.listen(0, resolve));
        const port = server.address().port;

        try {
            const result = await evaluateHomeScreenSetting(`http://127.0.0.1:${port}`);
            assert.strictEqual(result.showHomeScreen, true);
            assert.strictEqual(result.redirectedTo, null);
            assert.strictEqual(result.renderedRoute, '/');
        } finally {
            server.close();
        }
    });

    it('2. API returns homescreen: false — existing intended redirect behavior is preserved', async () => {
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Website screen settings retrieved successfully',
                data: { homescreen: false }
            }));
        });

        await new Promise(resolve => server.listen(0, resolve));
        const port = server.address().port;

        try {
            const result = await evaluateHomeScreenSetting(`http://127.0.0.1:${port}`);
            assert.strictEqual(result.showHomeScreen, false);
            assert.strictEqual(result.redirectedTo, '/appliance-repair-services');
            assert.strictEqual(result.renderedRoute, '/appliance-repair-services');
        } finally {
            server.close();
        }
    });

    it('3. API times out — approved fallback behavior is applied (renders at /)', async () => {
        const server = http.createServer((req, res) => {
            // Intentionally don't respond to trigger timeout
        });

        await new Promise(resolve => server.listen(0, resolve));
        const port = server.address().port;

        try {
            const result = await evaluateHomeScreenSetting(`http://127.0.0.1:${port}`);
            assert.strictEqual(result.showHomeScreen, true);
            assert.strictEqual(result.redirectedTo, null);
            assert.strictEqual(result.renderedRoute, '/');
        } finally {
            server.close();
        }
    });

    it('4. API returns malformed data — website remains stable (renders at /)', async () => {
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: "not-an-object",
                invalid: 123
            }));
        });

        await new Promise(resolve => server.listen(0, resolve));
        const port = server.address().port;

        try {
            const result = await evaluateHomeScreenSetting(`http://127.0.0.1:${port}`);
            assert.strictEqual(result.showHomeScreen, true);
            assert.strictEqual(result.redirectedTo, null);
            assert.strictEqual(result.renderedRoute, '/');
        } finally {
            server.close();
        }
    });

    it('5. API returns an error (HTTP 500 / Network Error) — no unhandled exception occurs (renders at /)', async () => {
        const server = http.createServer((req, res) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        });

        await new Promise(resolve => server.listen(0, resolve));
        const port = server.address().port;

        try {
            const result = await evaluateHomeScreenSetting(`http://127.0.0.1:${port}`);
            assert.strictEqual(result.showHomeScreen, true);
            assert.strictEqual(result.redirectedTo, null);
            assert.strictEqual(result.renderedRoute, '/');
        } finally {
            server.close();
        }
    });
});
