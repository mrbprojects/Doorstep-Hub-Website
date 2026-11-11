# DOORSTEP HUB — WALLET TOP-UP CANCELLATION ROOT CAUSE ANALYSIS & RESOLUTION REPORT

**Document ID:** DHUB-RCA-20261111-WALLET-CANCELLATION  
**Date:** 11 November 2026  
**Status:** VALIDATED, COMMITTED & PUSHED TO ORIGIN/MAIN  
**Affected Workflow:** Website D-Hub Wallet Add Money Cancellation & Failure  
**Failing Callback Endpoint:** `POST https://api.doorstephub.com/v1/dhubApi/app/wallet/topup/callback`  
**Observed Error:** `HTTP 500 Internal Server Error — Payment processing failed`  

---

## 1. Problem Description

When a customer initiates "Add Money" on the Doorstep Hub website wallet (`https://doorstephub.com/account/wallet`) and proceeds to the Easebuzz payment gateway, clicking **"Cancel"** or exiting the payment on Easebuzz resulted in:
1. Easebuzz POSTing the callback to `POST /v1/dhubApi/app/wallet/topup/callback` with `status: "userCancelled"`.
2. The browser remaining stuck on the raw backend API URL (`https://api.doorstephub.com/v1/dhubApi/app/wallet/topup/callback`).
3. The page rendering a plain white screen with:
   ```text
   HTTP 500 Internal Server Error
   Payment processing failed
   ```

---

## 2. Root Cause Analysis (Exact Code & Line Number)

### The Primary Cause: Variable Scoping `ReferenceError`
In `backend api's/controller/service_provider/walletCallbacks.controller.js:415-442`:

```javascript
// Failure endpoint
exports.walletPaymentFailure = async (req, res) => {
    console.log("❌ Payment Failed Callback:", req.body);

    const txnid = req.body?.txnid || "";
    const amount = req.body?.amount || "0";

    try {
        const { logGatewayTransaction } = require("../../utils/logGatewayTransaction");
        const productinfo = String(req.body.productinfo || "").toLowerCase();
        // Line 424: isProvider is declared INSIDE the try block:
        const isProvider = productinfo.includes("provider") || String(txnid).startsWith("PRVWLT") || String(txnid).startsWith("TXN");
        await logGatewayTransaction(req.body, { ... });
    } catch (logErr) {
        console.error("[walletPaymentFailure] logGatewayTransaction error:", logErr.message);
    }

    const udf2 = req.body?.udf2 || "";
    // Line 441: OUTSIDE the try block, isProvider is accessed:
    const returnTargetUrl = resolveWalletReturnUrl(udf2, isProvider ? "provider" : "user");
```

In JavaScript (ES6+), `const` declarations are block-scoped. Because `isProvider` was declared inside `try { ... }`, attempting to access `isProvider` at line 441 outside the block unconditionally threw:
```text
ReferenceError: isProvider is not defined
    at exports.walletPaymentFailure (walletCallbacks.controller.js:441)
```

The exception was caught by the outer `try...catch` block in `controller/app/userWallet.controller.js:594-597`:
```javascript
exports.handleUserWalletTopupCallback = async (req, res) => {
    try {
        ...
    } catch (err) {
        console.error("User Wallet Callback Error:", err);
        return res.status(500).send("Payment processing failed");
    }
};
```
This returned `HTTP 500: Payment processing failed` directly to the customer's browser, completely halting navigation.

---

## 3. The Permanent Resolution

### 1. Fix Scoping in `walletCallbacks.controller.js`
Moved variable declarations to the top of `walletPaymentFailure` before the `try` block:
```javascript
exports.walletPaymentFailure = async (req, res) => {
    console.log("❌ Payment Failed/Cancelled Callback:", req.body);

    const txnid = req.body?.txnid || "";
    const amount = req.body?.amount || "0";
    const status = String(req.body?.status || "failed").toLowerCase();
    const productinfo = String(req.body?.productinfo || "").toLowerCase();
    const isProvider = productinfo.includes("provider") || String(txnid).startsWith("PRVWLT") || String(txnid).startsWith("TXN");
    const userRole = isProvider ? "provider" : "user";
    const isCancelled = status.includes("cancel") || status.includes("usercancelled");

    try {
        const { logGatewayTransaction } = require("../../utils/logGatewayTransaction");
        await logGatewayTransaction(req.body, {
            paymentStatus: isCancelled ? "cancelled" : "failed",
            paymentType: isProvider ? "partner_wallet_recharge" : "customer_wallet_recharge",
            customerName: req.body.firstname || "",
            customerPhone: req.body.phone || "",
            customerEmail: req.body.email || "",
            amount: Number(amount),
            txnId: txnid,
            source: isProvider ? "provider_wallet_topup" : "user_wallet_topup",
            failureReason: req.body.error_Message || req.body.status || (isCancelled ? "Payment cancelled by user" : "Payment failed"),
        });
    } catch (logErr) {
        console.error("[walletPaymentFailure] logGatewayTransaction error:", logErr.message);
    }
```

### 2. Standard HTTP 303 Redirect to Website Wallet
Appended the status query parameters and returned an immediate `HTTP 303 See Other` redirect to the customer's wallet page:
```javascript
    const udf2 = req.body?.udf2 || "";
    let returnTargetUrl = resolveWalletReturnUrl(udf2, userRole);

    try {
        const u = new URL(returnTargetUrl);
        u.searchParams.set("status", isCancelled ? "cancelled" : "failure");
        if (txnid) u.searchParams.set("txnid", txnid);
        returnTargetUrl = u.toString();
    } catch (_) {
        const sep = returnTargetUrl.includes("?") ? "&" : "?";
        returnTargetUrl += `${sep}status=${isCancelled ? "cancelled" : "failure"}${txnid ? `&txnid=${encodeURIComponent(txnid)}` : ""}`;
    }

    // Clean browser redirect back to the customer-facing website
    if (req.headers?.accept?.includes("text/html") || req.method === "POST") {
        return res.redirect(303, returnTargetUrl);
    }
```

### 3. Fail-Safe Catch Block in `userWallet.controller.js`
Guaranteed that even if an unforeseen error occurs, the customer is never left on a raw 500 page:
```javascript
    } catch (err) {
        console.error("User Wallet Callback Error:", err);
        const websiteBase = (process.env.WEBSITE_BASE_URL || process.env.FRONTEND_URL || "https://doorstephub.com").trim().replace(/\/$/, "");
        const txnid = String(req.body?.txnid || "").trim();
        const fallbackUrl = `${websiteBase}/account/wallet?status=failure${txnid ? `&txnid=${encodeURIComponent(txnid)}` : ""}`;
        if (req.headers?.accept?.includes("text/html") || req.method === "POST") {
            return res.redirect(303, fallbackUrl);
        }
        return res.status(200).send("Payment callback received");
    }
```

---

## 4. Financial & Wallet Ledger Integrity Verification

1. **Zero Balance Change on Cancellation:**
   - Cancelled and failed transactions execute `walletPaymentFailure`.
   - `walletPaymentFailure` performs **NO** database mutations on `Wallet` or `WalletTransaction` balances.
   - The user's `currentBalance`, `withdrawableBalance`, and `lockedBalance` remain 100% untouched.
2. **Idempotency on Success:**
   - Successful callbacks verify `WalletTransaction.findOne({ referenceId: txnid, event: "wallet_topup", status: "success" })`.
   - If a transaction was already processed, it returns immediately without re-crediting the balance.
3. **Frontend Modal Coordination:**
   - When the user is redirected to `https://doorstephub.com/account/wallet?status=cancelled&txnid=USRWLT...`, the frontend wallet page (`app/account/wallet/page.js:280-288`) detects `status === 'cancelled'` and opens the native modal:
     > **Payment Cancelled**  
     > *You cancelled the transaction at the payment gateway. No money was deducted from your account.*
   - Two clear actions are provided: **Return to Wallet** and **Try Again**.

---

## 5. Automated Verification Test Evidence

Unit test `Test 6` in `tests/easebuzz_multicategory_and_wallet_test.js` executed:
```text
✅ [PASS] Test 6: Wallet Topup Cancellation Resolves Without Exception & Yields Correct Redirect
   Redirect HTTP Code: 303
   Target URL: https://doorstephub.com/account/wallet?status=cancelled&txnid=USRWLT1762840000123
```

---

## 6. Git Status & Deployment Instructions

- **Commit:** `da7a06d`
- **Remote:** `https://github.com/mrbprojects/d-hub-backendapis.git` (pushed to `origin/main`)
- **Package:** `backend api's/release_dhub_backend_20261111_easebuzz_fix.zip`
- **Files Included:**
  - `controller/app/service_checkout.controller.js`
  - `controller/app/userWallet.controller.js`
  - `controller/service_provider/walletCallbacks.controller.js`
  - `routers/appRoutes/user_notification.routes.js`
  - `routers/appRoutes/appMainRoutes.js`
