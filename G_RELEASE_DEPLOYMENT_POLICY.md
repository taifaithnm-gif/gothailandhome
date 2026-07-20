# G-RELEASE — Deployment Policy

**Gate:** G-RELEASE  
**Document ID:** GREL-DEPLOY-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## Policy

1. **Phase 1 does not authorize production deployment.**
2. Clearing G-RELEASE authorizes only the **recording** of a release-candidate engineering decision.
3. Deploy, DNS, CDN, Search Console, and production env changes require a **separate Owner directive** after human review.
4. CI / production configuration must not be modified by P1-36.
5. Empty or placeholder analytics / ads IDs remain inert until ops enablement.

## Approval

**APPROVED** under decision **GREL-D-006**.
