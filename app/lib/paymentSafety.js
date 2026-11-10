/**
 * Universal Payment Safety & Checkout Routing Evaluator
 * 
 * Enforces strict financial, security, and business validation across all 5 checkout verticals:
 * 1. A zero advance amount must not automatically convert a paid service into COD.
 * 2. A NaN amount must never trigger free checkout or COD; payment must be blocked.
 * 3. Negative or invalid amounts must block payment.
 * 4. A valid positive full amount must remain payable even when advance is zero.
 * 5. Free-service checkout (strictly total === 0) routes to checkout without gateway roundtrip.
 * 6. COD must follow existing business eligibility and server-side rules.
 * 7. Never trust frontend-calculated payable amounts without backend validation.
 * 8. Preserve valid advance (advPayment > 0) and full-payment options.
 * 9. Preserve existing booking date, time and address validation.
 * 10. Never mark a booking paid solely because frontend payable amount is zero.
 */

export function evaluatePaymentSafety({
    cartData,
    paymentMethod = 'ONLINE',
    paymentOption = 'FULL'
}) {
    if (!cartData) {
        return {
            valid: false,
            error: 'Cart information is missing. Please refresh and try again.',
            blockCheckout: true
        };
    }

    const rawTotal = cartData.finalAmount;
    if (rawTotal === undefined || rawTotal === null || rawTotal === '') {
        return {
            valid: false,
            error: 'Missing service pricing details. Payment blocked.',
            blockCheckout: true
        };
    }

    const totalAmount = Number(rawTotal);
    if (isNaN(totalAmount)) {
        return {
            valid: false,
            error: 'Invalid order amount (NaN). Payment blocked.',
            blockCheckout: true
        };
    }

    if (totalAmount < 0) {
        return {
            valid: false,
            error: 'Invalid order amount (negative). Payment blocked.',
            blockCheckout: true
        };
    }

    // Evaluate Advance Payment Eligibility
    const rawAdvance = cartData.advPayment;
    const advanceAmount = Number(rawAdvance || 0);
    const hasValidAdvance = !isNaN(advanceAmount) && advanceAmount > 0;

    let effectivePaymentOption = 'FULL';
    if (paymentOption === 'ADVANCE') {
        if (hasValidAdvance) {
            effectivePaymentOption = 'ADVANCE';
        } else {
            // When advance is 0 or unavailable, fall back to FULL payment.
            // Do NOT convert a paid service to COD or free checkout.
            effectivePaymentOption = 'FULL';
        }
    }

    const rawPayable = effectivePaymentOption === 'ADVANCE' ? advanceAmount : totalAmount;
    const payableAmount = Number(rawPayable);

    if (isNaN(payableAmount)) {
        return {
            valid: false,
            error: 'Invalid payable amount (NaN). Payment blocked.',
            blockCheckout: true
        };
    }

    if (payableAmount < 0) {
        return {
            valid: false,
            error: 'Invalid payable amount (negative). Payment blocked.',
            blockCheckout: true
        };
    }

    // Case 1: Genuinely Free Service (Total amount is strictly 0.00)
    if (totalAmount === 0) {
        if (payableAmount !== 0) {
            return {
                valid: false,
                error: 'Pricing inconsistency detected on free service. Payment blocked.',
                blockCheckout: true
            };
        }

        return {
            valid: true,
            isFreeService: true,
            payableAmount: 0,
            effectivePaymentOption: 'FULL',
            finalPaymentMethod: 'COD', // Direct to /app/service-cart/checkout; server sets status: pending
            adv: false,
            endpointType: 'checkout',
            shouldCallGateway: false,
            blockCheckout: false
        };
    }

    // Case 2: Tampered or Inconsistent Zero Payable on Paid Service
    if (payableAmount === 0 && totalAmount > 0) {
        return {
            valid: false,
            error: 'Zero payable amount is not permitted for a paid service. Payment blocked.',
            blockCheckout: true
        };
    }

    // Case 3: Paid Service with Online Gateway Initiation
    if (paymentMethod === 'ONLINE') {
        return {
            valid: true,
            isFreeService: false,
            payableAmount,
            effectivePaymentOption,
            finalPaymentMethod: 'ONLINE',
            adv: effectivePaymentOption === 'ADVANCE',
            endpointType: 'initiate-payment',
            shouldCallGateway: true,
            blockCheckout: false
        };
    }

    // Case 4: COD or WALLET for Paid Service
    return {
        valid: true,
        isFreeService: false,
        payableAmount,
        effectivePaymentOption,
        finalPaymentMethod: paymentMethod || 'COD',
        adv: effectivePaymentOption === 'ADVANCE',
        endpointType: 'checkout',
        shouldCallGateway: false,
        blockCheckout: false
    };
}
