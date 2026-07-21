# P2-050 — Map provider & tile policy

**Decision:** OpenStreetMap embed/tiles (no commercial API key).

| Topic | Policy |
| --- | --- |
| Provider | `openstreetmap` via OSM embed iframe |
| Privacy | No third-party tile API key; loads only when `FEATURE_P2_MAP` enabled |
| Coordinates | Project `latitude`/`longitude` only — never invent |
| Attribution | © OpenStreetMap contributors |

**Owner approval:** Accepted for Phase 2C MVP (engineering freeze).
