# Doorstep Hub — Post-Deployment Live Verification Report

**Status:** **PENDING PRODUCTION RELEASE**  
**Execution Note:** As required by safety guidelines, this live verification report is pre-structured and marked *Pending* until production deployment has been authorized and completed.

---

## 1. Post-Deployment Verification Checklist (To Be Executed Post-Release)

Once deployment is authorized and pushed to production:
1. **Live Header & SSL Verification:**
   - Fetch `https://doorstephub.com` with `curl -I`.
   - Verify `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and HTTP 200 response.
2. **Robots.txt Live Verification:**
   - Fetch `https://doorstephub.com/robots.txt`.
   - Verify only `/api/` and `/admin/` are disallowed; sitemap points to `https://doorstephub.com/sitemap.xml`.
3. **Redirect Verification:**
   - Fetch `https://doorstephub.com/appliance-repair-services` -> Confirm HTTP 308 redirect to `/appliances`.
   - Fetch `https://doorstephub.com/pg-hostel` -> Confirm HTTP 308 redirect to `/pghostels`.
   - Fetch `https://doorstephub.com/religious` -> Confirm HTTP 308 redirect to `/religious-services`.
   - Fetch `https://doorstephub.com/blog` -> Confirm HTTP 308 redirect to `/knowledge`.
4. **Sitemap Index Accessibility:**
   - Fetch `https://doorstephub.com/sitemap.xml` -> Confirm valid XML declaration and sitemap index payload.
5. **City Hub Pre-rendering Verification:**
   - Fetch `https://doorstephub.com/appliances/repair-service/hyderabad`.
   - Confirm initial HTML contains `<h1>Appliance Repair Service Center in Hyderabad</h1>` and `<script type="application/ld+json">`.
