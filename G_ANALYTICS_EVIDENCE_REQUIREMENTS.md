# G-ANALYTICS — Evidence Requirements

**Gate:** G-ANALYTICS  
**Document ID:** GAN-EVID-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Required evidence for P1-31 / P1-32

| Check | Evidence |
| --- | --- |
| No script before consent | Test asserts no `googletagmanager` / gtag network load path when denied |
| Missing IDs inert | Empty env → fake adapter |
| No PII in payloads | Static scan of event property builders |
| Duplicate suppression | Unit test for 2s fingerprint window |
| Conversion after success only | Project lead fires only when `state.ok` |
| Provider failure isolation | Adapter catches errors; page remains usable |

## 2. Approval

**APPROVED** under decision **GAN-D-008**.
