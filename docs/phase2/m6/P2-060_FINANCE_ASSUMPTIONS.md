# P2-060 — Finance tool assumptions policy

- Formula: standard amortizing mortgage `M = P * r(1+r)^n / ((1+r)^n - 1)`
- Inputs: user-supplied principal, annual rate (0–30%), term (1–50y)
- Outputs labeled **illustrative estimate**
- Forbidden: loan offers, guaranteed rates, advice language
- Source: deterministic code in `src/lib/finance/mortgage.ts`
