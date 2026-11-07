import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper to simulate the exact logic in app/(landing)/page.jsx
export async function evaluateHomeScreenSetting(fetcherOrUrl) {
    let showHomeScreen = true;
    let redirectedTo = null;

    try {
        const response = typeof fetcherOrUrl === 'function'
            ? await fetcherOrUrl()
            : await fetch(`${fetcherOrUrl}/app/applience-repairs-website/get-website-screen-settings`, {
                cache: 'no-store',
                signal: AbortSignal.timeout(1000)
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
        const mockFetch = async () => new Response(JSON.stringify({
            success: true,
            message: 'Website screen settings retrieved successfully',
            data: { homescreen: true }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

        const result = await evaluateHomeScreenSetting(mockFetch);
        assert.strictEqual(result.showHomeScreen, true);
        assert.strictEqual(result.redirectedTo, null);
        assert.strictEqual(result.renderedRoute, '/');
    });

    it('2. API returns homescreen: false — existing intended redirect behavior is preserved', async () => {
        const mockFetch = async () => new Response(JSON.stringify({
            success: true,
            message: 'Website screen settings retrieved successfully',
            data: { homescreen: false }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

        const result = await evaluateHomeScreenSetting(mockFetch);
        assert.strictEqual(result.showHomeScreen, false);
        assert.strictEqual(result.redirectedTo, '/appliance-repair-services');
        assert.strictEqual(result.renderedRoute, '/appliance-repair-services');
    });

    it('3. API times out — approved fallback behavior is applied (renders at /)', async () => {
        const mockFetch = async () => {
            throw new Error('AbortError: The operation was aborted due to timeout');
        };

        const result = await evaluateHomeScreenSetting(mockFetch);
        assert.strictEqual(result.showHomeScreen, true);
        assert.strictEqual(result.redirectedTo, null);
        assert.strictEqual(result.renderedRoute, '/');
    });

    it('4. API returns malformed data — website remains stable (renders at /)', async () => {
        const mockFetch = async () => new Response(JSON.stringify({
            success: true,
            data: "not-an-object",
            invalid: 123
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

        const result = await evaluateHomeScreenSetting(mockFetch);
        assert.strictEqual(result.showHomeScreen, true);
        assert.strictEqual(result.redirectedTo, null);
        assert.strictEqual(result.renderedRoute, '/');
    });

    it('5. API returns an error (HTTP 500 / Network Error) — no unhandled exception occurs (renders at /)', async () => {
        const mockFetch = async () => new Response('Internal Server Error', {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });

        const result = await evaluateHomeScreenSetting(mockFetch);
        assert.strictEqual(result.showHomeScreen, true);
        assert.strictEqual(result.redirectedTo, null);
        assert.strictEqual(result.renderedRoute, '/');
    });
});
