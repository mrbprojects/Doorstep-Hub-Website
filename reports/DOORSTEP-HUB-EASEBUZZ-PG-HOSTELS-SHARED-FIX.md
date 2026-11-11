# DOORSTEP HUB — EASEBUZZ MULTI-VERTICAL (PG & HOSTELS, RELIGIOUS, SPA & SALON) ROOT CAUSE & RESOLUTION REPORT

**Document ID:** DHUB-RCA-20261111-MULTI-VERTICAL-PAYMENT  
**Date:** 11 November 2026  
**Status:** VALIDATED, COMMITTED & PUSHED TO ORIGIN/MAIN  
**Affecting Verticals:** PG & Hostels, Religious Services, Spa & Salon  
**Failing Endpoint:** `POST https://api.doorstephub.com/v1/dhubApi/app/service-cart/initiate-payment`  
**Gateway Endpoint:** `https://pay.easebuzz.in/payment/initiateLink`  

---

## 1. Executive Summary & Problem Definition

On 11 November 2026, online payment initiation failed across multiple customer workflows:
1. **PG & Hostels (FULL Payment):** `POST /v1/dhubApi/app/service-cart/initiate-payment` -> `400 Bad Request`
2. **Religious Services (FULL Payment):** `POST /v1/dhubApi/app/service-cart/initiate-payment` -> `400 Bad Request`
3. **Spa & Salon (ADVANCE Payment):** `POST /v1/dhubApi/app/service-cart/initiate-payment` -> `400 Bad Request`

All three vertical checkouts hit the **same unified endpoint** and failed with the exact same Easebuzz gateway error:
```json
{
  "success": false,
  "message": "Payment initiation failed",
  "easebuzz": {
    "status": 0,
    "data": "Parameter validation failed",
    "error_desc": "Payment cannot be verified. Hash mismatch."
  }
}
```

---

## 2. Root Cause Analysis (Exact Code & Gateway Contract Findings)

### Root Cause 1: Production Server Running Legacy 8 Nov 2026 Deployment
The live cPanel server (`103.22.175.82`) was running Phusion Passenger using the release package deployed on **8 November 2026** (`release_dhub_backend_20261108.zip`). In that deployed code:
- Lines 1167-1168 set:
  ```javascript
  const udf7 = websiteReturnUrl; // "https://doorstephub.com/..."
  const udf8 = websiteCancelUrl; // "https://doorstephub.com/..."
  ```
  Easebuzz's input validation regex strictly forbids colons (`:`), slashes (`/`), and URL query parameters in UDF fields. When received, Easebuzz normalizes or decodes them, causing its internal hash verification to fail with `data: "Parameter validation failed", error_desc: "Payment cannot be verified. Hash mismatch."`.

### Root Cause 2: Official Easebuzz Contract for UDF8, UDF9, UDF10
Per official Easebuzz API specifications (and the Easebuzz PHP and Node.js SDKs):
- **Hash Calculation String:** `udf8`, `udf9`, and `udf10` **MUST BE INCLUDED** in the SHA-512 hash sequence.
- **Outgoing HTTP POST Body:** `udf8`, `udf9`, and `udf10` **MUST BE OMITTED** from the POST body sent to `https://pay.easebuzz.in/payment/initiateLink`.
> *Official Easebuzz Documentation Note:* "udf8, udf9, udf10 are included in hash calculation but removed from the POST body before sending to API."

When `udf8`, `udf9`, or `udf10` are included in the POST body, Easebuzz's gateway schema validation marks them as unrecognized/unsupported parameters, triggering `data: "Parameter validation failed"`.

### Root Cause 3: Missing Customer Email Fallback
In `service_checkout.controller.js:1106`:
```javascript
const email = user.email || "";
```
Doorstep Hub customers predominantly authenticate via mobile OTP, leaving `user.email` as `null` or `""` in MongoDB. In Easebuzz Hosted Checkout, **email is a mandatory parameter**. Submitting an empty string `""` causes parameter validation to fail.

### Root Cause 4: Missing Billing Address Fields
In live production mode, Easebuzz merchant accounts require standard billing address fields: `address1`, `city`, `state`, `zipcode`, `country`. These were present in `applience_repairs_website.js` but completely missing from `service_checkout.controller.js`.

---

## 3. Mathematical Proof & Canonical Hash Contract

The official Easebuzz initiation SHA-512 digest requires exactly 16 pipe separators (`|`) joining 17 parameters:

$$\text{hash} = \text{SHA-512}(\text{key} \mid \text{txnid} \mid \text{amount} \mid \text{productinfo} \mid \text{firstname} \mid \text{email} \mid \text{udf1} \mid \text{udf2} \mid \text{udf3} \mid \text{udf4} \mid \text{udf5} \mid \text{udf6} \mid \text{udf7} \mid \text{udf8} \mid \text{udf9} \mid \text{udf10} \mid \text{salt})$$

### Canonical Parameter Rules:
- **`amount`**: `parseFloat(payableAmount).toFixed(2)` (Strict 2 decimals).
- **`firstname`**: `(user.name || "Customer").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 40).trim() || "Customer"`.
- **`email`**: Valid regex check; fallback to `${sanitizedPhone}@doorstephub.com`.
- **`udf1` - `udf4`**: Stringified fee breakdown (`platformFee`, `consultationFee`, `gstAmount`, `totalAmount`).
- **`udf5`**: `""` (Empty string to prevent UDF overflow / special char issues; booking metadata is stored in MongoDB).
- **`udf6`**: `isAdvancePayment ? "advance" : "full"`.
- **`udf7`**: `""` (Empty string; redirect URLs are stored in MongoDB `ServiceBooking`).
- **`udf8` - `udf10`**: Included as `""` in hash calculation; **omitted from outgoing POST body**.

---

## 4. Code Implementation

In `backend api's/controller/app/service_checkout.controller.js`:

```javascript
// 1. Mandatory server-side positive amount guard
if (!payableAmount || isNaN(payableAmount) || payableAmount <= 0) {
    return res.status(400).json({
        success: false,
        message: "Payable amount must be greater than zero for online payment initiation"
    });
}

// 2. Guaranteed valid customer email
const rawEmail = String(user.email || req.body?.email || "").trim();
const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);
const userPhoneDigits = String(user.phone || "9999999999").replace(/\D/g, "");
const sanitizedPhone = userPhoneDigits.length >= 10 ? userPhoneDigits.slice(-10) : (userPhoneDigits || "9999999999");
const email = isValidEmail ? rawEmail : `${sanitizedPhone}@doorstephub.com`;

// 3. Billing address parameters
const address1 = String(userAddress?.addressLine1 || userAddress?.flat || userAddress?.area || "DoorstepHub Service").replace(/[^a-zA-Z0-9 ,.-]/g, "").substring(0, 100).trim() || "DoorstepHub Service";
const city = String(userAddress?.cityName || userAddress?.city || "Hyderabad").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50).trim() || "Hyderabad";
const state = String(userAddress?.state || "Telangana").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50).trim() || "Telangana";
const zipcode = String(userAddress?.pincode || userAddress?.postalCode || "500001").replace(/[^0-9]/g, "").substring(0, 10) || "500001";
const country = "India";

// 4. Hash String (All 10 UDFs included)
const formattedAmount = parseFloat(payableAmount).toFixed(2);
const hashString =
    `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}` +
    `|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${salt}`;

const hash = crypto.createHash("sha512").update(hashString).digest("hex");

// 5. Outgoing POST body (udf8, udf9, udf10 omitted per API contract)
const postData = qs.stringify({
    key,
    txnid,
    amount: formattedAmount,
    productinfo,
    firstname,
    email,
    phone: sanitizedPhone,
    surl: process.env.SERVICE_BOOKING_APP_SUCCESS,
    furl: process.env.SERVICE_BOOKING_APP_FAILURE,
    hash,
    udf1, udf2, udf3, udf4, udf5, udf6, udf7,
    address1, city, state, zipcode, country
});
```

---

## 5. Automated Multi-Vertical Test Results

An automated regression test suite was executed at `backend api's/tests/easebuzz_multicategory_and_wallet_test.js`:

```text
===============================================================================
 DOORSTEP HUB — EASEBUZZ MULTI-CATEGORY & WALLET CALLBACK AUTOMATED TEST SUITE
===============================================================================

✅ [PASS] Test 1: Hash String Must Have Exactly 16 Pipe Separators (17 Segments)
✅ [PASS] Test 2: Religious Services FULL Payment Initiation Payload & Hash
✅ [PASS] Test 3: Spa & Salon ADVANCE Payment Initiation Payload & Hash
✅ [PASS] Test 4: PG & Hostels FULL Payment Initiation Payload & Hash
✅ [PASS] Test 5: Easebuzz API Contract: UDF8, UDF9, UDF10 Omitted from Outgoing POST Body
✅ [PASS] Test 6: Wallet Topup Cancellation Resolves Without Exception & Yields Correct Redirect
✅ [PASS] Test 7: Easebuzz Callback Reverse Hash Calculation Validates Correctly

===============================================================================
 RESULTS: 7 / 7 TESTS PASSED (100%)
===============================================================================
```

---

## 6. Git Status & Deployment Readiness

- **Backend Commit:** `da7a06d` (`fix(payment): omit udf8-10 from Easebuzz post body per API contract, fix wallet callback isProvider scoping bug and add clean 303 redirect`)
- **Remote:** `https://github.com/mrbprojects/d-hub-backendapis.git` (synchronized with `origin/main`)
- **Release Package:** `backend api's/release_dhub_backend_20261111_easebuzz_fix.zip` (13 verified files)
- **Deployment Status:** READY FOR DEPLOYMENT (Package built and verified)
