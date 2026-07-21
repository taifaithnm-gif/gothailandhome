# P2-052 — Bbox search API design

URL params: `bbox=south,west,north,east`, `district`, `listing_type`, `q`, `pin`.

Abuse controls:
- Reject invalid / inverted bbox
- Reject span > 0.35°
- Cap pins at 80
- Canonical metadata strips bbox (district/type/q only)
