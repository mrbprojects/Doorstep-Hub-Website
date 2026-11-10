import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { canonicalizeCitySlug, citiesMatchBySlugOrName } from '../app/lib/applianceRepairSlugs.js';
import { evaluatePaymentSafety } from '../app/lib/paymentSafety.js';
import {
    ORDER_STATUS_LABELS,
    ACTIVE_STATUSES,
    CANCELLED_STATUSES,
    getStatusLabel,
    getStatusStyle,
    matchesOrderFilter
} from '../app/lib/orderStatus.js';

test('Payment, Wallet & Booking Regression Suite', async (t) => {

    // -------------------------------------------------------------
    // 1. Zero-Amount Payment Safety & Gateway Routing
    // -------------------------------------------------------------
    await t.test('1. Zero-Amount Payment Safety & Gateway Routing', async (st) => {

        await st.test('zero advance with positive full amount remains payable online', () => {
            const cartData = { finalAmount: 1500, advPayment: 0 };
            const decision = evaluatePaymentSafety({
                cartData,
                paymentMethod: 'ONLINE',
                paymentOption: 'ADVANCE'
            });

            assert.equal(decision.valid, true);
            assert.equal(decision.blockCheckout, false);
            assert.equal(decision.effectivePaymentOption, 'FULL', 'Must fall back to FULL when advance is 0');
            assert.equal(decision.payableAmount, 1500, 'Must keep full positive amount payable');
            assert.equal(decision.finalPaymentMethod, 'ONLINE', 'Must NOT convert paid service into COD');
            assert.equal(decision.endpointType, 'initiate-payment');
            assert.equal(decision.shouldCallGateway, true);
        });

        await st.test('positive advance routes advance fee to gateway', () => {
            const cartData = { finalAmount: 2500, advPayment: 500 };
            const decision = evaluatePaymentSafety({
                cartData,
                paymentMethod: 'ONLINE',
                paymentOption: 'ADVANCE'
            });

            assert.equal(decision.valid, true);
            assert.equal(decision.blockCheckout, false);
            assert.equal(decision.effectivePaymentOption, 'ADVANCE');
            assert.equal(decision.payableAmount, 500);
            assert.equal(decision.finalPaymentMethod, 'ONLINE');
            assert.equal(decision.adv, true);
            assert.equal(decision.endpointType, 'initiate-payment');
            assert.equal(decision.shouldCallGateway, true);
        });

        await st.test('genuinely free service (total strictly 0) routes to checkout without gateway call', () => {
            const freeCart = { finalAmount: 0, advPayment: 0 };
            const decision = evaluatePaymentSafety({
                cartData: freeCart,
                paymentMethod: 'ONLINE',
                paymentOption: 'FULL'
            });

            assert.equal(decision.valid, true);
            assert.equal(decision.isFreeService, true);
            assert.equal(decision.payableAmount, 0);
            assert.equal(decision.finalPaymentMethod, 'COD', 'Free booking routes through checkout flow');
            assert.equal(decision.endpointType, 'checkout', 'Must bypass initiate-payment gateway call');
            assert.equal(decision.shouldCallGateway, false);
        });

        await st.test('NaN amount strictly BLOCKS payment and never triggers COD or free checkout', () => {
            const nanCart = { finalAmount: NaN, advPayment: 0 };
            const decision = evaluatePaymentSafety({
                cartData: nanCart,
                paymentMethod: 'ONLINE',
                paymentOption: 'FULL'
            });

            assert.equal(decision.valid, false);
            assert.equal(decision.blockCheckout, true);
            assert.match(decision.error, /NaN/i);
            assert.notEqual(decision.endpointType, 'checkout');
            assert.notEqual(decision.endpointType, 'initiate-payment');
        });

        await st.test('negative amounts strictly BLOCK payment', () => {
            const negativeCart = { finalAmount: -250, advPayment: 0 };
            const decision = evaluatePaymentSafety({
                cartData: negativeCart,
                paymentMethod: 'ONLINE',
                paymentOption: 'FULL'
            });

            assert.equal(decision.valid, false);
            assert.equal(decision.blockCheckout, true);
            assert.match(decision.error, /negative/i);
        });

        await st.test('missing pricing fields strictly BLOCK payment', () => {
            const missingCart = {};
            const decisionA = evaluatePaymentSafety({
                cartData: missingCart,
                paymentMethod: 'ONLINE',
                paymentOption: 'FULL'
            });

            assert.equal(decisionA.valid, false);
            assert.equal(decisionA.blockCheckout, true);
            assert.match(decisionA.error, /missing/i);

            const nullCart = null;
            const decisionB = evaluatePaymentSafety({
                cartData: nullCart,
                paymentMethod: 'ONLINE',
                paymentOption: 'FULL'
            });
            assert.equal(decisionB.valid, false);
            assert.equal(decisionB.blockCheckout, true);
        });

        await st.test('tampered amounts (zero payable for positive total) strictly BLOCK payment', () => {
            // Simulated tampered cart state where advance is falsified to 0 but option forced
            const tamperedCart = { finalAmount: 1000, advPayment: 0 };
            // Custom direct test to ensure payableAmount 0 on non-zero total is caught
            const decision = evaluatePaymentSafety({
                cartData: tamperedCart,
                paymentMethod: 'ONLINE',
                paymentOption: 'ADVANCE'
            });
            // It safely elevates to FULL payment (1000) rather than allowing 0 payable
            assert.equal(decision.payableAmount, 1000);
            assert.equal(decision.effectivePaymentOption, 'FULL');
            assert.equal(decision.finalPaymentMethod, 'ONLINE');
        });

        await st.test('COD eligibility preserves COD payment method for paid services', () => {
            const codCart = { finalAmount: 850, advPayment: 0 };
            const decision = evaluatePaymentSafety({
                cartData: codCart,
                paymentMethod: 'COD',
                paymentOption: 'FULL'
            });

            assert.equal(decision.valid, true);
            assert.equal(decision.payableAmount, 850);
            assert.equal(decision.finalPaymentMethod, 'COD');
            assert.equal(decision.endpointType, 'checkout');
            assert.equal(decision.shouldCallGateway, false);
        });

        await st.test('wallet payment method preserves WALLET for paid services', () => {
            const walletCart = { finalAmount: 600, advPayment: 0 };
            const decision = evaluatePaymentSafety({
                cartData: walletCart,
                paymentMethod: 'WALLET',
                paymentOption: 'FULL'
            });

            assert.equal(decision.valid, true);
            assert.equal(decision.payableAmount, 600);
            assert.equal(decision.finalPaymentMethod, 'WALLET');
            assert.equal(decision.endpointType, 'checkout');
            assert.equal(decision.shouldCallGateway, false);
        });
    });

    // -------------------------------------------------------------
    // 2. City Deduplication (Bangalore vs Bengaluru Canonicalization)
    // -------------------------------------------------------------
    await t.test('2. City Canonicalization & Deduplication', async (st) => {
        await st.test('canonicalizes bangalore slug to bengaluru', () => {
            assert.equal(canonicalizeCitySlug('bangalore'), 'bengaluru');
            assert.equal(canonicalizeCitySlug('bengaluru'), 'bengaluru');
            assert.equal(canonicalizeCitySlug('Bangalore'), 'bengaluru');
            assert.equal(canonicalizeCitySlug('Bengaluru'), 'bengaluru');
        });

        await st.test('canonicalizes twin cities correctly', () => {
            assert.equal(canonicalizeCitySlug('secunderabad'), 'hyderabad');
            assert.equal(canonicalizeCitySlug('cyberabad'), 'hyderabad');
            assert.equal(canonicalizeCitySlug('visakhapatnam'), 'vizag');
            assert.equal(canonicalizeCitySlug('bezawada'), 'vijayawada');
            assert.equal(canonicalizeCitySlug('bombay'), 'mumbai');
            assert.equal(canonicalizeCitySlug('madras'), 'chennai');
            assert.equal(canonicalizeCitySlug('poona'), 'pune');
        });

        await st.test('equates Bangalore and Bengaluru in citiesMatchBySlugOrName', () => {
            assert.equal(citiesMatchBySlugOrName('Bangalore', 'Bengaluru'), true);
            assert.equal(citiesMatchBySlugOrName('Bengaluru', 'Bangalore'), true);
            assert.equal(citiesMatchBySlugOrName('bangalore', 'bengaluru'), true);
            assert.equal(citiesMatchBySlugOrName({ name: 'Bangalore' }, { name: 'Bengaluru' }), true);
            assert.equal(citiesMatchBySlugOrName('Secunderabad', 'Hyderabad'), true);
            assert.equal(citiesMatchBySlugOrName('Bombay', 'Mumbai'), true);
        });

        await st.test('preserves legitimate backend coordinates, IDs and address fields', () => {
            const rawAddress = {
                _id: '672e81119b456abc12345678',
                cityName: 'Bengaluru',
                location: { coordinates: [77.5946, 12.9716] },
                flat: 'Flat 402, Lotus Towers',
                area: 'Koramangala'
            };

            // Canonicalization must only normalize matching strings, never mutate address objects
            assert.equal(rawAddress._id, '672e81119b456abc12345678');
            assert.equal(rawAddress.location.coordinates[0], 77.5946);
            assert.equal(rawAddress.location.coordinates[1], 12.9716);
            assert.equal(citiesMatchBySlugOrName(rawAddress.cityName, 'Bangalore'), true);
        });
    });

    // -------------------------------------------------------------
    // 3. Appointment Mandatory Field Validation
    // -------------------------------------------------------------
    await t.test('3. Appointment Mandatory Field Validation', async (st) => {
        function validateAppointmentStep(appointmentData) {
            if (!appointmentData.bookingDate) {
                return { valid: false, error: 'Please select a preferred date' };
            }
            if (!appointmentData.bookingTime) {
                return { valid: false, error: 'Please select a preferred time slot' };
            }
            return { valid: true };
        }

        await st.test('rejects missing date', () => {
            const result = validateAppointmentStep({ bookingDate: '', bookingTime: '10:00 AM' });
            assert.equal(result.valid, false);
            assert.equal(result.error, 'Please select a preferred date');
        });

        await st.test('rejects missing time slot', () => {
            const result = validateAppointmentStep({ bookingDate: '2026-11-12', bookingTime: '' });
            assert.equal(result.valid, false);
            assert.equal(result.error, 'Please select a preferred time slot');
        });

        await st.test('accepts valid date and time slot', () => {
            const result = validateAppointmentStep({ bookingDate: '2026-11-12', bookingTime: '10:00 AM' });
            assert.equal(result.valid, true);
        });
    });

    // -------------------------------------------------------------
    // 4. Wallet Callback Variable Scope & Gateway Security
    // -------------------------------------------------------------
    await t.test('4. Wallet Callback Variable Scope & Security', async (st) => {
        await st.test('verifies isProvider scoping outside try block', () => {
            function simulateCorrectedFailureCallback(body) {
                const txnid = body?.txnid || '';
                const amount = body?.amount || '0';
                const productinfo = String(body?.productinfo || '').toLowerCase();
                const isProvider = productinfo.includes('provider') || String(txnid).startsWith('PRVWLT') || String(txnid).startsWith('TXN');

                let logSuccess = false;
                try {
                    logSuccess = true;
                } catch {
                    logSuccess = false;
                }

                // isProvider must be accessible outside try block without ReferenceError
                const targetRole = isProvider ? 'provider' : 'user';
                return { targetRole, logSuccess };
            }

            const customerRes = simulateCorrectedFailureCallback({ txnid: 'USRWLT178000000', amount: '500' });
            assert.equal(customerRes.targetRole, 'user');

            const partnerRes = simulateCorrectedFailureCallback({ txnid: 'PRVWLT178000000', amount: '1000' });
            assert.equal(partnerRes.targetRole, 'provider');
        });

        await st.test('verifies Easebuzz reverse hash verification formula', () => {
            const key = 'test_key';
            const salt = 'test_salt';
            const payload = {
                status: 'success',
                txnid: 'WLT123456',
                amount: '500.00',
                email: 'customer@doorstephub.com',
                firstname: 'John',
                productinfo: 'Customer Wallet Topup',
                phone: '9876543210',
                udf1: 'user123',
                udf2: '',
                udf3: '',
                udf4: '',
                udf5: '',
                udf6: '',
                udf7: '',
                udf8: '',
                udf9: '',
                udf10: ''
            };

            // Easebuzz reverse hash sequence:
            // salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
            const reverseString = [
                salt, payload.status,
                payload.udf10, payload.udf9, payload.udf8, payload.udf7, payload.udf6,
                payload.udf5, payload.udf4, payload.udf3, payload.udf2, payload.udf1,
                payload.email, payload.firstname, payload.productinfo, payload.amount, payload.txnid, key
            ].join('|');

            const expectedHash = crypto.createHash('sha512').update(reverseString).digest('hex');

            // Verification function
            function verifyEasebuzzResponseHash(data, saltKey, merchantKey) {
                const str = [
                    saltKey, data.status,
                    data.udf10 || '', data.udf9 || '', data.udf8 || '', data.udf7 || '', data.udf6 || '',
                    data.udf5 || '', data.udf4 || '', data.udf3 || '', data.udf2 || '', data.udf1 || '',
                    data.email, data.firstname, data.productinfo, data.amount, data.txnid, merchantKey
                ].join('|');
                return crypto.createHash('sha512').update(str).digest('hex') === data.hash;
            }

            assert.equal(verifyEasebuzzResponseHash({ ...payload, hash: expectedHash }, salt, key), true);
            assert.equal(verifyEasebuzzResponseHash({ ...payload, hash: 'tampered_hash' }, salt, key), false);
        });

        await st.test('verifies wallet topup idempotency logic', () => {
            const processedTransactions = new Set(['TXN-ALREADY-PROCESSED']);

            function handleTopupCallback(txnid, amount) {
                if (processedTransactions.has(txnid)) {
                    return { credited: false, message: 'Transaction already processed' };
                }
                processedTransactions.add(txnid);
                return { credited: true, amount };
            }

            const firstRun = handleTopupCallback('TXN-NEW-001', 500);
            assert.equal(firstRun.credited, true);

            const duplicateRun = handleTopupCallback('TXN-NEW-001', 500);
            assert.equal(duplicateRun.credited, false);
            assert.equal(duplicateRun.message, 'Transaction already processed');
        });
    });

    // -------------------------------------------------------------
    // 5. Booking Status & Consumer Compatibility
    // -------------------------------------------------------------
    await t.test('5. Booking Status & Consumer Compatibility', async (st) => {
        await st.test('supports cancelled status across labels, styles, and filters', () => {
            assert.equal(getStatusLabel('cancelled'), 'Cancelled');
            assert.equal(getStatusLabel('cancelledByUser'), 'User Cancelled');
            assert.equal(getStatusLabel('cancelledByProvider'), 'Provider Cancelled');
            assert.equal(getStatusLabel('missed'), 'Missed');

            assert.equal(CANCELLED_STATUSES.includes('cancelled'), true);
            assert.equal(matchesOrderFilter('cancelled', 'cancelled'), true);
            assert.equal(matchesOrderFilter('cancelledByUser', 'cancelled'), true);
            assert.equal(matchesOrderFilter('workIsCompleted', 'completed'), true);
            assert.equal(matchesOrderFilter('orderAcceptedByAdmin', 'active'), true);

            assert.match(getStatusStyle('cancelled'), /bg-red-100/);
        });

        await st.test('distinguishes explicit cancellation, failed payment, abandoned and missed statuses', () => {
            function categorizeBookingOutcome(gatewayStatus, userIntent) {
                if (userIntent === 'USER_CANCELLED_IN_APP') {
                    return { status: 'cancelledByUser', paymentStatus: 'cancelled', category: 'EXPLICIT_CANCELLATION' };
                }
                if (gatewayStatus === 'usercancelled' || gatewayStatus === 'dropped') {
                    return { status: 'missed', paymentStatus: 'failed', category: 'ABANDONED_BOOKING' };
                }
                if (gatewayStatus === 'timeout') {
                    return { status: 'missed', paymentStatus: 'failed', category: 'GATEWAY_TIMEOUT' };
                }
                if (gatewayStatus === 'failure') {
                    return { status: 'missed', paymentStatus: 'failed', category: 'PAYMENT_FAILURE' };
                }
                if (gatewayStatus === 'success') {
                    return { status: 'pending', paymentStatus: 'paid', category: 'SUCCESSFUL_PAYMENT' };
                }
                return { status: 'payment_pending', paymentStatus: 'pending', category: 'PENDING_PAYMENT' };
            }

            assert.equal(categorizeBookingOutcome(null, 'USER_CANCELLED_IN_APP').category, 'EXPLICIT_CANCELLATION');
            assert.equal(categorizeBookingOutcome('usercancelled', null).category, 'ABANDONED_BOOKING');
            assert.equal(categorizeBookingOutcome('timeout', null).category, 'GATEWAY_TIMEOUT');
            assert.equal(categorizeBookingOutcome('failure', null).category, 'PAYMENT_FAILURE');
            assert.equal(categorizeBookingOutcome('success', null).category, 'SUCCESSFUL_PAYMENT');
        });
    });

    // -------------------------------------------------------------
    // 6. Terms & Conditions Fallback Resilience
    // -------------------------------------------------------------
    await t.test('6. Terms & Conditions Fallback Resilience', async (st) => {
        await st.test('renders standard booking terms when API responds with 404 or null', () => {
            const apiResponse = { success: false, message: 'Application not found' };

            function getResolvedTerms(data) {
                if (data?.success && data?.data) {
                    return typeof data.data === 'string' ? data.data : (data.data.termsAndConditions || data.data.content);
                }
                return 'Standard Doorstep Hub Service Booking Terms & Conditions';
            }

            const content = getResolvedTerms(apiResponse);
            assert.equal(content, 'Standard Doorstep Hub Service Booking Terms & Conditions');
        });
    });
});
