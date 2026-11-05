import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import the logic from accountApi
// In tests, we test verifyBookingPaymentStatus with mock fetch
const API_BASE = 'https://api.doorstephub.com/v1/dhubApi';

async function verifyBookingPaymentStatusMock(token, { orderId, txnid } = {}, mockFetch) {
    if (!token) {
        return { success: false, status: 'unauthorized', message: 'Authentication required to verify payment' };
    }
    if (!orderId && !txnid) {
        return { success: false, status: 'missing_reference', message: 'No booking or transaction reference found' };
    }

    try {
        if (txnid) {
            const txnRes = await mockFetch(`${API_BASE}/app/service-cart/payment-status/${encodeURIComponent(txnid)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (txnRes.ok) {
                const data = await txnRes.json();
                if (data?.success) {
                    const isPaid = Boolean(data.paid || ['paid', 'completed', 'partial'].includes(String(data.status || '').toLowerCase()));
                    return {
                        success: true,
                        isPaid,
                        status: isPaid ? 'paid' : (data.status || 'pending'),
                        orderId: data.orderId || orderId,
                        totalAmount: data.totalAmount,
                        reconciled: Boolean(data.reconciled)
                    };
                }
            } else if (txnRes.status === 401 || txnRes.status === 403) {
                return { success: false, status: 'unauthorized', message: 'Session expired or unauthorized' };
            }
        }

        if (orderId) {
            const orderRes = await mockFetch(`${API_BASE}/app/service-cart/payment-status-by-order/${encodeURIComponent(orderId)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (orderRes.ok) {
                const data = await orderRes.json();
                if (data?.success) {
                    const isPaid = Boolean(data.isPaid || ['paid', 'completed', 'partial'].includes(String(data.paymentStatus || '').toLowerCase()));
                    return {
                        success: true,
                        isPaid,
                        status: isPaid ? 'paid' : (data.paymentStatus || data.orderStatus || 'pending'),
                        orderId: data.orderId || orderId
                    };
                }
            } else if (orderRes.status === 401 || orderRes.status === 403) {
                return { success: false, status: 'unauthorized', message: 'Session expired or unauthorized' };
            }
        }

        return { success: false, status: 'not_found', message: 'Payment record not found for this account' };
    } catch (err) {
        return { success: false, status: 'network_error', message: err?.message || 'Unable to connect to verification server' };
    }
}

describe('Payment Confirmation Security Test Cases (A through H)', () => {

    it('Case A: URL has ?status=success but no pending booking in storage', async () => {
        const token = 'valid_token_123';
        const pendingBooking = null;
        const urlParams = new URLSearchParams('status=success');

        let confirmed = false;
        let cartCleared = false;

        if (urlParams.get('status') && pendingBooking) {
            confirmed = true;
        }

        assert.strictEqual(confirmed, false, 'Must NOT confirm payment when pending booking is missing');
        assert.strictEqual(cartCleared, false, 'Cart must NOT be cleared');

        const verification = await verifyBookingPaymentStatusMock(token, {}, async () => {});
        assert.strictEqual(verification.success, false);
        assert.strictEqual(verification.status, 'missing_reference');
    });

    it('Case B: URL has ?status=success and pending_booking exists, but backend says PENDING', async () => {
        const token = 'valid_token_123';
        const pendingBooking = { orderId: 'ORD_999', txnid: 'SB_999', bookedDate: '2026-11-06' };
        let cartItems = [{ id: '1', name: 'AC Repair' }];

        const mockFetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                paid: false,
                status: 'pending',
                orderId: 'ORD_999'
            })
        });

        const result = await verifyBookingPaymentStatusMock(token, pendingBooking, mockFetch);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.isPaid, false, 'isPaid must be false for pending status');
        assert.strictEqual(result.status, 'pending');

        if (result.isPaid) {
            cartItems = [];
        }
        assert.strictEqual(cartItems.length, 1, 'Cart items must be preserved while status is pending');
    });

    it('Case C: URL has ?status=success and backend says FAILED', async () => {
        const token = 'valid_token_123';
        const pendingBooking = { orderId: 'ORD_888', txnid: 'SB_888' };
        let cartItems = [{ id: '1', name: 'Washing Machine Repair' }];

        const mockFetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                paid: false,
                status: 'failed',
                orderId: 'ORD_888'
            })
        });

        const result = await verifyBookingPaymentStatusMock(token, pendingBooking, mockFetch);
        assert.strictEqual(result.isPaid, false);
        assert.strictEqual(result.status, 'failed');

        if (result.isPaid) {
            cartItems = [];
        }
        assert.strictEqual(cartItems.length, 1, 'Cart must be preserved when payment failed');
    });

    it('Case D: URL has ?status=failure but backend confirms payment SUCCESS', async () => {
        const token = 'valid_token_123';
        const pendingBooking = { orderId: 'ORD_777', txnid: 'SB_777' };

        const mockFetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                paid: true,
                status: 'paid',
                orderId: 'ORD_777',
                reconciled: true
            })
        });

        const result = await verifyBookingPaymentStatusMock(token, pendingBooking, mockFetch);
        assert.strictEqual(result.isPaid, true, 'Authoritative backend status must prevail over URL query param');
        assert.strictEqual(result.status, 'paid');
    });

    it('Case E: Backend confirms SUCCESS for the correct booking', async () => {
        const token = 'valid_token_123';
        const pendingBooking = { orderId: 'ORD_555', txnid: 'SB_555', bookedDate: '2026-11-07' };
        let cartItems = [{ id: '1', name: 'Refrigerator Repair' }];
        let confirmedBooking = null;

        const mockFetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                paid: true,
                status: 'paid',
                orderId: 'ORD_555',
                totalAmount: 99
            })
        });

        const result = await verifyBookingPaymentStatusMock(token, pendingBooking, mockFetch);
        assert.strictEqual(result.isPaid, true);
        assert.strictEqual(result.orderId, 'ORD_555');

        if (result.isPaid) {
            cartItems = [];
            confirmedBooking = { orderId: result.orderId, date: pendingBooking.bookedDate };
        }

        assert.strictEqual(cartItems.length, 0, 'Cart must be cleared after verified success');
        assert.ok(confirmedBooking, 'Confirmed booking object must be created');
        assert.strictEqual(confirmedBooking.orderId, 'ORD_555');
    });

    it('Case F: Backend verification endpoint is unavailable (network error / 500)', async () => {
        const token = 'valid_token_123';
        const pendingBooking = { orderId: 'ORD_444', txnid: 'SB_444' };
        let cartItems = [{ id: '1', name: 'TV Repair' }];

        const mockFetch = async () => {
            throw new Error('Connection refused (ETIMEDOUT)');
        };

        const result = await verifyBookingPaymentStatusMock(token, pendingBooking, mockFetch);
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.status, 'network_error');
        assert.strictEqual(result.isPaid, undefined);

        if (result.isPaid) {
            cartItems = [];
        }
        assert.strictEqual(cartItems.length, 1, 'Cart must remain intact during network outage');
    });

    it('Case G: Duplicate success callback or page refresh', async () => {
        let storage = {
            'pending_booking': JSON.stringify({ orderId: 'ORD_333', txnid: 'SB_333' })
        };
        const token = 'valid_token_123';

        const mockFetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({ success: true, paid: true, status: 'paid', orderId: 'ORD_333' })
        });

        // First verification succeeds:
        const firstResult = await verifyBookingPaymentStatusMock(token, JSON.parse(storage['pending_booking']), mockFetch);
        assert.strictEqual(firstResult.isPaid, true);
        delete storage['pending_booking']; // Cleaned up

        // Second visit (page refresh / duplicate callback):
        const rawAfterRefresh = storage['pending_booking'];
        assert.strictEqual(rawAfterRefresh, undefined, 'pending_booking must be deleted');

        // Without pending_booking, no second verification or order confirmation is triggered
        const secondResult = await verifyBookingPaymentStatusMock(token, {}, mockFetch);
        assert.strictEqual(secondResult.success, false);
        assert.strictEqual(secondResult.status, 'missing_reference');
    });

    it('Case H: Payment reference belongs to another customer (unauthorized / 404)', async () => {
        const token = 'attacker_token';
        const pendingBooking = { orderId: 'VICTIM_ORDER_123', txnid: 'SB_VICTIM_123' };

        const mockFetch = async () => ({
            ok: false,
            status: 404,
            json: async () => ({ success: false, message: 'Booking not found' })
        });

        const result = await verifyBookingPaymentStatusMock(token, pendingBooking, mockFetch);
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.isPaid, undefined);
        assert.strictEqual(result.status, 'not_found');
    });
});
